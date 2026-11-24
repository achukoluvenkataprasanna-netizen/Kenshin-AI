# KENSHIN-AI

A mobile-first personal AI assistant, powered by Gemini through a private backend.

## What works in this version
- Responsive React + TypeScript + Vite interface.
- FastAPI backend with a Gemini chat endpoint.
- Conversation context is sent with each chat request.
- Health endpoint reports whether the backend has an AI key configured.
- API keys are read only from backend environment variables; never commit secrets.

## Activate live AI

### 1. Get a Gemini API key
Create a key in Google AI Studio: https://aistudio.google.com/app/apikey

Keep the key private. Do not paste it into frontend code, GitHub files, or public chats.

### 2. Run the backend locally
Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Set `GEMINI_API_KEY` in your shell or in a local `.env` file (the .gitignore excludes env files). Example:

```bash
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-2.5-flash
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

Vite proxies `/api` and `/health` to the local backend. Open the URL Vite prints.

## Deploy the backend
A Render blueprint is included in `render.yaml`. Create a new Render Web Service from this repository and set the secret environment variable `GEMINI_API_KEY` in Render's dashboard. Set `FRONTEND_ORIGINS` to the exact deployed frontend origin (no trailing slash). Set the frontend's `VITE_API_BASE_URL` to the backend URL and redeploy the frontend.

Do not commit real keys. If a key is exposed, revoke it and create a new one.

## Roadmap
1. Add voice input and speech output.
2. Add chess and original mini-games.
3. Add official, user-authorized API connectors.
4. Package the stable web app for Android with Capacitor.

Roblox-related features must use documented, authorized interfaces and must not exploit games, bypass anti-cheat, or automate unauthorized public-server activity.

## Current limitations
The backend is a first AI integration, not an autonomous agent. It has no external tools, persistent memory, account connectors, or Android APK yet. Add production rate limiting, authentication, monitoring, and usage controls before opening the API to the public.
