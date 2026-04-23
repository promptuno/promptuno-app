import { Platform } from "../types";

export const PRIMARY_MODEL_LIMIT = 4;

export const modelGuidance: Partial<Record<Platform, string>> = {
  ChatGPT: "Structured prompts for writing, analysis, and workplace tasks.",
  Claude: "Deeper prompts for strategy, synthesis, and long-form thinking.",
  Gemini: "Prompts for productivity, workflows, and research.",
  Copilot: "Prompts for documents, meetings, and enterprise work.",
  Perplexity: "Research-oriented prompts for sourced exploration.",
  "Claude Code": "Agent prompts for careful multi-file coding work.",
  Cursor: "IDE-native prompts for edits, refactors, and app changes.",
  Windsurf: "Workflow prompts for building and iterating in the editor.",
  Codex: "Precise prompts for code agents, tests, and repo work.",
  Aider: "Terminal coding prompts for focused patch-based changes.",
  "Bolt.new": "App-building prompts for fast prototypes and UI flows.",
  Midjourney: "Visual prompts with composition, lighting, and style.",
  "DALL-E 3": "Image prompts with clear subject and scene control.",
};

export const premiumLayers = [
  {
    title: "Prompt History",
    description: "Return to the prompts that worked and build a stronger personal prompt library.",
  },
  {
    title: "Saved Prompts",
    description: "Keep reusable prompts, brand instructions, and repeat workflows ready.",
  },
  {
    title: "Prompt Packs",
    description: "Curated prompt sets for launches, research, marketing, sales, and operations.",
  },
  {
    title: "Role Templates",
    description: "Structured templates for founders, creators, operators, analysts, and teams.",
  },
  {
    title: "Compare Mode",
    description: "Compare prompt versions before copying the strongest one into your AI tool.",
  },
  {
    title: "Advanced Modes",
    description: "More control over tone, depth, format, platform adaptation, and output style.",
  },
];
