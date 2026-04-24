let activeField = null;
let inlineButton = null;
let panel = null;

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!isEditable(target)) return;
  activeField = target;
  showInlineButton(target);
});

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 8) {
    showInlineButtonForSelection();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PROMPTUNO_GET_ACTIVE_TEXT") {
    sendResponse({ text: getCurrentText() });
    return;
  }

  if (message.type === "PROMPTUNO_INSERT_TEXT") {
    insertText(message.text || "");
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "PROMPTUNO_CONTEXT_IMPROVE") {
    improveText(message.text || getCurrentText());
    sendResponse({ ok: true });
  }
});

function showInlineButton(target) {
  removeInlineButton();
  const rect = target.getBoundingClientRect();
  inlineButton = document.createElement("button");
  inlineButton.className = "promptuno-inline-button";
  inlineButton.type = "button";
  inlineButton.textContent = "Promptuno";
  inlineButton.style.top = `${window.scrollY + rect.bottom + 8}px`;
  inlineButton.style.left = `${Math.min(window.scrollX + rect.right - 112, window.scrollX + window.innerWidth - 124)}px`;
  inlineButton.addEventListener("click", () => improveText(getCurrentText()));
  document.body.appendChild(inlineButton);
}

function showInlineButtonForSelection() {
  const range = window.getSelection()?.rangeCount ? window.getSelection().getRangeAt(0) : null;
  if (!range) return;
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) return;
  removeInlineButton();
  inlineButton = document.createElement("button");
  inlineButton.className = "promptuno-inline-button";
  inlineButton.type = "button";
  inlineButton.textContent = "Promptuno";
  inlineButton.style.top = `${window.scrollY + rect.bottom + 8}px`;
  inlineButton.style.left = `${window.scrollX + rect.left}px`;
  inlineButton.addEventListener("click", () => improveText(window.getSelection()?.toString() || ""));
  document.body.appendChild(inlineButton);
}

async function improveText(text) {
  const input = text.trim();
  if (!input) return;
  renderPanel("Working", "Promptuno is improving this text...", "");

  const response = await chrome.runtime.sendMessage({
    type: "PROMPTUNO_GENERATE",
    action: "cmd",
    platform: detectPlatform(),
    input,
    context: location.hostname
  });

  if (response?.paywall) {
    renderPaywall();
    return;
  }

  if (!response?.ok) {
    renderPanel("Could not improve", response?.error || "Try again in a moment.", "");
    return;
  }

  renderPanel("Promptuno result", response.result.note || "Ready to insert.", response.result.output);
}

function renderPanel(title, note, output) {
  removePanel();
  const anchor = activeField?.getBoundingClientRect?.() || { top: 80, left: 16, bottom: 160, right: 360 };
  panel = document.createElement("div");
  panel.className = "promptuno-panel";
  panel.style.top = `${window.scrollY + Math.max(16, anchor.bottom + 12)}px`;
  panel.style.left = `${Math.min(window.scrollX + Math.max(12, anchor.left), window.scrollX + window.innerWidth - 380)}px`;
  panel.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(note)}</p>
    ${output ? `<textarea>${escapeHtml(output)}</textarea>
    <div class="promptuno-actions">
      <button data-insert>Insert</button>
      <button class="secondary" data-copy>Copy</button>
      <button class="secondary" data-close>Close</button>
    </div>` : `<div class="promptuno-actions"><button class="secondary" data-close>Close</button></div>`}
  `;
  document.body.appendChild(panel);
  panel.querySelector("[data-insert]")?.addEventListener("click", () => insertText(panel.querySelector("textarea").value));
  panel.querySelector("[data-copy]")?.addEventListener("click", () => navigator.clipboard.writeText(panel.querySelector("textarea").value));
  panel.querySelector("[data-close]")?.addEventListener("click", removePanel);
}

function renderPaywall() {
  removePanel();
  panel = document.createElement("div");
  panel.className = "promptuno-panel";
  panel.style.top = `${window.scrollY + 90}px`;
  panel.style.left = `${Math.max(12, window.scrollX + window.innerWidth - 380)}px`;
  panel.innerHTML = `
    <h3>You've reached your free prompt limit.</h3>
    <p>Upgrade to Promptuno Pro to keep generating prompts without interruption.</p>
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
      <input type="hidden" name="cmd" value="_xclick" />
      <input type="hidden" name="business" value="AFI5@OUTLOOK.COM" />
      <input type="hidden" name="item_name" value="Promptuno Pro monthly access" />
      <input type="hidden" name="amount" value="15.00" />
      <input type="hidden" name="currency_code" value="USD" />
      <input type="hidden" name="no_shipping" value="1" />
      <input type="hidden" name="custom" value="promptuno-pro-extension-inline" />
      <button type="submit">Pay with PayPal</button>
    </form>
    <div class="promptuno-actions"><button class="secondary" data-close>Close</button></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector("[data-close]")?.addEventListener("click", removePanel);
}

function insertText(text) {
  if (!activeField) activeField = document.activeElement;
  if (!activeField) return;

  if (activeField.tagName === "TEXTAREA" || activeField.tagName === "INPUT") {
    activeField.value = text;
    activeField.dispatchEvent(new Event("input", { bubbles: true }));
    activeField.focus();
    return;
  }

  if (activeField.isContentEditable) {
    activeField.textContent = text;
    activeField.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    activeField.focus();
  }
}

function getCurrentText() {
  const selection = window.getSelection()?.toString().trim();
  if (selection) return selection;
  const target = activeField || document.activeElement;
  if (!target) return "";
  if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return target.value || "";
  if (target.isContentEditable) return target.textContent || "";
  return "";
}

function detectPlatform() {
  const host = location.hostname;
  if (host.includes("claude")) return "Claude";
  if (host.includes("gemini") || host.includes("google")) return "Gemini";
  if (host.includes("copilot") || host.includes("office") || host.includes("outlook")) return "Copilot";
  return "ChatGPT";
}

function isEditable(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "TEXTAREA" || tag === "INPUT" || target.isContentEditable;
}

function removeInlineButton() {
  inlineButton?.remove();
  inlineButton = null;
}

function removePanel() {
  panel?.remove();
  panel = null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
