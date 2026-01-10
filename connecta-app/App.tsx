import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme, ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RoleProvider, useRole } from './src/context/RoleContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { useThemeColors } from './src/theme/theme';
import { configureNotifications, registerForPushNotificationsAsync } from './src/utils/notifications';
import { InAppAlertProvider, useInAppAlert } from './src/components/InAppAlert';
import authService from './src/services/authService';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';

// Navigators
import AuthNavigator from './src/navigation/AuthNavigator';
import ClientNavigator from './src/navigation/ClientNavigator';
import FreelancerNavigator from './src/navigation/FreelancerNavigator';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RoleProvider>
            <SocketProvider>
              <InAppAlertProvider>
                <AppContent />
              </InAppAlertProvider>
            </SocketProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();
  const c = useThemeColors();
  const { showAlert } = useInAppAlert();

  useEffect(() => {
    // Skip notification setup on web - not fully supported
    if (Platform.OS === 'web') {
      console.log('[App] Skipping notification setup on web platform');
      return;
    }

    // Setup notifications without blocking the app
    let receivedSub: any;
    let responseSub: any;

    (async () => {
      try {
        await configureNotifications();
        const { token, reason } = await registerForPushNotificationsAsync();

        if (token) {
          // Send token to backend
          try {
            await authService.updatePushToken(token);
            console.log('[App] Push token registered successfully');
          } catch (e) {
            console.error('[App] Failed to update push token', e);
          }
        } else if (reason === 'unavailable') {
          // Notifications not available in this build - silently continue
          console.log('[App] Notifications not available - continuing without push support');
        } else if (reason === 'expo-go') {
          // In Expo Go - notifications are limited but don't show intrusive alert
          console.log('[App] Running in Expo Go - push notifications limited');
        } else if (reason === 'denied') {
          // Only show alert if user explicitly denied permissions
          showAlert({
            title: 'Notifications disabled',
            message: 'Enable permissions to receive alerts.',
            type: 'info'
          });
        }

        // Try to setup notification listeners (only if notifications are available)
        try {
          const Notifications = await import('expo-notifications');

          receivedSub = Notifications.addNotificationReceivedListener((notification: any) => {
            const title = notification.request.content.title ?? 'Notification';
            const body = notification.request.content.body ?? '';
            showAlert({ title, message: body, type: 'info' });
          });

          responseSub = Notifications.addNotificationResponseReceivedListener(() => {
            // Handle taps if needed
          });
        } catch (importError) {
          // Notifications module not available - continue without listeners
          console.log('[App] Notification listeners not available');
        }
      } catch (error) {
        console.error('[App] Error setting up notifications:', error);
      }
    })();

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, [showAlert]);

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={c.background} />
      <RootNavigation />
    </NavigationContainer>
  );
}

import GettingStartedGuideScreen from './src/screens/GettingStartedGuideScreen';
import * as storage from './src/utils/storage';

function RootNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { setRole } = useRole();
  const c = useThemeColors();
  const [hasSeenGuide, setHasSeenGuide] = React.useState<boolean | null>(null);

  // Sync user type with role context
  useEffect(() => {
    if (user) {
      setRole(user.userType);
      checkGuideStatus();
    } else {
      setRole(null);
      setHasSeenGuide(null); // Reset on logout
    }
  }, [user, setRole]);

  const checkGuideStatus = async () => {
    if (!user) return;
    const seen = await storage.getItem(`@connecta/walkthrough_completed_${user._id}`);
    setHasSeenGuide(seen === 'true');
  };

  const handleGuideFinish = async () => {
    if (user) {
      await storage.setItem(`@connecta/walkthrough_completed_${user._id}`, 'true');
      setHasSeenGuide(true);
    }
  };

  // Show loading screen while checking auth status
  if (isLoading || (isAuthenticated && hasSeenGuide === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthNavigator />;
  }

  // Force email verification
  if (!user.isVerified) {
    return <EmailVerificationScreen />;
  }

  // Show Onboarding Guide if not seen
  if (hasSeenGuide === false) {
    return <GettingStartedGuideScreen onFinish={handleGuideFinish} />;
  }

  // Show role-based navigator
  if (user.userType === 'client') {
    return <ClientNavigator />;
  }

  return <FreelancerNavigator />;
}
