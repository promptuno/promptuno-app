import { Language } from "../types";

const englishCopy = {
  modes: {
    General: "General",
    Image: "Image",
    Code: "Code",
    Vibe: "Vibe",
  },
  placeholders: {
    General: "Describe what you want the AI to do. Promptuno will engineer the best prompt for {platform}...",
    Image: "Describe the subject, style, mood, composition, and details you want in the final image prompt...",
    Code: "Describe the feature, bug, stack, constraints, and output you want the coding prompt to produce...",
    Vibe: "Describe the tone, brand feel, creative direction, or aesthetic you want Promptuno to sharpen...",
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
    PromptMode: "Prompt focus",
    WriteMode: "Prompt focus",
    Prompt: "prompt",
    Writing: "prompt",
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
