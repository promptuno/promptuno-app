import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate", async (req, res) => {
    const { systemInstruction, contents } = req.body || {};

    if (typeof systemInstruction !== "string" || typeof contents !== "string") {
      res.status(400).json({ error: "Missing generation instructions." });
      return;
    }

    try {
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
        res.status(response.status).json({
          error: getPollinationsError(response.status, payload),
        });
        return;
      }

      const text = payload?.choices?.[0]?.message?.content;

      if (typeof text !== "string" || !text.trim()) {
        res.status(502).json({ error: "The AI provider returned an empty response." });
        return;
      }

      res.json({ text });
    } catch (error) {
      console.error("Pollinations generation error:", error);
      res.status(502).json({
        error: "Could not reach the free public AI API. Please try again.",
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
