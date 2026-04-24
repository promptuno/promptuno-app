<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Promptuno

Promptuno's canonical production domain is https://www.promptuno.chat/.

Promptuno is one product with two surfaces: the web app and the Chrome extension. It focuses on better prompting through three prompt categories: Prompt, Image, and Vibe Code.

View your app in AI Studio: https://ai.studio/apps/61e35416-9d71-48e3-a785-1748e07c8172

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

Prompt generation uses the server `/api/generate` route when the app is hosted on a Node server. Set `OPENAI_API_KEY` as a private server environment variable to use your OpenAI credits without exposing the key publicly.

The free product tier grants exactly 5 generations before the Pro paywall appears. Usage is tracked client-side for the current auth-free version.

Pro checkout uses PayPal at the current site price of `$15 USD`. Add `VITE_PAYPAL_CLIENT_ID` to enable embedded PayPal buttons. Add `VITE_PAYPAL_PLAN_ID` as well if you create a PayPal Subscriptions plan for the monthly Pro price. Without those public PayPal IDs, the app shows a PayPal Standard checkout form that sends payment to `AFI5@OUTLOOK.COM`.

GitHub Pages is static and cannot safely hold private API keys, so the Pages build falls back to Pollinations' public text API in the browser. Optional: create a `.env.local` file and set `POLLINATIONS_API_KEY` if you want authenticated Pollinations access on the server.

If you deploy the Express server separately, build the static frontend with `VITE_API_BASE_URL` pointing to that backend URL. The frontend will call `VITE_API_BASE_URL/api/generate`, while `OPENAI_API_KEY` stays private on the backend.

## Chrome extension

The launch-ready Chrome extension lives in `extension/`.

Load it locally:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose "Load unpacked"
4. Select the `extension/` folder

The extension keeps the same 5 free generations rule, uses the same primary models (ChatGPT, Claude, Gemini, Copilot), supports prompt generation across Prompt, Image, and Vibe Code categories, supports insertion into editable fields, and stores prompt history/saved prompts locally. Chrome Web Store copy is included in `extension/STORE_LISTING.md`.
