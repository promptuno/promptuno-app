import React, { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { PAYPAL_PAYEE_EMAIL, PRO_PLAN_PRICE, paypalStandardCheckoutUrl } from "../lib/payments";

type CheckoutState = "idle" | "paid" | "cancelled";

export const PayPalCheckout: React.FC = () => {
  const [state, setState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");

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
      <form action={paypalStandardCheckoutUrl} method="post" target="_blank" className="space-y-3">
        {Object.entries(fallbackFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button
          type="submit"
          className="w-full min-h-14 px-5 py-4 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-black uppercase tracking-[0.12em] text-[12px] leading-none shadow-lg hover:scale-[1.01] active:scale-95 transition-all whitespace-nowrap"
        >
          Pay with PayPal
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
