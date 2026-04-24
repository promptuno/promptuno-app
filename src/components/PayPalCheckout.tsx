import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PAYPAL_PAYEE_EMAIL, PRO_PLAN_PRICE, paypalStandardCheckoutUrl } from "../lib/payments";

type CheckoutState = "idle" | "paid" | "cancelled";
type PaymentMethod = "paypal" | null;

export const PayPalCheckout: React.FC = () => {
  const [state, setState] = useState<CheckoutState>("idle");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paypal");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const fallbackFields = useMemo(
    () => ({
      cmd: "_xclick",
      business: PAYPAL_PAYEE_EMAIL,
      item_name: PRO_PLAN_PRICE.description,
      amount: PRO_PLAN_PRICE.amount,
      currency_code: PRO_PLAN_PRICE.currency,
      no_shipping: "1",
      no_note: "0",
      custom: "promptuno-pro",
      return: "https://www.promptuno.chat/?checkout=success",
      cancel_return: "https://www.promptuno.chat/?checkout=cancelled",
    }),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");

    if (checkout === "success") {
      setState("paid");
      setMessage("Payment received. We’ll confirm Pro access once billing is connected to account entitlements.");
      return;
    }

    if (checkout === "cancelled") {
      setState("cancelled");
      setMessage("Checkout was cancelled before payment.");
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-[24px] border border-white/10 bg-white/5 dark:bg-black/20 p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              Choose payment method
            </div>
            <div className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Smooth checkout, then continue securely in PayPal.
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedMethod("paypal")}
          className={`group relative w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-300 ${
            selectedMethod === "paypal"
              ? "border-neutral-900 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white shadow-lg"
              : "border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-neutral-600 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors ${
                selectedMethod === "paypal"
                  ? "border-neutral-900 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-black"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <WalletCards className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black uppercase tracking-[0.14em]">PayPal</span>
                {selectedMethod === "paypal" && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed opacity-80">
                Continue with PayPal after one quick confirmation step.
              </p>
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {selectedMethod === "paypal" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-[20px] border border-neutral-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                    Selected
                  </div>
                  <div className="text-[13px] font-semibold text-neutral-900 dark:text-white mt-1">
                    PayPal checkout for Promptuno Pro
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                    Price
                  </div>
                  <div className="text-[14px] font-black text-neutral-900 dark:text-white mt-1">
                    {PRO_PLAN_PRICE.display}
                    <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 ml-1">
                      {PRO_PLAN_PRICE.interval}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form ref={formRef} action={paypalStandardCheckoutUrl} method="post" target="_blank" className="space-y-3">
        {Object.entries(fallbackFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button
          type="button"
          onClick={() => formRef.current?.submit()}
          disabled={!selectedMethod}
          className="w-full min-h-14 px-5 py-4 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-black uppercase tracking-[0.12em] text-[12px] leading-none shadow-lg hover:scale-[1.01] active:scale-95 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="inline-flex items-center justify-center gap-2">
            Continue to PayPal
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-3 text-[12px] font-bold leading-relaxed ${
            state === "paid"
              ? "border-green-400/30 bg-green-400/10 text-green-100 dark:text-green-400"
              : "border-white/10 bg-white/5 text-white/70 dark:text-neutral-300"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {state === "paid" ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {message}
          </span>
        </motion.div>
      )}
    </div>
  );
};
