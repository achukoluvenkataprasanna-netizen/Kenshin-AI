# KENSHIN-AI

A mobile-first personal AI assistant, powered by models available through OpenRouter and a private FastAPI backend.

## What works in this version
- Responsive React + TypeScript + Vite interface.
- FastAPI backend connected to OpenRouter's OpenAI-compatible chat completions API.
- Selectable model through the `OPENROUTER_MODEL` environment variable.
- Conversation context is sent with each chat request.
- Health endpoint reports whether the backend has an API key configured.
- API keys are read only from backend environment variables; never commit secrets.

## Activate live AI

### 1. Create an OpenRouter API key
Visit https://openrouter.ai/keys and create a key. Set a spending limit on the key. OpenRouter offers some free models, but free model availability, rate limits, and quality can vary.

### 2. Run the backend locally
Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Set these environment variables in your shell or in a local `.env` file (the .gitignore excludes env files):

```bash
OPENROUTER_API_KEY=your_private_key
OPENROUTER_MODEL=openrouter/free
FRONTEND_ORIGINS=http://localhost:5173
uvicorn main:app --reload --port 8000
```

The health check is at http://localhost:8000/health.

### 3. Run the frontend
In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open the URL Vite prints. The Vite development server proxies API requests to the local backend.

## Deploy the backend
A Render blueprint is included in `render.yaml`. Create a new Render Web Service from this repository and add `OPENROUTER_API_KEY` as a secret in the Render dashboard. Set `OPENROUTER_MODEL` to a model slug available in your OpenRouter account. Set `FRONTEND_ORIGINS` to the exact deployed frontend origin (no trailing slash). Set the frontend's `VITE_API_BASE_URL` to the backend URL and redeploy the frontend.

## Security
**Never put an OpenRouter API key in this public GitHub repository, frontend JavaScript, a mobile APK, or a chat message.** A key can spend your account credits. Keep it only in backend environment secrets. If exposed, revoke it immediately and create a replacement. Use a spending limit and add authentication and rate limiting before making the backend public.

## Roadmap
1. Add voice input and speech output.
2. Add chess and original mini-games.
3. Add official, user-authorized API connectors.
4. Package the stable web app for Android with Capacitor.

Roblox-related features must use documented, authorized interfaces and must not exploit games, bypass anti-cheat, or automate unauthorized public-server activity.

## Current limitations
This is a first AI integration, not an autonomous agent. It has no external tools, persistent memory, account connectors, or Android APK yet.
