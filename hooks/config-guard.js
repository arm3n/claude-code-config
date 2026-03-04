// Config Guard — SessionStart hook
// Detects corrupted/reset .claude.json (missing MCP servers) and auto-restores from golden backup.
const fs = require("fs");
const path = require("path");

const configPath = path.join(process.env.HOME || process.env.USERPROFILE, ".claude.json");
const goldenPath = path.join(process.env.HOME || process.env.USERPROFILE, ".claude", ".claude.json.golden");
const logPath = path.join(process.env.HOME || process.env.USERPROFILE, ".claude", "config-guard.log");

const MIN_MCP_COUNT = 10;

function log(msg) {
  const ts = new Date().toISOString();
  fs.appendFileSync(logPath, `[${ts}] ${msg}\n`);
}

function main() {
  try {
    if (!fs.existsSync(goldenPath)) {
      // No golden backup — nothing to restore from
      process.exit(0);
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      log("RESTORE: .claude.json is missing or unparseable — restoring from golden backup");
      fs.copyFileSync(goldenPath, configPath);
      log("RESTORE: Done. Restart Claude Code to load MCPs.");
      // Tell Claude about it
      const result = { additionalContext: "CONFIG RESTORED: .claude.json was corrupted and has been restored from golden backup. Please tell the user to restart Claude Code for MCP servers to load." };
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }

    const mcpServers = config.mcpServers || {};
    const count = Object.keys(mcpServers).length;

    if (count < MIN_MCP_COUNT) {
      log(`RESTORE: .claude.json has only ${count} MCP servers (expected >=${MIN_MCP_COUNT}) — restoring from golden backup`);

      // Preserve session-specific fields from current config
      const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
      if (config.oauthAccount) golden.oauthAccount = config.oauthAccount;
      if (config.cachedGrowthBookFeatures) golden.cachedGrowthBookFeatures = config.cachedGrowthBookFeatures;

      fs.writeFileSync(configPath, JSON.stringify(golden, null, 2), "utf8");
      log(`RESTORE: Done. Merged golden backup (${Object.keys(golden.mcpServers || {}).length} MCPs) with current session data. Restart Claude Code to load MCPs.`);

      const result = { additionalContext: `CONFIG RESTORED: .claude.json had ${count} MCP servers but should have ${Object.keys(golden.mcpServers || {}).length}. Restored from golden backup. Tell the user to restart Claude Code for MCP servers to load.` };
      process.stdout.write(JSON.stringify(result));
    } else {
      // Config is healthy — sync golden backup if MCPs changed
      let golden;
      try { golden = JSON.parse(fs.readFileSync(goldenPath, "utf8")); } catch { golden = {}; }
      const goldenKeys = Object.keys(golden.mcpServers || {}).sort().join(",");
      const currentKeys = Object.keys(mcpServers).sort().join(",");
      if (goldenKeys !== currentKeys) {
        fs.writeFileSync(goldenPath, JSON.stringify(config, null, 2), "utf8");
        log(`GOLDEN UPDATED: MCP list changed (${Object.keys(golden.mcpServers || {}).length} → ${count}). Golden backup synced.`);
      }
    }
  } catch (err) {
    log(`ERROR: ${err.message}`);
  }
  process.exit(0);
}

main();
