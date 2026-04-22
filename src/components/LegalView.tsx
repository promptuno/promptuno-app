import React from "react";
import { ChevronLeft } from "lucide-react";

interface LegalViewProps {
  type: "privacy" | "terms";
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-20 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to App
      </button>

      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mb-8">
          {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
        </h1>
        
        <div className="space-y-8 text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 italic">1. Introduction</h2>
            <p>
              Welcome to Promptuno. We are committed to providing a high-quality prompt engineering tool while respecting your privacy and ensuring a fair usage environment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 italic">2. Usage Policy</h2>
            <p>
              Users are granted exactly 10 free generations upon arrival. This usage is tracked via local storage on your device. We do not require account creation for this initial free tier.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 italic">3. Data Collection</h2>
            <p>
              We do not permanently store your prompts or resulting outputs on our servers. All conversation history is managed client-side in your current session. We use basic analytics to improve our engine.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 italic">4. Pro Subscription</h2>
            <p>
              Promptuno Pro provides unlimited usage and enhanced features. Payments are handled securely through third-party processors.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
