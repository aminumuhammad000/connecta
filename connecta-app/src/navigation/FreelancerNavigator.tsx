import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

// Screens
import FreelancerDashboardScreen from '../screens/FreelancerDashboardScreen';
import FreelancerMatchedGigsScreen from '../screens/FreelancerMatchedGigsScreen';
import MyProposalsScreen from '../screens/MyProposalsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import FreelancerSavedGigsScreen from '../screens/FreelancerSavedGigsScreen';
import FreelancerApplicationsScreen from '../screens/FreelancerApplicationsScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import AddPortfolioScreen from '../screens/AddPortfolioScreen';
import ConnectaAIScreen from '../screens/ConnectaAIScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function FreelancerTabs() {
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
                    else if (route.name === 'Gigs') iconName = 'search';
                    else if (route.name === 'Proposals') iconName = 'description';
                    else if (route.name === 'Messages') iconName = 'chat';
                    else if (route.name === 'Profile') iconName = 'person';

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={FreelancerDashboardScreen} />
            <Tab.Screen name="Gigs" component={FreelancerMatchedGigsScreen} />
            <Tab.Screen name="Proposals" component={MyProposalsScreen} />
            <Tab.Screen name="Messages" component={ChatsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function FreelancerNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FreelancerTabs" component={FreelancerTabs} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="FreelancerSavedGigs" component={FreelancerSavedGigsScreen} />
            <Stack.Screen name="FreelancerApplications" component={FreelancerApplicationsScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            <Stack.Screen name="AddPortfolio" component={AddPortfolioScreen} />
            <Stack.Screen name="ConnectaAI" component={ConnectaAIScreen} />
            <Stack.Screen name="MessagesDetail" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PersonalInformation" component={require('../screens/PersonalInformationScreen').default} />
            <Stack.Screen name="Security" component={require('../screens/SecurityScreen').default} />
            <Stack.Screen name="HelpSupport" component={require('../screens/HelpSupportScreen').default} />
            <Stack.Screen name="ContactSupport" component={require('../screens/ContactSupportScreen').default} />
            <Stack.Screen name="ProposalDetail" component={require('../screens/ProposalDetailScreen').default} />
            <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        </Stack.Navigator>
    );
}
