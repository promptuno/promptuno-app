# Promptuno Chrome Extension

Promptuno for Chrome is the compact browser-native layer of Promptuno. It keeps the same clean premium product language as the web app and adds one-click prompt improvement directly where users write.

## What It Does

- Improves rough prompts in one click.
- Adds a subtle inline Promptuno button near text inputs.
- Works from the extension popup on any page.
- Supports ChatGPT, Claude, Gemini, and Copilot as the primary visible models.
- Supports email and document drafting as a premium direct-generation workflow.
- Uses the same 5 free generations limit as the web product.
- Shows the same calm Pro paywall after the free limit.
- Saves local prompt history and saved prompts as a foundation for the future Pro library.

## Install Locally

1. Open Chrome and go to `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select this `extension` folder.
5. Pin Promptuno from the extensions menu.

## Packaging

Zip the contents of this `extension` folder for Chrome Web Store upload. Do not zip the parent repo folder.

## Product Notes

The extension uses Pollinations' public text endpoint for the current static build. A future production backend can replace this with a private Promptuno API without changing the extension UX.

PayPal checkout is embedded as a simple pay action. The payee email remains hidden in form fields and is not shown as checkout copy.
