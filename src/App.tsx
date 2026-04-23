import React, { useState, useEffect } from "react";
import { AppMode, GeneratedPrompt, Platform, RefinementType } from "./types";
import { useUsageLimit } from "./hooks/useUsageLimit";
import { useTheme } from "./hooks/useTheme";
import { Composer } from "./components/Composer";
import { PromptResponse } from "./components/PromptResponse";
import { Pricing } from "./components/Pricing";
import { RefinePanel } from "./components/RefinePanel";
import { ThemeToggle } from "./components/ThemeToggle";
import { LegalView } from "./components/LegalView";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Download, X } from "lucide-react";

import { AnalysisLoader } from "./components/AnalysisLoader";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { SemanticErrorModal } from "./components/SemanticErrorModal";
import { Logo } from "./components/Logo";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
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

function parseGeneratedPrompt(text: string, platform: Platform, lang: Language, mode: AppMode): GeneratedPrompt {
  const jsonObject = extractJsonObject(text);

  if (jsonObject) {
    try {
      const parsed = JSON.parse(jsonObject);
      if (parsed && typeof parsed === "object" && parsed.engineeredPrompt) {
        return {
          isNonsense: Boolean(parsed.isNonsense),
          goal: String(parsed.goal || (mode === "Write" ? "Polished writing" : `Prompt architecture for ${platform}`)),
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
    goal: mode === "Write" ? "Polished writing" : `Prompt architecture for ${platform}`,
    engineeredPrompt: normalized || text,
    explanation:
      "The provider returned text instead of strict JSON, so Promptuno converted it into a usable response.",
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

function buildRefineQuestions(input: string, mode: AppMode, platform: Platform) {
  const text = input.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const hasHelpfulDetail =
    words.length > 32 &&
    /\b(for|audience|format|tone|goal|because|using|with|target|must|avoid)\b/i.test(text);

  if (hasHelpfulDetail) return [];

  const questions =
    mode === "Write"
      ? [
          "Who is this writing for?",
          "What tone should it have?",
          "What format should Promptuno return?",
        ]
      : [
          `Who is the ${platform} answer meant for?`,
          "What tone should the AI use?",
          "What format should the AI return?",
        ];

  if (words.length < 10) return questions;
  if (words.length < 22) return questions.slice(0, 2);
  return questions.slice(0, 1);
}

export default function App() {
  const [mode, setMode] = useState<AppMode>("Prompt");
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
  const [activeRequest, setActiveRequest] = useState("");
  const [refineQuestions, setRefineQuestions] = useState<string[]>([]);
  const [refineAnswers, setRefineAnswers] = useState<string[]>([]);
  
  const { isLimitReached, limit, remaining, increment, reset } = useUsageLimit();
  const { theme, toggleTheme } = useTheme();

  const handleInputChange = (nextValue: any) => {
    setInputValue((previous) => (typeof nextValue === "function" ? nextValue(previous) : nextValue));
    if (refineQuestions.length) {
      setRefineQuestions([]);
      setRefineAnswers([]);
    }
  };

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

  const handleGenerate = async (refinement?: string) => {
    const inputToUse = refinement || inputValue;
    console.log("handleGenerate called. Mode:", mode, "Input:", inputToUse, "Platform:", platform);
    
    if (!inputToUse.trim()) {
      return;
    }
    
    if (isGenerating || isAnalyzing) {
      return;
    }
    
    if (isLimitReached) {
      setCurrentResponse(null);
      setView("app");
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
    setActiveRequest(inputToUse);
    setCurrentResponse(null);
    setError(null);
    setRefineQuestions([]);
    setRefineAnswers([]);

    try {
      const systemInstruction = mode === "Write"
        ? `You are Promptuno Write, a premium writing assistant inside a prompt-first product.
Your mission is to transform rough notes, requests, and drafts into polished usable writing.
RESPOND ENTIRELY IN ${lang.toUpperCase()} LANGUAGE.

Strict Protocols:
1. WRITE DIRECTLY: Return polished content the user can copy and use immediately.
2. CONTEXT SYNC: Preserve the user's original intent, facts, audience, and constraints.
3. QUALITY: Make the writing clear, modern, calm, useful, and professional.
4. Nonsense Detection: If the input is gibberish or lacks intent, return JSON with 'isNonsense' true and 'explanation' exactly "Error: I cannot generate writing for this input.".
5. No Generic AI Suite: Stay focused on writing output, not unrelated tools.

JSON structure:
{
  "isNonsense": boolean,
  "goal": "Writing objective in ${lang.toUpperCase()}",
  "engineeredPrompt": "The polished writing/content output in ${lang.toUpperCase()}",
  "explanation": "Brief editorial reasoning in ${lang.toUpperCase()}"
}
`
        : `You are Promptuno, an AI Prompt Architect.
Your mission is to transform user intent into elite-tier prompts for ${platform}.
RESPOND ENTIRELY IN ${lang.toUpperCase()} LANGUAGE.

Strict Protocols:
1. CONTEXT SYNC: You MUST explicitly include and upgrade what the user said.
2. Nonsense Detection: If the input is jibberish, return JSON with 'isNonsense' true and 'explanation' exactly "Error: I cannot generate a prompt for this input.".
3. Platform Fit: Adapt the prompt to ${platform}'s best-known strengths without inventing fake capabilities.
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
        mode === "Write"
          ? `User said: "${inputToUse}". Write the polished output directly. Optimize for ${platform} style where useful.`
          : `User said: "${inputToUse}". Generate the best prompt for ${platform}.`,
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
      
      const data = parseGeneratedPrompt(responseText, platform, lang, mode);
      
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
      const minAnimationTime = 1600;
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

  const handleRefine = async (type: RefinementType) => {
    let refinementRequest = "";
    const adaptedPlatform = platform === "ChatGPT" ? "Claude" : "ChatGPT";
    if (mode === "Write") {
      if (type === "concise") refinementRequest = `Shorten the following writing while keeping the meaning and usefulness: ${currentResponse?.engineeredPrompt}`;
      if (type === "technician") refinementRequest = `Sharpen the following writing so it is clearer, more specific, and more persuasive: ${currentResponse?.engineeredPrompt}`;
      if (type === "corporate") refinementRequest = `Rewrite the following writing in a polished, formal, business-ready tone: ${currentResponse?.engineeredPrompt}`;
      if (type === "creative") refinementRequest = `Rewrite the following writing to feel warmer, friendlier, and more natural while staying professional: ${currentResponse?.engineeredPrompt}`;
      if (type === "adapt") refinementRequest = `Rewrite the following content for ${adaptedPlatform}'s style while preserving the user's intent: ${currentResponse?.engineeredPrompt}`;
    } else {
      if (type === "concise") refinementRequest = `Make the following prompt as concise as possible while keeping the core instructions: ${currentResponse?.engineeredPrompt}`;
      if (type === "technician") refinementRequest = `Upgrade the following prompt with extreme technical detail, specific constraints, and complex formatting structures: ${currentResponse?.engineeredPrompt}`;
      if (type === "corporate") refinementRequest = `Rewrite the following prompt in a polished corporate style for serious workplace use, with executive clarity and professional tone: ${currentResponse?.engineeredPrompt}`;
      if (type === "creative") refinementRequest = `Rewrite the following prompt to be more creative, distinctive, and exploratory while keeping the user's goal intact: ${currentResponse?.engineeredPrompt}`;
      if (type === "adapt") refinementRequest = `Adapt the following prompt for ${adaptedPlatform}, preserving intent while matching ${adaptedPlatform}'s best prompt style: ${currentResponse?.engineeredPrompt}`;
    }

    handleGenerate(refinementRequest);
  };

  const handleRefineIntent = () => {
    if (!inputValue.trim() || isGenerating || isAnalyzing || isLimitReached) return;

    const questions = buildRefineQuestions(inputValue, mode, platform);
    if (!questions.length) {
      handleGenerate();
      return;
    }

    setError(null);
    setRefineQuestions(questions);
    setRefineAnswers(questions.map(() => ""));
  };

  const handleRefineAnswerChange = (index: number, value: string) => {
    setRefineAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleRefineCancel = () => {
    setRefineQuestions([]);
    setRefineAnswers([]);
  };

  const handleRefineSubmit = () => {
    const details = refineQuestions
      .map((question, index) => {
        const answer = refineAnswers[index]?.trim();
        return answer ? `- ${question} ${answer}` : "";
      })
      .filter(Boolean)
      .join("\n");

    const refinedInput = details
      ? `${inputValue.trim()}\n\nClarifying details:\n${details}`
      : inputValue.trim();

    handleGenerate(refinedInput);
  };

  return (
    <motion.div 
      layout
      className={cn(
        "min-h-screen transition-all duration-500 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 overflow-x-hidden flex flex-col relative",
        "bg-white dark:bg-[#030303] text-neutral-800 dark:text-neutral-100"
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
          mode === "Write" ? "bg-amber-500/5 dark:bg-amber-500/10" : "bg-indigo-500/5 dark:bg-indigo-500/10"
        )}></div>
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse",
          mode === "Write" ? "bg-indigo-500/5 dark:bg-indigo-500/10" : "bg-amber-500/5 dark:bg-amber-500/10"
        )} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header - Simple */}
      <header className={cn(
        "h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-2xl border-b",
        "bg-white/40 dark:bg-black/40 border-neutral-100 dark:border-white/5"
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
            "flex items-center gap-2 px-2.5 md:px-4 py-1.5 rounded-full border shadow-inner",
            "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-white/5"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isLimitReached ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]")}></div>
            <span className={cn(
              "text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em] md:tracking-widest whitespace-nowrap",
              "text-neutral-400 dark:text-neutral-500"
            )}>{remaining} / {limit} Free</span>
          </div>
          
          <LanguageSwitcher current={lang} onSelect={setLang} mode={mode} />
          <button
            type="button"
            onClick={() => setView("pricing")}
            className={cn(
              "hidden min-[380px]:inline-flex px-3 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
              "border-neutral-200 dark:border-white/10 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            Upgrade
          </button>
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
                      onChange={handleInputChange} 
                      onSend={() => handleGenerate()}
                      disabled={isGenerating || isAnalyzing}
                      isGenerating={isGenerating || isAnalyzing}
                      platform={platform}
                      onPlatformChange={setPlatform}
                      mode={mode}
                      isLimitReached={isLimitReached}
                      usageRemaining={remaining}
                      usageLimit={limit}
                      onUpgrade={() => setView("pricing")}
                      onRefineIntent={handleRefineIntent}
                      lang={lang}
                    />

                    <AnimatePresence>
                      {refineQuestions.length > 0 && (
                        <RefinePanel
                          questions={refineQuestions}
                          answers={refineAnswers}
                          onAnswerChange={handleRefineAnswerChange}
                          onCancel={handleRefineCancel}
                          onSubmit={handleRefineSubmit}
                          mode={mode}
                          platform={platform}
                        />
                      )}
                    </AnimatePresence>
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "mt-6 p-4 rounded-3xl text-center border",
                          "bg-red-50/50 dark:bg-red-500/5 border-red-100/50 dark:border-red-500/10"
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
                        "bg-black dark:bg-white text-white dark:text-black"
                      )}
                    >
                      New Generation
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
                    <AnalysisLoader platform={platform} mode={mode} lang={lang} request={activeRequest} />
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
        "bg-white/50 dark:bg-neutral-950/50 border-neutral-50 dark:border-neutral-900"
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
