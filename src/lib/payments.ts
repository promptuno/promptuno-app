export const PRO_PLAN_PRICE = {
  amount: "15.00",
  display: "$15",
  currency: "USD",
  interval: "/mo",
  name: "Promptuno Pro",
  description: "Promptuno Pro monthly access",
};

export const PAYPAL_PAYEE_EMAIL = "AFI5@OUTLOOK.COM";

export const PAYPAL_CLIENT_ID = ((import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || "").trim();
export const PAYPAL_PLAN_ID = ((import.meta as any).env?.VITE_PAYPAL_PLAN_ID || "").trim();

export const paypalStandardCheckoutUrl = "https://www.paypal.com/cgi-bin/webscr";
