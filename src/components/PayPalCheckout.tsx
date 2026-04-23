import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import {
  PAYPAL_CLIENT_ID,
  PAYPAL_PAYEE_EMAIL,
  PAYPAL_PLAN_ID,
  PRO_PLAN_PRICE,
  paypalStandardCheckoutUrl,
} from "../lib/payments";

type CheckoutState = "idle" | "loading" | "ready" | "paid" | "error";

declare global {
  interface Window {
    paypal?: any;
  }
}

function buildPayPalScriptUrl() {
  const params = new URLSearchParams({
    "client-id": PAYPAL_CLIENT_ID,
    currency: PRO_PLAN_PRICE.currency,
    components: "buttons",
    intent: PAYPAL_PLAN_ID ? "subscription" : "capture",
  });

  if (PAYPAL_PLAN_ID) {
    params.set("vault", "true");
  }

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

export const PayPalCheckout: React.FC = () => {
  const buttonContainerId = useId().replace(/:/g, "");
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CheckoutState>(PAYPAL_CLIENT_ID ? "loading" : "idle");
  const [message, setMessage] = useState("");

  const checkoutMode = PAYPAL_PLAN_ID ? "subscription" : "one-time";

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
      return: "https://promptuno.github.io/promptuno-app/?checkout=success",
      cancel_return: "https://promptuno.github.io/promptuno-app/?checkout=cancelled",
    }),
    [],
  );

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID || !buttonContainerRef.current) return;

    let isMounted = true;

    const renderButtons = () => {
      if (!window.paypal || !buttonContainerRef.current || !isMounted) return;
      buttonContainerRef.current.innerHTML = "";

      const buttons = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "black",
          shape: "rect",
          label: "paypal",
          tagline: false,
        },
        createOrder: PAYPAL_PLAN_ID
          ? undefined
          : (_data: any, actions: any) =>
              actions.order.create({
                purchase_units: [
                  {
                    description: PRO_PLAN_PRICE.description,
                    custom_id: "promptuno-pro",
                    payee: {
                      email_address: PAYPAL_PAYEE_EMAIL,
                    },
                    amount: {
                      currency_code: PRO_PLAN_PRICE.currency,
                      value: PRO_PLAN_PRICE.amount,
                    },
                  },
                ],
              }),
        createSubscription: PAYPAL_PLAN_ID
          ? (_data: any, actions: any) =>
              actions.subscription.create({
                plan_id: PAYPAL_PLAN_ID,
                custom_id: "promptuno-pro",
              })
          : undefined,
        onApprove: async (data: any, actions: any) => {
          if (!PAYPAL_PLAN_ID && actions?.order) {
            await actions.order.capture();
          }

          localStorage.setItem(
            "promptuno_pro_checkout",
            JSON.stringify({
              provider: "paypal",
              mode: checkoutMode,
              id: data.subscriptionID || data.orderID || data.paymentID,
              paidAt: new Date().toISOString(),
            }),
          );
          setState("paid");
          setMessage("Payment received. Your Pro checkout is complete.");
        },
        onCancel: () => {
          setState("ready");
          setMessage("Checkout was cancelled before payment.");
        },
        onError: () => {
          setState("error");
          setMessage("PayPal could not load checkout. You can still continue with the secure PayPal button below.");
        },
      });

      buttons.render(`#${buttonContainerId}`);
      setState("ready");
    };

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-promptuno-paypal='true']");
    const scriptUrl = buildPayPalScriptUrl();

    if (existingScript) {
      if (window.paypal) renderButtons();
      else existingScript.addEventListener("load", renderButtons, { once: true });
      return () => {
        isMounted = false;
      };
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.dataset.promptunoPaypal = "true";
    script.onload = renderButtons;
    script.onerror = () => {
      if (!isMounted) return;
      setState("error");
      setMessage("PayPal checkout is temporarily unavailable. Use the secure PayPal button below.");
    };
    document.body.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, [buttonContainerId, checkoutMode]);

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] dark:bg-black/10 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white flex items-center justify-center shadow-sm">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] opacity-70">PayPal checkout</div>
          <p className="text-[13px] leading-relaxed opacity-80 mt-1">
            Pay {PRO_PLAN_PRICE.display} {PRO_PLAN_PRICE.currency} for {PRO_PLAN_PRICE.name}. Payment is routed to {PAYPAL_PAYEE_EMAIL}.
          </p>
        </div>
      </div>

      {PAYPAL_CLIENT_ID && state !== "error" ? (
        <div className="space-y-3">
          {state === "loading" && (
            <div className="h-14 rounded-2xl bg-white/10 animate-pulse flex items-center justify-center text-[11px] font-black uppercase tracking-widest opacity-60">
              Loading PayPal
            </div>
          )}
          <div id={buttonContainerId} ref={buttonContainerRef} className={state === "paid" ? "hidden" : ""} />
        </div>
      ) : (
        <form action={paypalStandardCheckoutUrl} method="post" target="_blank" className="space-y-3">
          {Object.entries(fallbackFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-black uppercase tracking-[0.12em] text-[12px] shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
          >
            Pay with PayPal
          </button>
        </form>
      )}

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

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-60">
        <Lock className="w-3.5 h-3.5" />
        Secure checkout handled by PayPal
      </div>
    </div>
  );
};
