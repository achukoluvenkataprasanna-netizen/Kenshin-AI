# KENSHIN-AI

A mobile-first personal AI assistant starter project.

> This repository is the foundation, not a finished AI assistant. The current UI is a frontend prototype; live AI, voice, chess, games, and external connectors are planned integrations.

## Current starter
- Responsive React + TypeScript + Vite interface
- Dark, mobile-first assistant dashboard
- Chat prototype with clearly labeled demo responses
- Feature roadmap for voice, chess, mini-games, and connectors
- No API keys or secrets committed

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

## Roadmap
1. Connect a real AI provider through a secure backend (never expose API keys in browser code).
2. Add speech input/output with browser/device capability checks.
3. Add chess and original mini-games.
4. Add documented, authorized API integrations.
5. Package the web app for Android with Capacitor after the core experience is stable.

## Safety and integrations
Connectors must use official APIs and user-authorized access. Roblox-related features must not exploit games, bypass anti-cheat, or automate unauthorized public-server activity.

## License
No license has been selected yet. All rights remain with the repository owner until a license is added.
