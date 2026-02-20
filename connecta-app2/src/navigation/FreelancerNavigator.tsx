import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions, View } from 'react-native';

// Screens
import FreelancerDashboardScreen from '../screens/FreelancerDashboardScreen';
import DesktopTopNav from '../components/navigation/DesktopTopNav';
import DesktopLeftSidebar from '../components/navigation/DesktopLeftSidebar';
import DesktopRightSidebar from '../components/navigation/DesktopRightSidebar';
import FreelancerMatchedGigsScreen from '../screens/FreelancerMatchedGigsScreen';
import MyProposalsScreen from '../screens/MyProposalsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import FreelancerSavedGigsScreen from '../screens/FreelancerSavedGigsScreen';
import ProjectWorkspaceScreen from '../screens/ProjectWorkspaceScreen';

import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import AddPortfolioScreen from '../screens/AddPortfolioScreen';
import ConnectaAIScreen from '../screens/ConnectaAIScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import IdentityVerificationScreen from '../screens/IdentityVerificationScreen';

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
                    } else if (route.name === 'Gigs') {
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
            <Tab.Screen name="Gigs" component={FreelancerMatchedGigsScreen} />

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
            <Stack.Screen name="ApplyJob" component={require('../screens/ApplyJobScreen').default} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="ProjectWorkspace" component={ProjectWorkspaceScreen} />
            <Stack.Screen name="FreelancerSavedGigs" component={FreelancerSavedGigsScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            <Stack.Screen name="AddPortfolio" component={require('../screens/AddPortfolioScreen').default} />
            <Stack.Screen name="AIChat" component={ConnectaAIScreen} />
            <Stack.Screen name="MessagesDetail" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationDetail" component={require('../screens/NotificationDetailScreen').default} />
            <Stack.Screen name="Security" component={require('../screens/SecurityScreen').default} />
            <Stack.Screen name="HelpSupport" component={require('../screens/HelpSupportScreen').default} />
            <Stack.Screen name="ContactSupport" component={require('../screens/ContactSupportScreen').default} />
            <Stack.Screen name="ProposalDetail" component={require('../screens/ProposalDetailScreen').default} />
            <Stack.Screen name="ClientProfile" component={require('../screens/ClientProfileScreen').default} />
            <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
            <Stack.Screen name="CollaboWorkspace" component={require('../screens/CollaboWorkspaceScreen').default} />
            <Stack.Screen name="CollaboInvite" component={require('../screens/CollaboInviteScreen').default} />
            <Stack.Screen name="FreelancerProjects" component={require('../screens/FreelancerProjectsScreen').default} />
            <Stack.Screen name="Wallet" component={require('../screens/WalletScreen').default} />
            <Stack.Screen name="WithdrawalSetup" component={require('../screens/WithdrawalSetupScreen').default} />
            <Stack.Screen name="AdminWithdrawals" component={require('../screens/AdminWithdrawalsScreen').default} />
            <Stack.Screen name="About" component={require('../screens/AboutScreen').default} />
            <Stack.Screen name="Terms" component={require('../screens/TermsScreen').default} />
            <Stack.Screen name="JobPreferences" component={require('../screens/JobPreferencesScreen').default} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
            <Stack.Screen name="SparkHistory" component={require('../screens/SparkHistoryScreen').default} />
            <Stack.Screen name="ManageCV" component={require('../screens/ManageCVScreen').default} />
        </Stack.Navigator>
    );

    if (isDesktop) {
        return <DesktopLayout>{stack}</DesktopLayout>;
    }

    return stack;
}
