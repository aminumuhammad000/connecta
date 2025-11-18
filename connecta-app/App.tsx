import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PostJobScreen from './src/screens/PostJobScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import { useThemeColors } from './src/theme/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RoleSelect: undefined;
  Signup: undefined;
  PostJob: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();
  const c = useThemeColors();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={c.background} />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeWrapper} />
          <Stack.Screen name="Login" component={LoginWrapper} />
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="PostJob" component={PostJobScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function WelcomeWrapper({ navigation }: any) {
  return (
    <WelcomeScreen
      onGetStarted={() => navigation.replace('Login')}
      onLogin={() => navigation.replace('Login')}
    />
  );
}

function LoginWrapper({ navigation }: any) {
  return (
    <LoginScreen
      onSignedIn={() => navigation.replace('Dashboard')}
      onSignup={() => navigation.navigate('RoleSelect')}
    />
  );
}
