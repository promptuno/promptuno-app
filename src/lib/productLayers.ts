import { Platform } from "../types";

export const PRIMARY_MODEL_LIMIT = 4;

export const modelGuidance: Partial<Record<Platform, string>> = {
  ChatGPT: "Structured prompts for analysis, planning, and workplace tasks.",
  Claude: "Deeper prompts for strategy, synthesis, and long-form thinking.",
  Gemini: "Prompts for productivity, workflows, and research.",
  Copilot: "Prompts for documents, meetings, and enterprise work.",
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
    description: "More control over prompt depth, tone direction, output format, platform adaptation, and style.",
  },
];
