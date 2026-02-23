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

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                /* Public & Auth Flow */
                <>
                    <Stack.Screen name="Landing" component={MobileLandingScreen} options={{ title: 'Home' }} />
                    <Stack.Screen name="PublicSearch" component={PublicJobSearchScreen} options={{ title: 'Search Jobs' }} />
                    <Stack.Screen name="PublicFreelancerSearch" component={PublicFreelancerSearchScreen} options={{ title: 'Search Freelancers' }} />
                    <Stack.Screen name="PublicJobDetail" component={PublicJobDetailScreen} options={{ title: 'Job Details' }} />
                    <Stack.Screen name="PublicFreelancerProfile" component={PublicFreelancerProfileScreen} options={{ title: 'Freelancer Profile' }} />
                    <Stack.Screen name="Auth" component={AuthNavigator} options={{ title: 'Auth' }} />
                </>
            ) : (
                /* Protected App Flow */
                <>
                    {role === 'client' ? (
                        <Stack.Screen name="ClientMain" component={ClientNavigator} options={{ title: 'Client Dashboard' }} />
                    ) : (
                        <Stack.Screen name="FreelancerMain" component={FreelancerNavigator} options={{ title: 'Freelancer Dashboard' }} />
                    )}
                </>
            )}
        </Stack.Navigator>
    );
}
