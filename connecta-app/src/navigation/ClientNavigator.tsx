import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

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
import ClientRecommendedFreelancersScreen from '../screens/ClientRecommendedFreelancersScreen';
import ClientPaymentsScreen from '../screens/ClientPaymentsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentCallbackScreen from '../screens/PaymentCallbackScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import SecurityScreen from '../screens/SecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import ConnectaAIScreen from '../screens/ConnectaAIScreen';
import ClientEditProfileScreen from '../screens/ClientEditProfileScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import ProposalsScreen from '../screens/ProposalsScreen';
import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientTabs() {
    const c = useThemeColors();

    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: any }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: c.card,
                    borderTopColor: c.border,
                },
                tabBarActiveTintColor: c.primary,
                tabBarInactiveTintColor: c.subtext,
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Jobs') iconName = 'work';
                    else if (route.name === 'Projects') iconName = 'folder';
                    else if (route.name === 'Messages') iconName = 'chat';
                    else if (route.name === 'Profile') iconName = 'person';

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
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

export default function ClientNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="ClientRecommended" component={ClientRecommendedFreelancersScreen} />
            <Stack.Screen name="ClientPayments" component={ClientPaymentsScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentCallback" component={PaymentCallbackScreen} />
            <Stack.Screen name="MessagesDetail" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
            <Stack.Screen name="ConnectaAI" component={ConnectaAIScreen} />
            <Stack.Screen name="ClientEditProfile" component={ClientEditProfileScreen} />
            <Stack.Screen name="Proposals" component={ProposalsScreen} />
            <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        </Stack.Navigator>
    );
}
