import { Language } from "../types";

const englishCopy = {
  modes: {
    Prompt: "Prompt",
    Image: "Image",
    Vibe: "Vibe Code",
  },
  placeholders: {
    Prompt: "Describe what you want the AI to do. Promptuno will engineer a clean, strong prompt for {platform}...",
    Image: "Describe the subject, style, mood, composition, and details you want in the final image prompt...",
    Vibe: "Describe the feature, product idea, stack, style, and constraints you want in a terminal-clean vibe coding prompt...",
  },
  buttons: {
    Generate: "Generate Prompt",
    NewGeneration: "New Generation",
    Upgrade: "Upgrade to Pro",
    MaybeLater: "Maybe Later",
    Unlock: "Upgrade to Unlock",
  },
  labels: {
    CreateFor: "Optimize for",
    Prompt: "prompt",
    WaitMessage: "Please wait a moment",
    Engineering: "Preparing {platform}",
    Forging: "Generating...",
    LimitReached: "Free Limit Reached",
    LimitDescription: "You've reached your 5 free prompt generations. Upgrade to Promptuno Pro to keep generating without interruption.",
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
