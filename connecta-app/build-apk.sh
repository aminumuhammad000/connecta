#!/bin/bash
# Build Android APK using EAS

echo "🚀 Starting Android APK build..."
echo "Make sure you're logged in: eas login"
echo ""

# Build preview APK
eas build --platform android --profile preview

echo ""
echo "✅ Build submitted! Check your Expo dashboard for progress."
echo "📱 APK will be available for download once complete."
