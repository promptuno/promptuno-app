import { Language } from "../types";

const englishCopy = {
  modes: {
    Prompt: "Prompt",
    Write: "Write",
  },
  placeholders: {
    Prompt: "Describe what you want the AI to do. Promptuno will engineer the best prompt for {platform}...",
    Write: "Paste rough notes, a messy draft, or the message you need. Promptuno will turn it into polished writing...",
  },
  buttons: {
    Prompt: "Generate Prompt",
    Write: "Write Output",
    NewGeneration: "New Generation",
    Upgrade: "Upgrade to Pro",
    MaybeLater: "Maybe Later",
    Unlock: "Upgrade to Unlock",
  },
  labels: {
    CreateFor: "Optimize for",
    PromptMode: "Prompt mode",
    WriteMode: "Write mode",
    Prompt: "prompt",
    Writing: "writing",
    WaitMessage: "Please wait a moment",
    Engineering: "Preparing {platform}",
    Forging: "Creating...",
    LimitReached: "Free Limit Reached",
    LimitDescription: "You've reached your 5 free generations. Upgrade to Promptuno Pro to keep creating prompts and polished writing without interruption.",
    LeftCount: "{count} Generations Left",
  },
  refinements: {
    Concise: "Make Shorter",
    Technician: "Sharpen",
    Reforge: "Regenerate",
    Corporate: "Formalize",
    Creative: "Make Friendlier",
    Adapt: "Adapt Model",
  },
  loading: {
    Scanning: "Reading the request for {platform}...",
    Architecting: "Structuring the best result...",
    Optimizing: "Polishing the final output...",
  },
};

export const translations: Record<Language, typeof englishCopy> = {
  en: englishCopy,
  fr: englishCopy,
  ar: englishCopy,
  tr: englishCopy,
  ru: englishCopy,
};

export type TranslationType = typeof translations.en;
