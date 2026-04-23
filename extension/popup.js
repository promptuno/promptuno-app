const state = {
  mode: "improve",
  platform: "ChatGPT",
  output: "",
  questions: [],
  lastInput: ""
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
  refineBox: document.getElementById("refineBox"),
  questions: document.getElementById("questions"),
  editorPanel: document.getElementById("editorPanel"),
  libraryPanel: document.getElementById("libraryPanel"),
  savedList: document.getElementById("savedList"),
  historyList: document.getElementById("historyList")
};

init();

async function init() {
  await refreshUsage();
  await loadActiveSelection();
  bindEvents();
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
    });
  });

  els.generate.addEventListener("click", handleGenerate);
  els.copyOutput.addEventListener("click", () => navigator.clipboard.writeText(state.output));
  els.saveOutput.addEventListener("click", saveOutput);
  els.insertOutput.addEventListener("click", insertOutput);
}

async function loadActiveSelection() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "PROMPTUNO_GET_ACTIVE_TEXT" }, (response) => {
    if (chrome.runtime.lastError || !response?.text) return;
    els.input.value = response.text;
  });
}

function renderMode() {
  const isLibrary = state.mode === "library";
  els.editorPanel.classList.toggle("hidden", isLibrary);
  els.libraryPanel.classList.toggle("hidden", !isLibrary);
  els.refineBox.classList.add("hidden");
  els.status.textContent = "";

  if (state.mode === "improve") {
    els.input.placeholder = "Paste a rough prompt and Promptuno will make it clearer, stronger, and easier for AI to answer...";
    els.generate.textContent = "Improve Prompt";
  }

  if (state.mode === "refine") {
    els.input.placeholder = "Paste a vague idea. Promptuno will ask only the useful questions before improving it...";
    els.generate.textContent = "Start Refine";
  }

  if (state.mode === "write") {
    els.input.placeholder = "Describe the email, reply, follow-up, or work text you need...";
    els.generate.textContent = "Generate Text";
  }

  if (isLibrary) {
    renderLibrary();
  }
}

async function handleGenerate() {
  const usage = await getUsage();
  if (usage.isLimitReached) {
    showPaywall();
    return;
  }

  const input = els.input.value.trim();
  if (!input) {
    els.status.textContent = "Write or select something first.";
    return;
  }

  if (state.mode === "refine" && state.questions.length === 0) {
    const questions = buildQuestions(input);
    if (questions.length) {
      renderQuestions(questions);
      state.questions = questions;
      state.lastInput = input;
      els.generate.textContent = "Generate Refined Prompt";
      return;
    }
  }

  const refinedAnswers = [...document.querySelectorAll("[data-question-answer]")]
    .map((inputEl) => inputEl.value.trim())
    .filter(Boolean);
  const finalInput = refinedAnswers.length
    ? `${state.lastInput || input}\n\nAdditional context:\n${refinedAnswers.map((answer, index) => `${index + 1}. ${answer}`).join("\n")}`
    : input;

  setBusy(true);
  const response = await chrome.runtime.sendMessage({
    type: "PROMPTUNO_GENERATE",
    action: state.mode === "write" ? "write" : state.mode === "refine" ? "refine" : "improve",
    platform: state.platform,
    input: finalInput,
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
  state.questions = [];
  els.refineBox.classList.add("hidden");
  await refreshUsage();
}

function renderQuestions(questions) {
  els.questions.innerHTML = "";
  questions.forEach((question) => {
    const wrap = document.createElement("div");
    wrap.className = "question";
    wrap.innerHTML = `
      <label>${escapeHtml(question)}</label>
      <input data-question-answer type="text" placeholder="Short answer" />
    `;
    els.questions.appendChild(wrap);
  });
  els.refineBox.classList.remove("hidden");
}

function buildQuestions(input) {
  const words = input.split(/\s+/).filter(Boolean);
  const vague = words.length < 16 || !/[.!?]/.test(input) || /thing|stuff|something|help|make it|better/i.test(input);
  if (!vague) return [];

  return [
    "What should the final answer help you accomplish?",
    "Who is the audience or target user?",
    "What tone or format would be most useful?"
  ];
}

async function saveOutput() {
  if (!state.output) return;
  await chrome.runtime.sendMessage({
    type: "PROMPTUNO_SAVE_PROMPT",
    title: `${state.platform} prompt`,
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
    container.innerHTML += `<div class="list-item"><span>No items yet. Improve or save a prompt to build your workspace.</span></div>`;
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
  els.generate.textContent = isBusy ? "Working..." : state.mode === "write" ? "Generate Text" : state.mode === "refine" ? "Generate Refined Prompt" : "Improve Prompt";
  els.status.textContent = isBusy ? "Promptuno is shaping the result..." : "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
