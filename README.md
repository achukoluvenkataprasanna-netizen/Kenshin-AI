# KENSHIN-AI

A mobile-first AI assistant with three selectable AI routes and an Android APK build workflow.

## AI brains

- **OpenRouter:** OpenAI-compatible hosted model gateway. Configure `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
- **Ollama Cloud:** Hosted Ollama models. Configure `OLLAMA_API_KEY` and `OLLAMA_CLOUD_MODEL`. The default example is `gemma4:31b`.
- **Ollama Local:** A model served by an Ollama installation. Configure `OLLAMA_LOCAL_BASE_URL` and `OLLAMA_LOCAL_MODEL`. The default example is `gemma4:e2b`; pull that model on the Ollama host first.

The app lets the user choose a provider and enter a model name. Provider credentials are only read by the backend and are never sent to the Android app.

## Backend environment

Copy `backend/.env.example` into your private local environment and fill in the keys. Never commit real API keys.

Run the backend:

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Run the frontend in another terminal:

```bash
npm install
npm run dev
```

Vite proxies `/api` and `/health` to the local backend.

## Ollama Local networking note

`OLLAMA_LOCAL_BASE_URL` is resolved from the backend machine, not the Android phone. If the backend runs on Render, `127.0.0.1` points to the Render container and will not reach a computer at home. To use a local Ollama server, run the backend on the same computer/network as Ollama or connect them through a properly secured private network/tunnel. Do not expose Ollama's unauthenticated local port directly to the public internet.

## Deploy the backend

Create a Render Web Service from this repository using the included `render.yaml`. Add these secrets in the Render dashboard as needed:

- `OPENROUTER_API_KEY`
- `OLLAMA_API_KEY`

Set `FRONTEND_ORIGINS` to the deployed web origin plus `https://localhost` for the Capacitor Android WebView. Set the frontend `VITE_API_BASE_URL` to the backend URL and rebuild the Android app after changing it.

For local Ollama with a hosted backend, configure `OLLAMA_LOCAL_BASE_URL` to a private, authenticated/restricted route reachable from that backend. The sample loopback address is only suitable when the backend and Ollama run on the same machine.


### Configure the APK backend URL

Before running the Android workflow, add a repository Actions variable:

1. Open **Settings > Secrets and variables > Actions > Variables**.
2. Choose **New repository variable**.
3. Name it `VITE_API_BASE_URL`.
4. Set its value to your deployed HTTPS backend URL, for example `https://your-kenshin-api.onrender.com` (use your actual Render service URL).
5. Save, then run the Android APK workflow again.

This URL is public configuration, not a secret. Do not put provider API keys in this variable.

## Android APK

This repository includes Capacitor Android configuration and a GitHub Actions workflow at `.github/workflows/android-apk.yml`.

1. Open the repository on GitHub and select **Actions**.
2. Choose **Build Kenshin Android APK**.
3. Tap **Run workflow** (or wait for a build after a relevant push).
4. Open the completed workflow run and download the `kenshin-ai-debug-apk` artifact.
5. Extract the ZIP and install `app-debug.apk` on your Android device. Android may ask you to allow installation from that source.

For a local build, install Node.js, Android Studio and the Android SDK, then run:

```bash
npm install
npm run cap:sync
npx cap open android
```

In Android Studio, build the APK from **Build > Build Bundle(s) / APK(s) > Build APK(s)**. A release/Play Store build needs a separately configured signing key; never commit that key.

## Security

Never put OpenRouter or Ollama API keys in this public repository, frontend JavaScript, an APK, or a chat message. Store them only as backend environment secrets. Revoke and replace any key that is exposed. Add authentication and rate limiting before making a personal backend publicly accessible.

## Current limitations

The Android APK workflow creates a debug APK artifact; it does not sign a production release. The backend must be deployed and configured before hosted AI works. Ollama Local only works when the backend can reach the Ollama host. Voice, chess, games and external connectors remain future modules.

Roblox-related features must use documented, authorized interfaces and must not exploit games, bypass anti-cheat, or automate unauthorized public-server activity.
