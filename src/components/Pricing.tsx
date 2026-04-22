import React from "react";
import { Check, Zap } from "lucide-react";
import { motion } from "motion/react";

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for exploring Promptuno",
      features: ["5 generations per month", "All platforms supported", "Basic prompt engineering"],
      cta: "Current Plan",
      current: true,
    },
    {
      name: "Pro",
      price: "$15",
      description: "For creators & power users",
      features: ["Unlimited generations", "Advanced deep engineering", "Priority support", "Future platform early access"],
      cta: "Upgrade to Pro",
      current: false,
      url: "https://pay.ziina.com/ahmedafi/5MLntD0hd"
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto py-12 px-6">
      {plans.map((plan, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`relative p-8 rounded-[32px] border ${
            plan.current
              ? "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 shadow-sm"
              : "bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 border-neutral-800 dark:border-neutral-200 text-white shadow-xl scale-105"
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
                <div key={j} className="flex items-center gap-3">
                  <Check className={`w-4 h-4 ${plan.current ? "text-neutral-400" : "text-neutral-300 dark:text-neutral-600"}`} />
                  <span className="text-sm font-medium">{feature}</span>
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
  );
};
