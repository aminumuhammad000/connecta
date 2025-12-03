# Building Connecta Android APK

## Prerequisites
- Node.js installed
- EAS CLI: `npm install -g eas-cli`
- Expo account (already logged in as 0x_mrcoder)

## Build Commands

### Cloud Build (Recommended)
```bash
# Make sure you have stable internet connection
cd /home/mrcoder/Documents/ProjectStation/connecta/connecta-app

# First time: EAS will ask to generate credentials automatically
eas build --platform android --profile preview

# Follow prompts:
# - Generate a new Android Keystore? → YES
# - EAS will create and manage credentials for you
```

**What happens:**
1. EAS asks if you want to generate credentials → Select YES
2. EAS creates Android keystore automatically
3. Build starts in the cloud (~10-20 minutes)
4. You get email notification when complete
5. Download link provided for APK

**Important:**
- First build takes longer (credential setup)
- Keep your Expo account secure
- Credentials stored safely in EAS

### Local Build (Requires Android Studio)
```bash
# 1. Generate Android native project
npx expo prebuild --platform android

# 2. Build APK
cd android && ./gradlew assembleRelease

# 3. Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

## After Building
- Download APK from EAS dashboard or local build
- Transfer to Android device
- Enable "Install from Unknown Sources"
- Install and enjoy!

## Configuration
- Backend URL: https://api.myconnecta.ng
- Environment: Production
- Build profile: preview (APK) or production (AAB for Play Store)

## Troubleshooting
- Network errors: Check internet connection, try again later
- Already logged in: Run `eas whoami` to verify
- Build fails: Check logs in EAS dashboard

## Current Status
✅ Backend configured: https://api.myconnecta.ng
✅ EAS configured: eas.json
✅ App exported successfully
⏳ Waiting for stable network to build APK
