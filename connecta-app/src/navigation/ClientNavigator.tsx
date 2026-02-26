import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import ClientDashboardScreen from '../screens/ClientDashboardScreen';
import ClientJobsScreen from '../screens/ClientJobsScreen';
import ClientProjectsScreen from '../screens/ClientProjectsScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatsScreen from '../screens/ChatsScreen';
import PostJobScreen from '../screens/PostJobScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectWorkspaceScreen from '../screens/ProjectWorkspaceScreen';
import ClientRecommendedFreelancersScreen from '../screens/ClientRecommendedFreelancersScreen';
import ClientPaymentsScreen from '../screens/ClientPaymentsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentCallbackScreen from '../screens/PaymentCallbackScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

import SecurityScreen from '../screens/SecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import ConnectaAIScreen from '../screens/ConnectaAIScreen';
import ClientEditProfileScreen from '../screens/ClientEditProfileScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import ProposalsScreen from '../screens/ProposalsScreen';
import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import PublicFreelancerProfileScreen from '../screens/PublicFreelancerProfileScreen';
import IdentityVerificationScreen from '../screens/IdentityVerificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getTotalUnreadCount } from '../services/messageService';
import { useState, useEffect } from 'react';



function ClientTabs() {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { unreadCount } = useSocket();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

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
                    } else if (route.name === 'Projects') {
                        iconName = focused ? 'folder-open' : 'folder-open-outline';
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
            <Tab.Screen name="Home" component={ClientDashboardScreen} />
            <Tab.Screen name="Jobs" component={ClientJobsScreen} />
            <Tab.Screen name="Projects" component={ClientProjectsScreen} />
            <Tab.Screen name="Messages" component={ChatsScreen} />
            <Tab.Screen name="Profile" component={ClientProfileScreen} />
        </Tab.Navigator>
    );
}

import DesktopLayout from '../components/layout/DesktopLayout';
import { useTheme } from '../context/ThemeContext';


export default function ClientNavigator() {
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
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="PostCollaboJob" component={require('../screens/PostCollaboJobScreen').default} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="CollaboWorkspace" component={require('../screens/CollaboWorkspaceScreen').default} />
            <Stack.Screen name="SelectFreelancer" component={require('../screens/SelectFreelancerScreen').default} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="ProjectWorkspace" component={ProjectWorkspaceScreen} />
            <Stack.Screen name="ClientRecommended" component={ClientRecommendedFreelancersScreen} />
            <Stack.Screen name="FreelancerPublicProfile" component={PublicFreelancerProfileScreen} />
            <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
            <Stack.Screen name="ClientPayments" component={ClientPaymentsScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentCallback" component={PaymentCallbackScreen} />
            <Stack.Screen name="MessagesDetail" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen as any} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
            <Stack.Screen name="AIChat" component={ConnectaAIScreen} />
            <Stack.Screen name="ClientEditProfile" component={ClientEditProfileScreen} />
            <Stack.Screen name="Proposals" component={ProposalsScreen} />
            <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
            <Stack.Screen name="AdminWithdrawals" component={require('../screens/AdminWithdrawalsScreen').default} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
            <Stack.Screen name="About" component={require('../screens/AboutScreen').default} />
            <Stack.Screen name="Terms" component={require('../screens/TermsScreen').default} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
            <Stack.Screen name="SparkHistory" component={require('../screens/SparkHistoryScreen').default} />
            <Stack.Screen name="Wallet" component={require('../screens/WalletScreen').default} />
            <Stack.Screen name="SendSpark" component={require('../screens/SendSparkScreen').default} />
            <Stack.Screen name="ReceiveSpark" component={require('../screens/ReceiveSparkScreen').default} />
            <Stack.Screen name="SetTransactionPin" component={require('../screens/SetTransactionPinScreen').default} />
        </Stack.Navigator>
    );

    if (isDesktop) {
        return <DesktopLayout>{stack}</DesktopLayout>;
    }

    return stack;
}
