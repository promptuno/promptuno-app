export type Platform =
  | "ChatGPT"
  | "Gemini"
  | "Claude"
  | "Copilot"
  | "Perplexity"
  | "Claude Code"
  | "Aider"
  | "Windsurf"
  | "Cursor"
  | "Bolt.new"
  | "Codex"
  | "Midjourney"
  | "DALL-E 3";

export type AppMode = "Forge" | "Code" | "Image";

export type Language = "en" | "fr" | "ar" | "tr" | "ru";

export interface GeneratedPrompt {
  isNonsense?: boolean;
  goal: string;
  engineeredPrompt: string;
  explanation: string;
}

export interface ThreadItem {
  id: string;
  request: string;
  platform: Platform;
  response: GeneratedPrompt;
  timestamp: number;
}
