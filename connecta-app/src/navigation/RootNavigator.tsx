import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MobileLandingScreen from '../screens/MobileLandingScreen';
import PublicJobSearchScreen from '../screens/PublicJobSearchScreen';
import PublicFreelancerSearchScreen from '../screens/PublicFreelancerSearchScreen';
import PublicJobDetailScreen from '../screens/PublicJobDetailScreen';
import PublicFreelancerProfileScreen from '../screens/PublicFreelancerProfileScreen';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import FreelancerNavigator from './FreelancerNavigator';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { isAuthenticated, user } = useAuth();
    const { role } = useRole();

    const initialRoute = Platform.OS === 'web' ? 'Auth' : 'Landing';

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Landing" component={MobileLandingScreen} />
            <Stack.Screen name="PublicSearch" component={PublicJobSearchScreen} />
            <Stack.Screen name="PublicFreelancerSearch" component={PublicFreelancerSearchScreen} />
            <Stack.Screen name="PublicJobDetail" component={PublicJobDetailScreen} />
            <Stack.Screen name="PublicFreelancerProfile" component={PublicFreelancerProfileScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />

            {/* Main App Routes - Only accessible if authenticated, but defined here for navigation */}
            <Stack.Screen name="ClientMain" component={ClientNavigator} />
            <Stack.Screen name="FreelancerMain" component={FreelancerNavigator} />
        </Stack.Navigator>
    );
}
