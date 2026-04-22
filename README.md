<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/61e35416-9d71-48e3-a785-1748e07c8172

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

Prompt generation uses the server `/api/generate` route when the app is hosted on a Node server. Set `OPENAI_API_KEY` as a private server environment variable to use your OpenAI credits without exposing the key publicly.

GitHub Pages is static and cannot safely hold private API keys, so the Pages build falls back to Pollinations' public text API in the browser. Optional: create a `.env.local` file and set `POLLINATIONS_API_KEY` if you want authenticated Pollinations access on the server.
