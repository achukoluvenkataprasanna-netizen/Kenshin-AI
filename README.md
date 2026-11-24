# KENSHIN-AI

A mobile-first personal assistant with OpenRouter and Ollama provider choices, voice controls, mini-games, a Roblox fair-play guide, and an Android APK workflow.

## Build and install the APK using only your Android phone

No Render account, computer, Android Studio, or local build is required. GitHub Actions builds the Android APK in the cloud.

1. Open [KENSHIN-AI on GitHub](https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI).
2. Tap **Actions**.
3. Choose **Build Kenshin Android APK**.
4. Tap **Run workflow**, then confirm **Run workflow**.
5. Open the newest run and wait for the green check mark.
6. Under **Artifacts**, download **kenshin-ai-debug-apk**.
7. Open the ZIP in your Android Downloads folder, extract it, tap `app-debug.apk`, and approve Android's install-from-this-source prompt if asked.

If GitHub says Actions are disabled, open **Actions** in the repository and enable workflows. If the build fails, open the run and share the error text; do not share any API key.

## AI brains without Render

The app can make direct requests from the phone to:
- **OpenRouter** — choose a model available to your account.
- **Ollama Cloud** — requires an Ollama API key and a cloud model available to your account.

Enter your own key in the app's password field. The current app keeps it in memory only; it is not written into this public repository. Never paste a key into GitHub source files or a chat. Direct requests may be blocked by a provider's browser CORS policy; if that happens, a private backend/proxy is needed for reliable access. Provider usage may cost money.

**Ollama Local:** This requires an Ollama server on another computer/device reachable over your network. Ollama's normal local server is not an Android app service, and `127.0.0.1` on the phone means the phone itself. With only this Android phone, use Ollama Cloud or OpenRouter.

## Current app modules

- AI chat with provider/model selection and optional voice input/output (speech support depends on Android WebView and microphone permission).
- Tic-tac-toe and memory-match mini-games.
- Roblox guide prompts for Brookhaven RP, Blox Fruits, Adopt Me!, 99 Nights in the Forest, Tower of Hell, Murder Mystery 2, Piggy, Royale High, Pet Simulator X, and Welcome to Bloxburg.
- API hub roadmap for weather, maps/transit, news, finance/crypto, developer tools, books/anime/games, email/calendar, science and open datasets.

Chess lessons can be requested from Kenshin; a playable chessboard and the external API connectors are not yet implemented. The Roblox companion provides fair-play advice only; no cheats, exploits, anti-cheat bypasses, account theft, or unauthorized public-server bots.

## Security and privacy

- API keys are not embedded in the APK or committed to GitHub.
- The direct phone mode holds the key in app memory for the current session. Treat the phone as sensitive and revoke the key if the device is lost.
- For stronger security, use a private backend that stores provider keys server-side and add authentication/rate limits before exposing it publicly.
- Cloud AI providers process prompts to generate answers; review their current privacy and billing terms before use.

## Development

The project uses React, TypeScript, Vite and Capacitor. For local development, install Node.js and run `npm install`, `npm run dev`. A production Android release needs a signing key; the workflow produces a debug APK for personal testing.
