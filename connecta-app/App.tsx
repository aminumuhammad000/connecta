import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RoleProvider, useRole } from './src/context/RoleContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { useThemeColors } from './src/theme/theme';
import * as Notifications from 'expo-notifications';
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
    (async () => {
      await configureNotifications();
      const { token, reason } = await registerForPushNotificationsAsync();
      if (token) {
        // Send token to backend
        try {
          await authService.updatePushToken(token);
        } catch (e) {
          console.error('Failed to update push token', e);
        }
      } else if (reason === 'expo-go') {
        showAlert({
          title: 'Push notifications limited in Expo Go',
          message: 'Build a development client to test remote push notifications on device.',
          type: 'info',
        });
      } else {
        showAlert({ title: 'Notifications disabled', message: 'Enable permissions to receive alerts.', type: 'info' });
      }
    })();

    const receivedSub = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      const title = notification.request.content.title ?? 'Notification';
      const body = notification.request.content.body ?? '';
      showAlert({ title, message: body, type: 'info' });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      // Handle taps if needed
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [showAlert]);

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={c.background} />
      <RootNavigation />
    </NavigationContainer>
  );
}

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

  // Show auth screens if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthNavigator />;
  }

  // Force email verification
  if (!user.isVerified) {
    return <EmailVerificationScreen />;
  }

  // Show role-based navigator
  if (user.userType === 'client') {
    return <ClientNavigator />;
  }

  return <FreelancerNavigator />;
}
