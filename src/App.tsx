import React, { useState, useEffect } from "react";
import { AppMode, GeneratedPrompt, Platform } from "./types";
import { useUsageLimit } from "./hooks/useUsageLimit";
import { useTheme } from "./hooks/useTheme";
import { Composer } from "./components/Composer";
import { PromptResponse } from "./components/PromptResponse";
import { Pricing } from "./components/Pricing";
import { ThemeToggle } from "./components/ThemeToggle";
import { LegalView } from "./components/LegalView";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Download, X } from "lucide-react";

import { AnalysisLoader } from "./components/AnalysisLoader";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { SemanticErrorModal } from "./components/SemanticErrorModal";
import { Logo } from "./components/Logo";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { translations } from "./lib/translations";
import { Language } from "./types";

type View = "app" | "pricing" | "privacy" | "terms";

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

function extractJsonObject(text: string) {
  const source = text.trim();
  const fencedJson = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedJson?.[1]?.trim() || source;

  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    return candidate;
  }

  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < candidate.length; i++) {
    const char = candidate[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth++;
    if (char === "}") depth--;

    if (depth === 0) {
      return candidate.slice(start, i + 1);
    }
  }

  return null;
}

function parseGeneratedPrompt(text: string, platform: Platform, lang: Language): GeneratedPrompt {
  const jsonObject = extractJsonObject(text);

  if (jsonObject) {
    try {
      const parsed = JSON.parse(jsonObject);
      if (parsed && typeof parsed === "object" && parsed.engineeredPrompt) {
        return {
          isNonsense: Boolean(parsed.isNonsense),
          goal: String(parsed.goal || `Prompt architecture for ${platform}`),
          engineeredPrompt: String(parsed.engineeredPrompt),
          explanation: String(parsed.explanation || "Generated from the user's request."),
        };
      }
    } catch {
      // Fall through to the text wrapper below.
    }
  }

  const normalized = text
    .replace(/^```(?:markdown|md|text)?/i, "")
    .replace(/```$/i, "")
    .replace(/^markdown\\?/i, "")
    .trim();

  return {
    isNonsense: false,
    goal: `Prompt architecture for ${platform}`,
    engineeredPrompt: normalized || text,
    explanation:
      lang === "fr"
        ? "Le fournisseur a renvoye du texte au lieu d'un JSON strict, donc Promptuno l'a converti en reponse utilisable."
        : "The provider returned text instead of strict JSON, so Promptuno converted it into a usable response.",
  };
}

async function generatePromptResponse(systemInstruction: string, contents: string) {
  const strictSystemInstruction = `${systemInstruction}

CRITICAL OUTPUT RULE: Return only one valid JSON object matching the requested schema. Do not return markdown, code fences, prose outside JSON, or labels like "markdown".`;
  const isStaticHost =
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.hostname.endsWith("pages.dev") ||
      window.location.hostname.endsWith("netlify.app"));

  if (API_BASE_URL || !isStaticHost) {
    const localResponse = await fetch(`${API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: strictSystemInstruction,
        contents,
      }),
    }).catch(() => null);

    if (localResponse?.ok) {
      return localResponse.json();
    }

    const shouldFallback =
      !localResponse ||
      localResponse.status === 404 ||
      localResponse.status === 405 ||
      localResponse.headers.get("content-type")?.includes("text/html");

    if (!shouldFallback) {
      const payload = await localResponse.json().catch(() => null);
      throw new Error(payload?.error || "Failed to generate prompt. Please try again.");
    }
  }

  const params = new URLSearchParams({
    model: "openai",
    json: "true",
    private: "true",
    temperature: "0.7",
    system: strictSystemInstruction,
  });
  const publicResponse = await fetch(
    `https://text.pollinations.ai/${encodeURIComponent(contents)}?${params.toString()}`,
  );

  const text = await publicResponse.text().catch(() => "");

  if (!publicResponse.ok) {
    const message =
      publicResponse.status === 429
        ? "The free public AI API is busy or rate-limited right now. Please wait a moment and try again."
        : text || "Failed to generate prompt. Please try again.";
    throw new Error(message);
  }

  if (!text.trim()) {
    throw new Error("The AI provider returned an empty response.");
  }

  return { text };
}

export default function App() {
  const [mode, setMode] = useState<AppMode>("Forge");
  const [platform, setPlatform] = useState<Platform>("ChatGPT");
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<GeneratedPrompt | null>(null);
  const [view, setView] = useState<View>("app");
  
  const [error, setError] = useState<string | null>(null);
  const [semanticError, setSemanticError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("en");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallNotice, setShowInstallNotice] = useState(false);
  
  const t = translations[lang];

  const { count, isLimitReached, limit, increment, reset } = useUsageLimit();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed or dismissed
      const isDismissed = localStorage.getItem('install_notice_dismissed');
      if (!isDismissed) {
        setShowInstallNotice(true);
      }
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallNotice(false);
  };

  useEffect(() => {
    if (mode === "Code") setPlatform("Claude Code");
    else if (mode === "Image") setPlatform("Midjourney");
    else setPlatform("ChatGPT");
  }, [mode]);

  const handleGenerate = async (refinement?: string) => {
    const inputToUse = refinement || inputValue;
    console.log("handleGenerate called. Mode:", mode, "Input:", inputToUse, "Platform:", platform);
    
    if (!inputToUse.trim()) {
      return;
    }
    
    if (isGenerating || isAnalyzing) {
      return;
    }
    
    if (isLimitReached && !refinement) {
      return;
    }

    if (inputToUse.trim().toLowerCase() === "reset") {
      reset();
      setInputValue("");
      setIsGenerating(false);
      setCurrentResponse(null);
      return;
    }

    setIsGenerating(true);
    setCurrentResponse(null);
    setError(null);

    try {
      // 1. Kick off the AI process immediately
      const systemInstruction = mode === "Code" 
        ? `You are VibeCoder, the ultimate Prompt Architect for coding agents.
Your mission is to forge deep technical source prompts that empower ${platform} to execute logic perfectly.
RESPOND ENTIRELY IN ${lang.toUpperCase()} LANGUAGE.

Strict Protocols:
1. PROMPT ONLY: Never output settings, configurations, or non-prompt text. Everything must be a refined, premium prompt for the AI agent.
2. REFINEMENT MAX: Take the user's intent and refine it to its absolute technical peak.
3. CONTEXT PRESERVATION: You MUST explicitly consider and integrate the user's original words.
4. Nonsense Detection: If the user input is jibberish or lacks intent, return a JSON where 'isNonsense' is true and 'explanation' is exactly "Error: I cannot generate a coding architecture for this input.".
5. Vibe Coding style: Optimization for terminal tools and multi-file editing.

JSON structure:
{
  "isNonsense": boolean,
  "goal": "Persona + Logic Objective in ${lang.toUpperCase()}",
  "engineeredPrompt": "The terminal-optimized code source prompt in ${lang.toUpperCase()}",
  "explanation": "Compiler-level reasoning in ${lang.toUpperCase()}"
}
`
        : mode === "Image"
        ? `You are Promptuno Image Architect, an expert in high-fidelity generative art prompts for ${platform}.
Your mission is to transform user intent into ultra-realistic or stylized art prompts.
RESPOND ENTIRELY IN ${lang.toUpperCase()} LANGUAGE.

Strict Protocols:
1. ARTISTIC DEPTH: Use specific photographic terms, artistic styles, and technical parameters specific to ${platform}.
2. CONTEXT SYNC: Explicitly include the user's core keywords.
3. Nonsense Detection: If input is jibberish, return JSON with 'isNonsense' true and 'explanation' exactly "Error: I cannot generate an image prompt for this input.".
4. Deep Visualization: The 'engineeredPrompt' should be a masterpiece of descriptive art.

JSON structure:
{
  "isNonsense": boolean,
  "goal": "Artistic Vision + Style in ${lang.toUpperCase()}",
  "engineeredPrompt": "The master-tier image prompt in ${lang.toUpperCase()}",
  "explanation": "Lighting, composition reasoning in ${lang.toUpperCase()}"
}
`
        : `You are Promptuno, an AI Prompt Architect.
Your mission is to transform user intent into elite-tier prompts for ${platform}.
RESPOND ENTIRELY IN ${lang.toUpperCase()} LANGUAGE.

Strict Protocols:
1. CONTEXT SYNC: You MUST explicitly include and upgrade what the user said.
2. Nonsense Detection: If the input is jibberish, return JSON with 'isNonsense' true and 'explanation' exactly "Error: I cannot generate a prompt for this input.".
3. Deep Research: Cite specific advanced techniques based on the latest ${platform} capabilities.
4. Unique Reasoning: Every 'explanation' must be completely unique.
5. Elite Formatting: Use Markdown (###, -, >).

JSON structure:
{
  "isNonsense": boolean,
  "goal": "Persona + Objective in ${lang.toUpperCase()}",
  "engineeredPrompt": "The premium prompt architecture in ${lang.toUpperCase()}",
  "explanation": "Detailed architectural choices in ${lang.toUpperCase()}"
}
`;

      const aiPromise = generatePromptResponse(
        systemInstruction,
        `User said: "${inputToUse}". Forge the best ${mode === "Code" ? "coding system" : "prompt"} for ${platform}.`,
      );

      // 2. Short 1s buffer for the "Forging" button state to feel reactive
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. Transition to the Big Animation immediately while AI is still working
      setIsGenerating(false);
      setIsAnalyzing(true);
      const animationStart = Date.now();

      // 4. Wait for AI response
      const result = await aiPromise;
      const responseText = result.text;
      
      const data = parseGeneratedPrompt(responseText, platform, lang);
      
      if (data.isNonsense) {
        setIsAnalyzing(false);
        setSemanticError(data.explanation || "The input lacks discernible semantic intent. Please provide a more detailed objective.");
        return;
      }

      if (!data.engineeredPrompt) {
        throw new Error("Incomplete AI response");
      }
      
      // 5. Ensure the animation runs for at least a minimum time to feel premium
      const elapsed = Date.now() - animationStart;
      const minAnimationTime = 4000; // 4 seconds total of big animation
      const waitTime = Math.max(0, minAnimationTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      setIsAnalyzing(false);
      setCurrentResponse(data);
      increment();

    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate prompt. Please try again.");
      setIsGenerating(false);
      setIsAnalyzing(false);
    }
  };

  const handleRefine = async (type: "reforge" | "concise" | "technician") => {
    let refinementRequest = "";
    if (mode === "Code") {
      if (type === "concise") refinementRequest = `Refactor the following agent prompt for maximum token efficiency and direct execution: ${currentResponse?.engineeredPrompt}`;
      if (type === "technician") refinementRequest = `Inject extreme technical constraints, specific library patterns, and advanced architectural rules into this agent prompt: ${currentResponse?.engineeredPrompt}`;
      if (type === "reforge") refinementRequest = `Completely re-architect the following coding logic from a new system perspective: ${currentResponse?.engineeredPrompt}`;
    } else {
      if (type === "concise") refinementRequest = `Make the following prompt as concise as possible while keeping the core instructions: ${currentResponse?.engineeredPrompt}`;
      if (type === "technician") refinementRequest = `Upgrade the following prompt with extreme technical detail, specific constraints, and complex formatting structures: ${currentResponse?.engineeredPrompt}`;
      if (type === "reforge") refinementRequest = `Completely re-imagine the following prompt from a new specialized perspective, adding more deep search context: ${currentResponse?.engineeredPrompt}`;
    }

    handleGenerate(refinementRequest);
  };

  return (
    <motion.div 
      layout
      className={cn(
        "min-h-screen transition-all duration-500 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 overflow-x-hidden flex flex-col relative",
        mode === "Code" ? "bg-black text-green-500 font-mono" : (mode === "Image" ? "bg-white dark:bg-[#030303] text-purple-900 dark:text-purple-100" : "bg-white dark:bg-[#030303] text-neutral-800 dark:text-neutral-100")
      )}
    >
      {/* PWA Install Notice */}
      <AnimatePresence>
        {showInstallNotice && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-80 z-[100] backdrop-blur-2xl bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-white/10 p-5 rounded-[28px] shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-black uppercase tracking-tight">Install Promptuno</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Save Promptuno to your desktop or home screen for instant access.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowInstallNotice(false);
                  localStorage.setItem('install_notice_dismissed', 'true');
                }}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              Add to Desktop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse",
          mode === "Code" ? "bg-green-500/10" : (mode === "Image" ? "bg-purple-500/10" : "bg-indigo-500/5 dark:bg-indigo-500/10")
        )}></div>
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse",
          mode === "Code" ? "bg-green-500/10" : (mode === "Image" ? "bg-pink-500/20" : "bg-amber-500/5 dark:bg-amber-500/10")
        )} style={{ animationDelay: '2s' }}></div>
        
        {/* Code Mode Scanlines */}
        {mode === "Code" && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        )}
      </div>

      {/* Header - Simple */}
      <header className={cn(
        "h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-2xl border-b",
        mode === "Code" ? "bg-black/40 border-green-500/20" : (mode === "Image" ? "bg-white/40 dark:bg-black/40 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.05)]" : "bg-white/40 dark:bg-black/40 border-neutral-100 dark:border-white/5")
      )}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setView("app"); setCurrentResponse(null); }}
            className="flex items-center gap-2"
          >
            <Logo mode={mode} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className={cn(
            "hidden sm:flex items-center gap-2.5 px-3 md:px-4 py-1.5 rounded-full border shadow-inner",
            mode === "Code" ? "bg-green-500/5 border-green-500/20" : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-white/5"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isLimitReached ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]")}></div>
            <span className={cn(
              "text-[9px] md:text-[10px] font-black uppercase tracking-widest",
              mode === "Code" ? "text-green-500/50" : "text-neutral-400 dark:text-neutral-500"
            )}>{limit - count} {limit - count === 1 ? 'Forge' : 'Forges'} Left</span>
          </div>
          
          <LanguageSwitcher current={lang} onSelect={setLang} mode={mode} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-12 relative">
        <AnimatePresence mode="wait">
          {view === "app" && (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <ModeSwitcher mode={mode} onChange={setMode} />

              {!currentResponse ? (
                <div className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto w-full">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    <Composer 
                      value={inputValue} 
                      onChange={setInputValue} 
                      onSend={() => handleGenerate()}
                      disabled={isGenerating || isAnalyzing}
                      isGenerating={isGenerating || isAnalyzing}
                      platform={platform}
                      onPlatformChange={setPlatform}
                      mode={mode}
                      isLimitReached={isLimitReached}
                      onUpgrade={() => setView("pricing")}
                      lang={lang}
                    />
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "mt-6 p-4 rounded-3xl text-center border",
                          mode === "Code" ? "bg-red-500/5 border-red-500/20" : "bg-red-50/50 dark:bg-red-500/5 border-red-100/50 dark:border-red-500/10"
                        )}
                      >
                        <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest">{error}</span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="flex-1 max-w-4xl mx-auto w-full">
                   <PromptResponse 
                    request={inputValue} 
                    platform={platform} 
                    response={currentResponse} 
                    onRegenerate={() => handleGenerate()}
                    onRefine={handleRefine}
                    mode={mode}
                    lang={lang}
                  />
                  
                  {/* Floating Action Button to go back to input */}
                  <div className="sticky bottom-10 flex justify-center py-8">
                    <button 
                      onClick={() => { setCurrentResponse(null); setView("app"); setInputValue(""); }}
                      className={cn(
                        "shadow-2xl rounded-full px-10 py-3.5 text-[13px] font-bold hover:scale-105 active:scale-95 transition-all",
                        mode === "Code" ? "bg-green-500 text-black shadow-green-500/20" : "bg-black dark:bg-white text-white dark:text-black"
                      )}
                    >
                      {lang === 'fr' ? 'Nouvelle Génération' : (lang === 'ar' ? 'جيل جديد' : (lang === 'tr' ? 'Yeni Nesil' : (lang === 'ru' ? 'Новая генерация' : 'New Generation')))}
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Phase */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnalysisLoader platform={platform} mode={mode} lang={lang} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Modal */}
              <SemanticErrorModal 
                isOpen={!!semanticError}
                onClose={() => setSemanticError(null)}
                message={semanticError || ""}
                mode={mode}
              />

              {/* Skip pre-fetch loading modal as per user request */}
            </motion.div>
          )}

          {view === "pricing" && (
            <motion.div key="pricing" className="py-12 w-full">
              <Pricing />
              <div className="flex justify-center mt-12">
                <button onClick={() => setView("app")} className="text-xs font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">
                  Back to workspace
                </button>
              </div>
            </motion.div>
          )}

          {view === "privacy" && <LegalView key="privacy" type="privacy" onBack={() => setView("app")} />}
          {view === "terms" && <LegalView key="terms" type="terms" onBack={() => setView("app")} />}
        </AnimatePresence>
      </main>

      {/* Footer Minimal */}
      <footer className={cn(
        "px-8 py-6 flex items-center justify-between border-t backdrop-blur-sm",
        mode === "Code" ? "bg-black/50 border-green-500/10" : "bg-white/50 dark:bg-neutral-950/50 border-neutral-50 dark:border-neutral-900"
      )}>
        <div className="flex gap-6">
          <button onClick={() => setView("privacy")} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase tracking-widest transition-colors">{lang === 'fr' ? 'CONFIDENTIALITÉ' : (lang === 'ar' ? 'الخصوصية' : (lang === 'tr' ? 'GİZLİLİK' : (lang === 'ru' ? 'КОНФИДЕНЦИАЛЬНОСТЬ' : 'PRIVACY')))}</button>
          <button onClick={() => setView("terms")} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase tracking-widest transition-colors">{lang === 'fr' ? 'CONDITIONS' : (lang === 'ar' ? 'البنود' : (lang === 'tr' ? 'KOŞULLAR' : (lang === 'ru' ? 'УСЛОВИЯ' : 'TERMS')))}</button>
        </div>
        <span className="text-[10px] font-bold text-neutral-300 dark:text-neutral-700 tracking-widest uppercase">© 2026 PROMPTUNO</span>
      </footer>
    </motion.div>
  );
}
