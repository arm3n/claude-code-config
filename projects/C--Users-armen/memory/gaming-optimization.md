# Gaming Optimization — Completed 2026-02-27

## System Specs
- i9-13900K (24C/32T), RTX 5090, 32GB DDR5-6000 G.Skill
- ASUS PRIME Z790-P WIFI, BIOS 1821, Microcode 0x12F
- WD_BLACK SN850X 2TB NVMe + Crucial MX500 4TB SATA SSD
- 5120x2160 @ 165Hz G-Sync, Intel X550-T2 10GbE
- Windows 11 Pro Build 26200 (25H2)

## Applied Fixes
- **Fix 0**: Driver 595.59→591.86 via DDU (595.59 pulled Feb 26). Fast Startup OFF
- **Fix 1**: Balanced power plan (Thread Director), USB Suspend OFF, PCIe ASPM OFF
- **Fix 2**: VBS/Hyper-V disabled — required BIOS VT-x disable on 25H2 (registry/bcdedit insufficient)
- **Fix 3**: Verified — Microcode 0x12F > 0x12B, BIOS/XMP/ReBAR all correct
- **Fix 4**: NVCP global profile (applied manually — NV Profile Inspector CLI broken)
- **Fix 5**: Mouse acceleration OFF (MouseSpeed/Threshold 0/0/0)
- **Fix 6**: Nagle OFF, throttling OFF, DNS 1.1.1.1, X550-T2 tuned

## Skipped (Gemini-verified low impact)
- MMCSS (P3): near-zero on 24-core, audio risk
- ISLC (P3): unnecessary at 32GB / 25H2
- Visual/startup (P3): zero FPS gain on 5090. ICNow = ICRealtime NVR client

## Intel XTU — UNINSTALLED (2026-03-03)
- Removed via `winget uninstall Intel.IntelExtremeTuningUtility`
- Was loading `iocbios2.sys` kernel driver + 18 XTUComponent device entries at boot
- Reason: BSOD crash analysis showed kernel bug in `nt!KiSendHeteroRescheduleIntRequestHelper` (heterogeneous CPU scheduler for P/E-cores). XTU manipulates core behavior and could exacerbate Thread Director scheduling bugs.
- Not actively used for overclocking — safe to remove

## BSOD Crash Analysis (2026-03-03)
- **Bugcheck:** 0x0A (IRQL_NOT_LESS_OR_EQUAL) at ~5:41 PM
- **Faulting function:** `nt!KiSendHeteroRescheduleIntRequestHelper+0x58b` (ntkrnlmp.exe 10.0.26100.7824)
- **Root cause:** Windows kernel bug in hybrid CPU scheduler (Thread Director P/E-core rescheduling). NULL pointer write at DISPATCH_LEVEL.
- **Process context:** ICNow.exe (coincidental — any process could trigger)
- **NOT caused by:** NVIDIA driver, Sandboxie, or hardware (no WHEA/thermal events)
- **Dump:** `C:\WINDOWS\Minidump\030326-22296-01.dmp` (copy at `~/crash.dmp`)
- **WinDbg installed** via winget for analysis (Microsoft.WinDbg 1.2601.12001.0)

## Key Research Corrections (137+ sources)
1. **Power plan**: Balanced > High Performance (Thread Director needs frequency stepping)
2. **NVCP V-Sync**: ON (not OFF) — Blurbusters G-Sync optimal combo
3. **Texture Filtering**: High Quality (not High Perf — pointless on flagship GPU)
4. **Frame cap**: NVCP driver-level 162 (not per-game/RTSS — DLSS 4 MFG compat)
5. **DLSS preset**: Balanced at 5K2K (3.7MP internal ≈ 4K Quality 3.69MP)
6. **VBS on 25H2**: Registry+DISM+bcdedit all insufficient — must disable VT-x in BIOS

## NVCP Optimal Settings
- Power Management: Prefer Max Performance
- Low Latency Mode: On (Off for Reflex games)
- Texture Filtering Quality: High Quality
- Shader Cache Size: Unlimited
- V-Sync: On (Blurbusters G-Sync combo)
- Max Frame Rate: 162
- G-Sync: Enabled, Preferred Refresh: Highest

## In-Game Template
- DLSS Balanced (Preset K) for RT-heavy AAA; Quality for lighter titles
- Reflex On+Boost in supported games
- V-Sync OFF in-game (NVCP handles G-Sync fallback)
- Frame cap: let NVCP 162 handle it globally

## Research Reports
- `~/gaming-optimization/COMPLETED-2026-02-27.md` (master summary)
- `~/gaming-optimization/plan.md` (original 11-fix plan)
- `~/gaming-optimization/frame-cap-method-research-2026-02-27.md` (27 sources)
- `~/gaming-optimization/frame-limiter-latency-research-2026-02-27.md` (18 sources)
- `~/gaming-optimization/dlss-5k2k-preset-research-2026-02-27.md` (25 sources)

## Driver Status
- **Current**: 591.86 (stable, no fan bug — that was introduced in 595.59)
- **595.59**: PULLED Feb 26 (fan detection/spin regression)
- **595.71**: Released Mar 2, fixes fan bugs. NOT yet safe — RTX 5090 voltage/power cap (~0.95V/2920MHz/250W) unresolved, zero benchmarks vs 591.86. RE Requiem PT regression affects both Ada (severe) and Blackwell (mild).
- **High-bandwidth display classification**: Blackwell architectural (NOT driver-specific), present since launch. Forces display scaling above 1620MHz pixel clock. No practical impact at native res with DLSS. G-Sync unaffected.
- **Action**: Wait for community testing + voltage cap fix before upgrading. Bead `gaming-opt-vh6`.

## Beads
- Project: `~/gaming-optimization`, prefix `gaming-opt`, stealth mode
- 11 original issues closed (7 applied, 3 skipped, 1 verified-no-action)
- `gaming-opt-vh6`: Check 595.71 driver safety after community testing (open, P2)

## Lessons Learned
- NV Profile Inspector v2.4.0.31: `/setBaseProfile` and `/import` CLI both broken; use NVCP GUI
- Win11 25H2 VBS: extremely persistent — 3 rounds of registry/bcdedit failed; only BIOS VT-x works
- Gemini `gemini-analyze-text` with type `general` gives structural analysis, not fact-checking — phrase prompts as explicit verification questions
- PowerShell `$variables` in bash heredoc: must use `<< 'EOF'` (quoted) or write to temp .ps1 file
- Admin elevation from Claude Code: `Start-Process -Verb RunAs` unreliable; write .cmd files for user to right-click > Run as administrator
