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

    // Dynamically import expo-notifications only on native platforms
    let receivedSub: any;
    let responseSub: any;

    (async () => {
      const Notifications = await import('expo-notifications');

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

      receivedSub = Notifications.addNotificationReceivedListener((notification: any) => {
        const title = notification.request.content.title ?? 'Notification';
        const body = notification.request.content.body ?? '';
        showAlert({ title, message: body, type: 'info' });
      });

      responseSub = Notifications.addNotificationResponseReceivedListener(() => {
        // Handle taps if needed
      });
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

function RootNavigation() {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const { setRole } = useRole();
  const c = useThemeColors();
  const [hasSeenGuide, setHasSeenGuide] = React.useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = React.useState(false);
  const [needsSkills, setNeedsSkills] = React.useState(false);

  // Sync user type with role context
  useEffect(() => {
    if (user) {
      setRole(user.userType);
      checkGuideStatus();
    } else {
      setRole(null);
      setHasSeenGuide(null); // Reset on logout
      setNeedsSkills(false);
    }
  }, [user, setRole]);

  // Check if freelancer has skills
  useEffect(() => {
    const checkFreelancerSkills = async () => {
      if (user && user.userType === 'freelancer' && isAuthenticated) {
        setIsCheckingProfile(true);
        try {
          const profile = await profileService.getMyProfile();
          if (!profile || !profile.skills || profile.skills.length === 0) {
            setNeedsSkills(true);
          } else {
            setNeedsSkills(false);
          }
        } catch (error) {
          console.error('Error checking profile skills:', error);
          // Fail safe: assume they might need skills if error is 404 (handled in service but here for safety)
          // Or maybe don't block if network error? 
          // Let's assume if we can't fetch, we don't block for now to avoid lockout.
          // But typically if 404 => createProfile => returns null/empty in getMyProfile wrapper?
        } finally {
          setIsCheckingProfile(false);
        }
      }
    };

    checkFreelancerSkills();
  }, [user, isAuthenticated]);

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

  // Show loading screen while checking auth status OR checking profile
  if (isLoading || isCheckingProfile || (isAuthenticated && hasSeenGuide === null)) {
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

  // Force Skills Selection for Freelancers
  if (needsSkills && user.userType === 'freelancer') {
    // Must verify token is available to pass, though AuthContext provides it.
    // We render SkillSelectionScreen directly or via stack? 
    // Since RootNavigation usually returns a Navigator, we can return SkillSelection inside a simple view/provider context
    // OR we can use the AuthNavigator but navigate to SkillSelection.
    // But AuthNavigator is disconnected from here.
    // Easiest: Render SkillSelectionScreen directly as a "modal" / "interstitial"
    // But SkillSelectionScreen expects { route, navigation }.
    // So we wrap it or use a temporary stack.
    // Actually, let's just use a special "OnboardingNavigator" or render it.
    // Better: Return a wrapper that provides route/nav mocks or real ones if we make a stack.

    // Let's repurpose SkillSelectionScreen to be usable here.
    // Note: We need to pass token/user so it can handle the "Save" action which calls loginWithToken (refreshing state).

    return (
      <AuthNavigatorStackWrapper initialRoute="SkillSelection" initialParams={{ token, user }} />
    );
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
