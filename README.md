# KENSHIN-AI

KENSHIN-AI is an Android-first assistant prototype with a cinematic in-app HUD, multi-provider chat, voice controls, games, Roblox launching/guidance, local notes, and public-data utilities.

## Build and install on an Android phone

No Render account or computer is required. GitHub Actions builds the debug APK in the cloud.

1. Open [KENSHIN-AI on GitHub](https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI).
2. Tap **Actions** → **Build Kenshin Android APK** → **Run workflow**.
3. Open the newest run and wait for a green check mark.
4. Download the `kenshin-ai-debug-apk` artifact ZIP.
5. Extract `app-debug.apk` from Downloads and tap it to install.
6. If Android asks, allow your browser/file manager to install unknown apps. Only install APKs from this repository's successful workflow.

## Implemented in this iteration

- In-app animated HUD inspired by futuristic assistant interfaces.
- Direct model choices: OpenRouter, Google Gemini API, Ollama Cloud, and Ollama Local on another reachable device.
- Voice input and spoken replies where Android WebView/browser speech APIs support them.
- Playable local chess with legal move validation, check/checkmate/draw detection, undo, and queen promotion.
- Tic-tac-toe, memory matching, rock-paper-scissors, and number guessing.
- Roblox companion for Brookhaven RP, Blox Fruits, Adopt Me!, 99 Nights in the Forest, Tower of Hell, Murder Mystery 2, Piggy, Royale High, Pet Simulator X, and Welcome to Bloxburg. It opens Roblox's official discovery search and can answer fair-play questions.
- Public-data utilities: current weather using phone location (Open-Meteo), news search (GDELT), BTC/ETH/DOGE price lookup (CoinGecko), books (Open Library), anime metadata (Jikan), recipes (TheMealDB), a random dog image (Dog CEO), and NASA Astronomy Picture of the Day.
- Maps, GitHub, Gmail and Calendar shortcuts.
- User-created personal notes stored in this app's local WebView storage.

## AI provider setup

Select a provider and enter your own API key in the password field inside the app. The key remains in app memory for the current session and is not committed to this public repository. Provider requests may be blocked by browser/WebView CORS rules or provider policies. If so, a private authenticated backend proxy is needed. Usage may incur provider charges.

- Gemini: Google AI Studio API key; default model is `gemini-2.5-flash`.
- OpenRouter: OpenRouter API key; default model is `openrouter/free`.
- Ollama Cloud: Ollama API key and a cloud model enabled for your account.
- Ollama Local: requires an Ollama server on another device. On Android, `127.0.0.1` points to the phone, not a remote computer. Do not expose Ollama's unauthenticated port publicly.

Never put API keys in source code, GitHub commits, screenshots, or chat messages.

## Roblox and Android control limits

Kenshin can open the official Roblox discovery page and provide game advice. It does not control gameplay, automate public servers, exploit games, bypass anti-cheat, or interact with Roblox accounts. A companion overlay or screen-reading/accessibility agent requires a separate native Android implementation, explicit Android permissions, and careful confirmation gates; the current Capacitor app does not provide those system-level powers.

## Not implemented yet

- Persistent voice wake word, background listening, full duplex live voice, and interruptible speech.
- Native Android overlay/HUD above other apps, accessibility service, OCR/screen vision, notification reading, clipboard access, or app chaining.
- Long-term AI memory graph, searchable chat history, cloud sync, autonomous agents, skill/MCP marketplace, scheduler and reminders.
- Direct Roblox in-game control or playing Roblox on the user's behalf.
- Email/calendar OAuth and inbox/event access; current links only open the official services.
- Full maps/transit routing, live sports, broader finance, and authenticated private account integrations.
- Image understanding/generation, file uploads, and web browsing with citations inside the app.
- A production-signed APK; GitHub workflow creates a debug APK for personal testing.

These are real engineering milestones, not features that can be switched on by changing the app's appearance. The app is not artificial superintelligence; it uses the selected external model and the tools explicitly integrated here.

## Privacy

Local notes are stored in Android WebView app storage. They are not encrypted and can be lost if app data is cleared. Do not save passwords, API keys, or sensitive information. Cloud AI providers receive prompts sent to them; review their privacy and billing terms.
