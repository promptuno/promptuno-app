import React from "react";
import { Lock, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PayPalCheckout } from "./PayPalCheckout";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl"
        >
          <div className="relative p-10 text-center space-y-8 bg-white dark:bg-[#080808]">
            <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-3xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">Free Limit Reached</h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                You've reached your 5 free prompt generations. Upgrade to Promptuno Pro to keep generating without interruption.
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                Use Promptuno on the web and inside your browser.
              </p>
            </div>

            <div className="space-y-4 text-left">
              {[
                "Prompt generation without interruption",
                "Continue creating across the web app and Chrome",
                "Premium refinements for stronger prompts",
                "Future saved prompts, prompt packs, and workflow libraries",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white dark:text-neutral-900" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <PayPalCheckout />
              <div className="text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                Chrome extension access is included in Free. Pro is for uninterrupted usage.
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 text-sm font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
