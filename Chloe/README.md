# Chloe AI — Native Android starter

Chloe is a separate Kotlin/Jetpack Compose Android application inside the Kenshin-AI repository. It does not modify the existing Kenshin application.

## Open and build
1. Open the `Chloe/` directory in Android Studio.
2. Use JDK 17 and allow Gradle sync.
3. Install Android SDK 35 if prompted.
4. Run the `app` configuration on an Android 8.0+ device.

## Included in this starter
- Android-style lime-green mascot inspired by the supplied reference.
- Basic speech-to-text using Android's speech recognizer UI.
- Text-to-speech replies.
- Launch an installed app by matching its launcher label (subject to Android package visibility and device restrictions).
- Device memory information and app heap display.
- A simple command router and confirmation dialog for sensitive action requests.

## Not implemented yet
This is an honest runnable foundation, not a finished autonomous agent. It does not yet connect an LLM, persistent memory, contacts, SMS, calling, app-store installation, shopping, food delivery, a floating overlay, wake-word listening, or continuous CPU utilization measurement. The displayed CPU field is process CPU time, not a percentage. Purchase, communication, and installation connectors must be implemented with user review and explicit confirmation.

## Safety and privacy
- No API keys are included.
- No background microphone service is included.
- No message, call, or purchase is sent by this starter.
- Add only permissions and integrations needed for a specific feature, and keep sensitive actions user-confirmed.
