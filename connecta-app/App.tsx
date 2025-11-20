import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PostJobScreen from './src/screens/PostJobScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';
import MyProposalsScreen from './src/screens/MyProposalsScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import ClientDashboardScreen from './src/screens/ClientDashboardScreen';
import FreelancerDashboardScreen from './src/screens/FreelancerDashboardScreen';
import FreelancerMatchedGigsScreen from './src/screens/FreelancerMatchedGigsScreen';
import FreelancerSavedGigsScreen from './src/screens/FreelancerSavedGigsScreen';
import FreelancerApplicationsScreen from './src/screens/FreelancerApplicationsScreen';
import ClientJobsScreen from './src/screens/ClientJobsScreen';
import ClientProjectsScreen from './src/screens/ClientProjectsScreen';
import ClientRecommendedFreelancersScreen from './src/screens/ClientRecommendedFreelancersScreen';
import ClientPaymentsScreen from './src/screens/ClientPaymentsScreen';
import ClientContractsScreen from './src/screens/ClientContractsScreen';
import ClientWriteReviewScreen from './src/screens/ClientWriteReviewScreen';
import ClientMyReviewsScreen from './src/screens/ClientMyReviewsScreen';
import ClientReviewDetailsScreen from './src/screens/ClientReviewDetailsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import ContactSupportScreen from './src/screens/ContactSupportScreen';
import GettingStartedGuideScreen from './src/screens/GettingStartedGuideScreen';
import { RoleProvider, useRole } from './src/context/RoleContext';
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
  JobDetail: undefined;
  MyProposals: undefined;
  ClientProfile: undefined;
  ClientDashboard: undefined;
  FreelancerDashboard: undefined;
  FreelancerMatchedGigs: undefined;
  FreelancerSavedGigs: undefined;
  FreelancerApplications: undefined;
  ClientJobs: undefined;
  ClientProjects: undefined;
  ClientRecommended: undefined;
  ClientPayments: undefined;
  ClientContracts: undefined;
  ClientWriteReview: undefined;
  ClientMyReviews: undefined;
  ClientReviewDetails: undefined;
  HelpSupport: undefined;
  ContactSupport: undefined;
  GettingStarted: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();
  const c = useThemeColors();
  return (
    <SafeAreaProvider>
      <RoleProvider>
        <NavigationContainer>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={c.background} />
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeWrapper} />
            <Stack.Screen name="Login" component={LoginWrapper} />
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="ClientDashboard" component={ClientDashboardScreen} />
            <Stack.Screen name="FreelancerDashboard" component={FreelancerDashboardScreen} />
            <Stack.Screen name="FreelancerMatchedGigs" component={FreelancerMatchedGigsScreen} />
            <Stack.Screen name="FreelancerSavedGigs" component={FreelancerSavedGigsScreen} />
            <Stack.Screen name="FreelancerApplications" component={FreelancerApplicationsScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="MyProposals" component={MyProposalsScreen} />
            <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
            <Stack.Screen name="ClientJobs" component={ClientJobsScreen} />
            <Stack.Screen name="ClientProjects" component={ClientProjectsScreen} />
            <Stack.Screen name="ClientRecommended" component={ClientRecommendedFreelancersScreen} />
            <Stack.Screen name="ClientPayments" component={ClientPaymentsScreen} />
            <Stack.Screen name="ClientContracts" component={ClientContractsScreen} />
            <Stack.Screen name="ClientWriteReview" component={ClientWriteReviewScreen} />
            <Stack.Screen name="ClientMyReviews" component={ClientMyReviewsScreen} />
            <Stack.Screen name="ClientReviewDetails" component={ClientReviewDetailsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
            <Stack.Screen name="GettingStarted" component={GettingStartedGuideScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </RoleProvider>
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
  const { role } = useRole();
  return (
    <LoginScreen
      onSignedIn={() => {
        if (role === 'client') navigation.replace('ClientDashboard');
        else if (role === 'freelancer') navigation.replace('FreelancerDashboard');
        else navigation.replace('Dashboard');
      }}
      onSignup={() => navigation.navigate('RoleSelect')}
    />
  );
}
