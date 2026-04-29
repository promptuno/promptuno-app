const LIMIT = 5;
const USAGE_KEY = "promptuno_usage_count_v2";
const HISTORY_KEY = "promptuno_prompt_history";
const SAVED_KEY = "promptuno_saved_prompts";
const PRIMARY_MODELS = ["ChatGPT", "Claude", "Gemini", "Copilot"];
const PRO_PRICE = { display: "$15", amount: "15.00", currency: "USD" };

const MODEL_GUIDANCE = {
  ChatGPT: "structured writing, analysis, and workplace execution",
  Claude: "strategy, synthesis, and long-form thinking",
  Gemini: "research, productivity, and workflow planning",
  Copilot: "documents, meetings, email, and enterprise work"
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === "PROMPTUNO_USAGE") {
      sendResponse(await getUsage());
      return;
    }

    if (message.type === "PROMPTUNO_HISTORY") {
      sendResponse(await getList(HISTORY_KEY));
      return;
    }

    if (message.type === "PROMPTUNO_SAVED") {
      sendResponse(await getList(SAVED_KEY));
      return;
    }

    if (message.type === "PROMPTUNO_SAVE_PROMPT") {
      await appendList(SAVED_KEY, {
        id: crypto.randomUUID(),
        title: message.title || "Saved Prompt",
        text: message.text || "",
        createdAt: Date.now()
      });
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "PROMPTUNO_GENERATE") {
      const usage = await getUsage();
      if (usage.isLimitReached) {
        sendResponse({ ok: false, paywall: true, usage });
        return;
      }

      const result = await generateWithPromptuno(message);
      await incrementUsage();
      await appendList(HISTORY_KEY, {
        id: crypto.randomUUID(),
        action: message.action || "prompt",
        platform: message.platform || "ChatGPT",
        input: message.input || "",
        output: result.output,
        createdAt: Date.now()
      });
      sendResponse({ ok: true, result, usage: await getUsage() });
      return;
    }

    sendResponse({ ok: false, error: "Unknown Promptuno action." });
  })().catch((error) => {
    sendResponse({ ok: false, error: error.message || "Promptuno could not complete this action." });
  });
  return true;
});

async function getUsage() {
  const data = await chrome.storage.local.get([USAGE_KEY]);
  const count = Math.min(Number(data[USAGE_KEY] || 0), LIMIT);
  return {
    count,
    limit: LIMIT,
    remaining: Math.max(0, LIMIT - count),
    isLimitReached: count >= LIMIT
  };
}

async function incrementUsage() {
  const usage = await getUsage();
  await chrome.storage.local.set({ [USAGE_KEY]: Math.min(usage.count + 1, LIMIT) });
}

async function getList(key) {
  const data = await chrome.storage.local.get([key]);
  return Array.isArray(data[key]) ? data[key] : [];
}

async function appendList(key, item) {
  const current = await getList(key);
  await chrome.storage.local.set({ [key]: [item, ...current].slice(0, 30) });
}

async function generateWithPromptuno({ action = "prompt", input = "", platform = "ChatGPT", context = "" }) {
  const category = ["prompt", "image", "vibe"].includes(String(action).toLowerCase())
    ? String(action).toLowerCase()
    : "prompt";
  const cleanInput = input.trim();
  if (!cleanInput) throw new Error("Type or select text first.");

  const modeInstruction = category === "image"
    ? "Transform the user's rough text into a stronger image-generation prompt with subject, composition, style, lighting, detail, and useful exclusions."
    : category === "vibe"
      ? "Transform the user's rough text into a stronger vibe-coding prompt with stack, constraints, UX intent, output format, acceptance criteria, and a crisp terminal-style structure."
      : "Transform the user's rough text into a stronger prompt with clear role, objective, context, constraints, and output format.";

  const system = [
    "You are Promptuno, a premium prompt assistant.",
    `Prompt category: ${category}.`,
    "Do not copy another product's branding or voice.",
    "Keep the output practical, clean, direct, and useful.",
    `Optimize for ${platform}. Guidance: ${MODEL_GUIDANCE[platform] || "clear AI output"}.`,
    modeInstruction,
    "Return only JSON with keys: output, note."
  ].join("\n");

  const params = new URLSearchParams({
    model: "openai",
    json: "true",
    private: "true",
    temperature: "0.7",
    system
  });

  const payload = [
    `Context: ${context || "Browser extension"}`,
    `User text: ${cleanInput}`
  ].join("\n\n");

  const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(payload)}?${params.toString()}`);
  const text = await response.text();
  if (looksLikeHtmlDocument(text)) {
    throw new Error("The AI provider is temporarily unavailable. Please try again in a moment.");
  }
  if (!response.ok) {
    throw new Error(response.status === 429 ? "The free AI provider is busy. Try again in a moment." : "Promptuno could not generate right now.");
  }

  const parsed = parseOutput(text);
  return {
    output: parsed.output || text.trim(),
    note: parsed.note || "Prompt generated with Promptuno."
  };
}

function parseOutput(text) {
  const source = text.trim();
  if (looksLikeHtmlDocument(source)) {
    return { output: "", note: "The AI provider is temporarily unavailable. Please try again in a moment." };
  }
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || source;

  try {
    let parsed = JSON.parse(candidate);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return parsed;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return { output: source };
      }
    }
    return { output: source.replace(/^markdown\\?/i, "").trim() };
  }
}

function looksLikeHtmlDocument(text) {
  const source = String(text).trim().toLowerCase();
  return source.startsWith("<!doctype html") || source.startsWith("<html") || (source.includes("<body") && source.includes("</html>"));
}
