/**
 * ChatGPT webchat automation — 3-function architecture for agent-browser eval.
 *
 * Split into chatgpt_inject / chatgpt_poll / chatgpt_extract because
 * agent-browser eval has a ~60s connection timeout, but GPT-5.4 Thinking
 * with web search can take 2-4 minutes. Each function completes fast (<5s).
 *
 * Prerequisites:
 * - Chrome launched with: chrome.exe --remote-debugging-port=9222 --user-data-dir=<temp-dir> https://chatgpt.com
 * - Logged into ChatGPT (email + password or verification code)
 * - GPT-5.4 Thinking model selected
 * - agent-browser connected: agent-browser --session chatgpt --cdp 9222
 *
 * Usage (inject all 3 functions via eval --stdin, then call sequentially):
 *   1. agent-browser eval --stdin < chatgpt-send.js        # load functions
 *   2. agent-browser eval "await chatgpt_inject('prompt')"  # send prompt (<2s)
 *   3. agent-browser eval "chatgpt_poll()"                  # poll until done
 *   4. agent-browser eval "chatgpt_extract()"               # get response text
 *
 * Or use the convenience wrapper chatgpt_send() for short/fast responses.
 *
 * IMPORTANT: DOM text extraction only works in real Chrome (not Playwright-launched).
 * Playwright/automated browsers strip innerText from assistant messages.
 *
 * Validated 2026-03-08 with GPT-5.4 Thinking. Tested: adversarial multi-paragraph
 * prompts, special characters, SAFE protocol, web search + extended thinking.
 */

/**
 * chatgpt_inject(prompt) — Start a new chat, inject prompt, click send.
 * Returns immediately after clicking send (~2s total).
 */
async function chatgpt_inject(prompt) {
  // Navigate to fresh chat and wait for stale signals to clear
  const newChatLink = document.querySelector('a[href="/"]');
  if (newChatLink) {
    newChatLink.click();
    // Wait for page to settle and stale good-response buttons to disappear
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      const staleBtn = document.querySelector('[data-testid="good-response-turn-action-button"]');
      const staleMsgs = document.querySelectorAll('[data-message-author-role="assistant"]');
      if (!staleBtn && staleMsgs.length === 0) break;
    }
  }

  // Escape for HTML injection into ProseMirror editor
  const escaped = prompt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '</p><p>');

  // Find ProseMirror editor
  const editor = document.querySelector('#prompt-textarea');
  if (!editor) throw new Error('ProseMirror editor (#prompt-textarea) not found');

  // Inject prompt
  editor.innerHTML = '<p>' + escaped + '</p>';
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  // Brief pause for ProseMirror to register input
  await new Promise(r => setTimeout(r, 300));

  // Click send button
  const sendBtn = document.querySelector('[data-testid="send-button"]');
  if (!sendBtn) throw new Error('Send button not found');
  sendBtn.click();

  return 'sent';
}

/**
 * chatgpt_poll() — Check if response is complete. Returns JSON string.
 * { done: true/false, generating: true/false, msgCount: N }
 * Call repeatedly with sleep between calls until done=true.
 */
function chatgpt_poll() {
  const goodBtn = document.querySelector('[data-testid="good-response-turn-action-button"]');
  const stopBtn = document.querySelector('[data-testid="stop-button"]');
  const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
  return JSON.stringify({ done: !!goodBtn, generating: !!stopBtn, msgCount: msgs.length });
}

/**
 * chatgpt_extract() — Get the last assistant message text.
 * Call only after chatgpt_poll() returns done=true.
 * Returns the full innerText of the last assistant message.
 */
function chatgpt_extract() {
  const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
  if (msgs.length === 0) throw new Error('No assistant messages found');
  return msgs[msgs.length - 1].innerText;
}

/**
 * chatgpt_send(prompt, maxWaitMs) — Convenience wrapper that does all 3 steps.
 * Works for fast responses (<60s). For Thinking model with web search,
 * use the 3-step approach instead (inject → poll loop → extract).
 */
async function chatgpt_send(prompt, maxWaitMs = 120000) {
  await chatgpt_inject(prompt);

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(r => setTimeout(r, 1000));

    const status = JSON.parse(chatgpt_poll());
    if (status.done) {
      await new Promise(r => setTimeout(r, 500));
      return chatgpt_extract();
    }
  }

  throw new Error('Timeout after ' + maxWaitMs + 'ms waiting for ChatGPT response');
}
