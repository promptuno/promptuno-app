export type Platform =
  | "ChatGPT"
  | "Gemini"
  | "Claude"
  | "Copilot";

export type AppMode = "CMD" | "Image" | "Code" | "Vibe";

export type Language = "en" | "fr" | "ar" | "tr" | "ru";

export type RefinementType =
  | "concise"
  | "technician"
  | "corporate"
  | "creative"
  | "adapt";

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
