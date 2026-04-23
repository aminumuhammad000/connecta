import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions, View } from 'react-native';

// Screens
import FreelancerDashboardScreen from '../screens/FreelancerDashboardScreen';
import FreelancerMatchedGigsScreen from '../screens/FreelancerMatchedGigsScreen';
import MyProposalsScreen from '../screens/MyProposalsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ApplyJobScreen from '../screens/ApplyJobScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import SecurityScreen from '../screens/SecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

import ProposalDetailScreen from '../screens/ProposalDetailScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import WithdrawalSetupScreen from '../screens/WithdrawalSetupScreen';
import AboutScreen from '../screens/AboutScreen';
import TermsScreen from '../screens/TermsScreen';
import FreelancerWriteReviewScreen from '../screens/FreelancerWriteReviewScreen';
import FreelancerProjectsScreen from '../screens/FreelancerProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import DesktopLayout from '../components/layout/DesktopLayout';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getTotalUnreadCount } from '../services/messageService';
import { useState, useEffect } from 'react';

function FreelancerTabs() {
    const c = useThemeColors();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { unreadCount } = useSocket();

    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: any }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: c.card,
                    borderTopWidth: 0,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    display: isDesktop ? 'none' : 'flex',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: -4,
                },
                tabBarActiveTintColor: c.primary,
                tabBarInactiveTintColor: c.subtext,
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

                    if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
                tabBarBadge: route.name === 'Messages' && unreadCount > 0 ? unreadCount : undefined,
                tabBarBadgeStyle: {
                    backgroundColor: '#EF4444', // Red color
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                }
            })}
        >
            <Tab.Screen name="Home" component={FreelancerDashboardScreen} />
            <Tab.Screen name="Jobs" component={FreelancerMatchedGigsScreen} />

            <Tab.Screen name="Messages" component={ChatsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function FreelancerNavigator() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const { setThemeMode } = useTheme();

    useEffect(() => {
        if (isDesktop) {
            setThemeMode('light'); // Enforce light mode on Desktop
        }
    }, [isDesktop, setThemeMode]);

    const stack = (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FreelancerTabs" component={FreelancerTabs} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
            <Stack.Screen name="MessagesDetail" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen as any} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

            <Stack.Screen name="ProposalDetail" component={ProposalDetailScreen} />
            <Stack.Screen name="Proposals" component={MyProposalsScreen} />
            <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="WithdrawalSetup" component={WithdrawalSetupScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="FreelancerWriteReview" component={FreelancerWriteReviewScreen} />
            <Stack.Screen name="FreelancerProjects" component={FreelancerProjectsScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        </Stack.Navigator>
    );

    if (isDesktop) {
        return <DesktopLayout>{stack}</DesktopLayout>;
    }

    return stack;
}
