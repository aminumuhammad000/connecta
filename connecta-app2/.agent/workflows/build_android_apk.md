---
description: Build the Android APK Preview
---

# Build Android APK (Preview)

This workflow builds an APK for internal testing/preview.

## Prerequisites
1. **Java Development Kit (JDK) 17**: Required for Android builds.
   ```bash
   sudo apt-get update && sudo apt-get install -y openjdk-17-jdk
   ```
2. **Android SDK**: (Handled by EAS/Expo usually, or set ANDROID_HOME)
3. **EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

## Build Steps

### Option 1: Cloud Build (Recommended)
Builds on Expo's servers. No local environment setup needed.
```bash
npx eas-cli build -p android --profile preview
```

### Option 2: Local Build
Builds on your machine. Requires JDK and Android SDK.
```bash
npx eas-cli build -p android --profile preview --local
```
