import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || "openai";
const POLLINATIONS_API_URL =
  process.env.POLLINATIONS_API_URL ||
  (POLLINATIONS_API_KEY
    ? "https://gen.pollinations.ai/v1/chat/completions"
    : "https://text.pollinations.ai/openai");

function getPollinationsError(status: number, payload: unknown) {
  if (status === 429) {
    return "The free public AI API is busy or rate-limited right now. Please wait a moment and try again.";
  }

  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;

    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }

  return "The AI provider could not generate a response. Please try again.";
}

function getOpenAIError(status: number, payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;

    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }

  if (status === 401) {
    return "OpenAI API authentication failed. Check the server OPENAI_API_KEY environment variable.";
  }

  if (status === 429) {
    return "OpenAI rate limit or quota was reached. Please check the OpenAI project billing and limits.";
  }

  return "OpenAI could not generate a response. Please try again.";
}

async function generateWithOpenAI(systemInstruction: string, contents: string) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: contents },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getOpenAIError(response.status, payload));
  }

  const text = payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenAI returned an empty response.");
  }

  return text;
}

async function generateWithPollinations(systemInstruction: string, contents: string) {
  const response = await fetch(POLLINATIONS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(POLLINATIONS_API_KEY
        ? { Authorization: `Bearer ${POLLINATIONS_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      model: POLLINATIONS_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: contents },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getPollinationsError(response.status, payload));
  }

  const text = payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("The AI provider returned an empty response.");
  }

  return text;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.post("/api/generate", async (req, res) => {
    const { systemInstruction, contents } = req.body || {};

    if (typeof systemInstruction !== "string" || typeof contents !== "string") {
      res.status(400).json({ error: "Missing generation instructions." });
      return;
    }

    try {
      const text = OPENAI_API_KEY
        ? await generateWithOpenAI(systemInstruction, contents)
        : await generateWithPollinations(systemInstruction, contents);

      res.json({ text });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(502).json({
        error: error instanceof Error ? error.message : "Could not reach the AI API. Please try again.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
