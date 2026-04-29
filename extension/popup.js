const state = {
  mode: "prompt",
  platform: "ChatGPT",
  output: ""
};

const els = {
  usagePill: document.getElementById("usagePill"),
  paywall: document.getElementById("paywall"),
  workspace: document.getElementById("workspace"),
  modes: [...document.querySelectorAll(".mode")],
  platforms: [...document.querySelectorAll(".platform")],
  input: document.getElementById("input"),
  generate: document.getElementById("generate"),
  status: document.getElementById("status"),
  outputWrap: document.getElementById("outputWrap"),
  output: document.getElementById("output"),
  copyOutput: document.getElementById("copyOutput"),
  saveOutput: document.getElementById("saveOutput"),
  insertOutput: document.getElementById("insertOutput"),
  editorPanel: document.getElementById("editorPanel"),
  libraryPanel: document.getElementById("libraryPanel"),
  savedList: document.getElementById("savedList"),
  historyList: document.getElementById("historyList")
};

const modeMeta = {
  prompt: {
    label: "Prompt",
    hint: "Clear, direct prompt generation for everyday prompting.",
    placeholder: "Paste a rough prompt or describe what you want the AI to do..."
  },
  image: {
    label: "Image",
    hint: "Sharpen subject, style, lighting, and composition.",
    placeholder: "Describe the scene, style, lighting, composition, and image details you want..."
  },
  vibe: {
    label: "Vibe Code",
    hint: "Turn rough product and component ideas into terminal-clean build prompts.",
    placeholder: "Describe the feature, component, stack, UX direction, constraints, and exact output you want from the vibe coding prompt..."
  }
};

init();

async function init() {
  await refreshUsage();
  await loadActiveSelection();
  bindEvents();
  renderMode();
  await renderLibrary();
}

function bindEvents() {
  els.modes.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      els.modes.forEach((item) => item.classList.toggle("active", item === button));
      renderMode();
    });
  });

  els.platforms.forEach((button) => {
    button.addEventListener("click", () => {
      state.platform = button.dataset.platform;
      els.platforms.forEach((item) => item.classList.toggle("active", item === button));
      renderMode();
    });
  });

  els.generate.addEventListener("click", handleGenerate);
  els.copyOutput.addEventListener("click", () => navigator.clipboard.writeText(state.output));
  els.saveOutput.addEventListener("click", saveOutput);
  els.insertOutput.addEventListener("click", insertOutput);
}

async function loadActiveSelection() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    const detectedPlatform = detectPlatformFromUrl(tab.url);
    if (detectedPlatform) {
      state.platform = detectedPlatform;
      els.platforms.forEach((item) => item.classList.toggle("active", item.dataset.platform === detectedPlatform));
    }
  }

  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "PROMPTUNO_GET_ACTIVE_TEXT" }, (response) => {
    if (chrome.runtime.lastError || !response?.text) return;
    els.input.value = response.text;
  });
}

function renderMode() {
  const meta = modeMeta[state.mode] || modeMeta.prompt;
  document.body.dataset.mode = state.mode;
  els.editorPanel.classList.remove("hidden");
  els.libraryPanel.classList.add("hidden");
  els.status.textContent = "";
  els.input.placeholder = meta.placeholder;
  document.getElementById("modeHint").textContent = meta.hint;
  els.generate.textContent = "Generate Prompt";
}

async function handleGenerate() {
  const usage = await getUsage();
  if (usage.isLimitReached) {
    showPaywall();
    return;
  }

  const input = els.input.value.trim();
  if (!input) {
    els.status.textContent = "Type or select text first.";
    return;
  }

  setBusy(true);
  const response = await chrome.runtime.sendMessage({
    type: "PROMPTUNO_GENERATE",
    action: state.mode,
    platform: state.platform,
    input,
    context: "Promptuno Chrome extension popup"
  });
  setBusy(false);

  if (response?.paywall) {
    showPaywall();
    return;
  }

  if (!response?.ok) {
    els.status.textContent = response?.error || "Promptuno could not generate right now.";
    return;
  }

  state.output = response.result.output;
  els.output.textContent = state.output;
  els.outputWrap.classList.remove("hidden");
  els.status.textContent = response.result.note || "Ready.";
  await renderLibrary();
  await refreshUsage();
}

async function saveOutput() {
  if (!state.output) return;
  await chrome.runtime.sendMessage({
    type: "PROMPTUNO_SAVE_PROMPT",
    title: `${state.platform} ${modeMeta[state.mode]?.label || capitalize(state.mode)} prompt`,
    text: state.output
  });
  els.status.textContent = "Saved locally.";
}

async function insertOutput() {
  if (!state.output) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "PROMPTUNO_INSERT_TEXT", text: state.output });
  window.close();
}

async function renderLibrary() {
  const [saved, history] = await Promise.all([
    chrome.runtime.sendMessage({ type: "PROMPTUNO_SAVED" }),
    chrome.runtime.sendMessage({ type: "PROMPTUNO_HISTORY" })
  ]);

  renderList(els.savedList, "Saved prompts", saved || []);
  renderList(els.historyList, "Prompt history", history || []);
}

function renderList(container, title, items) {
  container.innerHTML = `<div class="mini-title">${title}</div>`;
  if (!items.length) {
    container.innerHTML += `<div class="list-item"><span>No items yet. Generate or save a prompt to build your workspace.</span></div>`;
    return;
  }

  items.slice(0, 5).forEach((item) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `<strong>${escapeHtml(item.title || item.action || "Prompt")}</strong><span>${escapeHtml((item.text || item.output || "").slice(0, 140))}</span>`;
    container.appendChild(div);
  });
}

async function refreshUsage() {
  const usage = await getUsage();
  els.usagePill.textContent = `${usage.remaining} / ${usage.limit} free`;
  if (usage.isLimitReached) showPaywall(false);
}

async function getUsage() {
  return chrome.runtime.sendMessage({ type: "PROMPTUNO_USAGE" });
}

function showPaywall(hideWorkspace = true) {
  els.paywall.classList.remove("hidden");
  if (hideWorkspace) els.workspace.classList.add("hidden");
}

function setBusy(isBusy) {
  els.generate.disabled = isBusy;
  els.generate.textContent = isBusy ? "Working..." : "Generate Prompt";
  els.status.textContent = isBusy ? "Promptuno is shaping the result..." : "";
}

function detectPlatformFromUrl(url) {
  const normalized = String(url).toLowerCase();
  if (normalized.includes("claude.ai")) return "Claude";
  if (normalized.includes("gemini.google.com") || normalized.includes("aistudio.google.com")) return "Gemini";
  if (
    normalized.includes("copilot.microsoft.com") ||
    normalized.includes("office.com") ||
    normalized.includes("outlook.live.com") ||
    normalized.includes("outlook.office.com")
  ) {
    return "Copilot";
  }
  if (normalized.includes("chatgpt.com") || normalized.includes("chat.openai.com")) return "ChatGPT";
  return null;
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
