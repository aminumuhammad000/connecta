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

// ... imports ...
import * as profileService from './src/services/profileService';

import RootNavigator from './src/navigation/RootNavigator';

function RootNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { setRole } = useRole();
  const c = useThemeColors();

  // Sync user type with role context
  useEffect(() => {
    if (user) {
      setRole(user.userType);
    } else {
      setRole(null);
    }
  }, [user, setRole]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  // The RootNavigator handles the Landing -> Auth/App flow
  return <RootNavigator />;
}

// Temporary wrapper to re-use AuthNavigator screens without full auth context reset
// Or simpler: Just return AuthNavigator with initial route.
function AuthNavigatorStackWrapper({ initialRoute, initialParams }: any) {
  // We import Stack from outside or create new
  // But AuthNavigator exports a component.
  // We can't easily force initialRoute on existing AuthNavigator component unless we modify it.
  // So let's modify AuthNavigator to accept initialRoute?
  // Or just render SkillSelectionScreen with a mock navigation object?

  // Valid approach: Render AuthNavigator but make sure it handles the "authenticated but missing skills" state.
  // Use a lightweight Stack here.
  const Stack = React.useMemo(() => {
    const { createNativeStackNavigator } = require('@react-navigation/native-stack');
    return createNativeStackNavigator();
  }, []);

  // Import screens locally to avoid circular deps if any
  const SkillSelectionScreen = require('./src/screens/SkillSelectionScreen').default;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SkillSelection"
        component={SkillSelectionScreen}
        initialParams={initialParams}
      />
    </Stack.Navigator>
  );
}
