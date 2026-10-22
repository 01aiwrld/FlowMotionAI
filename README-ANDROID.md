# FlowMotion AI — Android APK build

This repository is prepared to package the existing React/Vite app as an Android app using Capacitor.

## Build an APK in GitHub Actions (no Android SDK needed on your computer)

1. Create a **private** or public GitHub repository and upload the contents of this folder.
2. Open the repository's **Actions** tab.
3. Select **Build FlowMotion AI APK** and press **Run workflow** (or push to `main`).
4. When the workflow finishes, open the run and download the `FlowMotion-AI-debug-apk` artifact.
5. Extract it and install `app-debug.apk` on your Android phone. If Android asks, allow installation from that source.

## Local build (Android Studio installed)

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Important functionality note

The mobile package bundles the frontend UI. The source app calls `/api/*` endpoints for online Copilot/caption/prompt services; these require the companion `server.ts` backend to be deployed and configured with `GEMINI_API_KEY`. Without a reachable backend, the app uses its built-in fallback behavior where implemented. Video/image features that depend on external providers or server endpoints may not work just because the app is installed. Never put a private API key in the Android client.

This workflow produces a **debug APK** for testing, not a Play Store-signed release APK.
