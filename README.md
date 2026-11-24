# KENSHIN-AI

KENSHIN-AI is an Android-first AI companion prototype with a futuristic chat HUD, multi-provider model support, voice controls, in-chat mini-games, Roblox companion links, public-data tools and an API integration catalogue.

## Install on an Android phone

No Render service or computer is required for the GitHub Actions APK build.

1. Open [KENSHIN-AI Actions](https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI/actions).
2. Select **Build Kenshin Android APK** and tap **Run workflow** (or open the latest automatic run).
3. Wait for every build step to finish successfully.
4. Download the `kenshin-ai-debug-apk` artifact ZIP.
5. Extract `app-debug.apk` from Downloads and tap it to install.
6. If Android asks, allow your browser/file manager to install unknown apps. Only install APKs from successful runs in this repository.

## Current app features

- OpenRouter, Google Gemini API, Ollama Cloud and Ollama Local provider choices.
- Speech input and spoken responses where Android WebView/browser speech support is available.
- Playable chess, tic-tac-toe, memory match, rock-paper-scissors, number guessing and a no-timer 2D grid escape puzzle.
- Ask in chat to play supported games; the game appears as an interactive card in the conversation.
- Roblox companion links and fair-play tips for Brookhaven RP, Blox Fruits, Adopt Me!, 99 Nights in the Forest, Tower of Hell, Murder Mystery 2, Piggy, Royale High, Pet Simulator X and Welcome to Bloxburg.
- Public-data utilities: Open-Meteo weather, GDELT news search, CoinGecko prices, Open Library, Jikan anime, TheMealDB recipes, Dog CEO and NASA APOD.
- Maps, GitHub, Gmail and Calendar shortcuts.
- Local personal notes.
- API integration directory covering development/cloud, finance, weather, maps/transport, entertainment/games, news/books/open data, business/email, science/space, animals and food.
- Android API-key vault uses `@aparajita/capacitor-secure-storage` 7.x, which uses Android Keystore-backed encryption. Credentials are stored locally on the Android device, not committed to this public repository. See [plugin documentation](https://github.com/aparajita/capacitor-secure-storage).

## Provider setup

Open **Settings**, choose a provider/service, enter its API key and save it on the Android phone. Then choose the AI provider in the Assistant tab. Provider keys are saved in Android's encrypted app storage. Never commit API keys to GitHub or share them in chat.

- OpenRouter: OpenRouter API key; default model `openrouter/free`.
- Google Gemini: Google AI Studio API key; default model `gemini-2.5-flash`.
- Ollama Cloud: Ollama API key and a cloud model enabled for your account.
- Ollama Local: a reachable Ollama server on another device; `127.0.0.1` on Android points to the phone itself.

Saving an integration key only stores the credential. It does **not** automatically implement that provider's API adapter. Many services require OAuth, scopes, account setup, server-side proxying, rate-limit handling and their own connector code. Current live integrations are listed above; the rest are planned catalogue entries.

## Ollama and offline models

Ollama Cloud and a remote/local-network Ollama server can be selected as providers. A full Ollama daemon and large model weights are not bundled in this APK. A true offline Android model needs a native inference runtime (for example llama.cpp), a device-compatible quantized GGUF model download, RAM/storage checks and model lifecycle controls. This is a separate native Android milestone.

## Roblox and Android control

Kenshin opens official Roblox discovery pages and provides fair-play guidance. It does not play Roblox for you, automate public servers, exploit games, bypass anti-cheat or access your Roblox account. In-game vision/control would require a carefully scoped, user-enabled native accessibility or screen-capture implementation; support differs by app and game.

Native phone actions must be user-visible, permission-based and confirm sensitive actions. Android accessibility services can inspect UI hierarchy or dispatch gestures only when declared and explicitly enabled by the user; this app does not yet include a full accessibility agent.

## Still planned

- Native floating overlay above other apps, accessibility agent, OCR/screen understanding and user-confirmed actions.
- Full duplex voice conversation, wake word, background voice and interruptible speech.
- Downloadable on-device GGUF model runtime.
- Remaining API adapters and OAuth integrations from the catalogue.
- Direct authenticated GitHub, Drive, GitLab, Cloudflare, email and calendar actions.
- Additional in-chat games, card games and generated game templates.
- Searchable encrypted chat history, long-term AI memory, scheduled routines and agent/skill marketplace.
- Production-signed release APK; current workflow builds a debug APK for personal testing.

KENSHIN-AI is not artificial superintelligence. It is a software assistant that uses selected external or local models and explicitly implemented tools. Features should be considered complete only after they build and work on a real Android device.

## Privacy and safety

API keys saved in the Android app use Android Keystore-backed encryption through the secure-storage plugin. Local notes still use WebView storage and are not encrypted. Cloud providers receive prompts sent to them under their own terms. Never save passwords or highly sensitive information in notes or chat.
