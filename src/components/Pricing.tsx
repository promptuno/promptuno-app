import React from "react";
import { Check, Layers, Zap } from "lucide-react";
import { motion } from "motion/react";
import { premiumLayers } from "../lib/productLayers";

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Start with focused prompt generation before upgrading.",
      features: ["5 free prompt generations", "Primary models: ChatGPT, Claude, Gemini, and Copilot", "Core prompt engineering and copy actions"],
      cta: "Current Plan",
      current: true,
    },
    {
      name: "Pro",
      price: "$15",
      description: "Built for people who use AI seriously.",
      features: ["More prompt generations without interruption", "Premium refinements for tone, depth, and platform fit", "Future advanced prompt tools and saved workflows", "Higher productivity for serious AI users"],
      cta: "Upgrade to Pro",
      current: false,
      url: "https://pay.ziina.com/ahmedafi/5MLntD0hd"
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-6 space-y-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-6 md:p-8 rounded-[28px] md:rounded-[32px] border ${
              plan.current
                ? "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 shadow-sm"
                : "bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 border-neutral-800 dark:border-neutral-200 text-white shadow-xl md:scale-105"
            }`}
          >
            <div className="space-y-6">
              <div>
                <div className="text-sm font-bold uppercase tracking-widest opacity-60">{plan.name}</div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-sm opacity-60">/mo</span>
                </div>
                <p className="mt-3 text-sm opacity-80 leading-relaxed font-medium">{plan.description}</p>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 mt-0.5 ${plan.current ? "text-neutral-400" : "text-neutral-300 dark:text-neutral-600"}`} />
                    <span className="text-sm font-medium leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={plan.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  plan.current
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed pointer-events-none"
                    : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-lg"
                }`}
              >
                {!plan.current && <Zap className="w-5 h-5 fill-current" />}
                {plan.cta}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-[28px] border border-neutral-100 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-2xl p-5 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-neutral-900 dark:text-white">Premium layers coming next</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Promptuno stays focused on better prompts while the product expands cleanly.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {premiumLayers.map((layer) => (
            <div key={layer.title} className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-900 dark:text-white">{layer.title}</div>
              <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400 mt-2">{layer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
