import React, { useState } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SignupScreen from '../screens/SignupScreen';
import AuthScreen from '../screens/AuthScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SkillSelectionScreen from '../screens/SkillSelectionScreen';
import FreelancerOnboardingScreen from '../screens/FreelancerOnboardingScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import SignupDetailsScreen from '../screens/SignupDetailsScreen';
import LocationOnboardingScreen from '../screens/LocationOnboardingScreen';
import MatchingJobsScreen from '../screens/MatchingJobsScreen';
import SignupPasswordScreen from '../screens/SignupPasswordScreen';
import * as storage from '../utils/storage';
import { signup } from '../services/authService';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    const initialRoute = 'LanguageSelect';

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
            <Stack.Screen name="Welcome" component={WelcomeWrapper} />
            <Stack.Screen name="Login" component={LoginWrapper} options={{ title: 'Login' }} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: 'Select Role' }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
            <Stack.Screen name="SignupDetails" component={SignupDetailsScreen} options={{ title: 'Contact Info' }} />
            <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} options={{ title: 'Security' }} />
            <Stack.Screen name="LocationOnboarding" component={LocationOnboardingScreen} options={{ title: 'Location' }} />
            <Stack.Screen name="AuthSelection" component={AuthScreen} options={{ title: 'Welcome' }} />
            <Stack.Screen name="Success" component={SuccessScreen} options={{ title: 'Success' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordWrapper} options={{ title: 'Forgot Password' }} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationWrapper} options={{ title: 'Verify OTP' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordWrapper} options={{ title: 'Reset Password' }} />
            <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} options={{ title: 'Skills Selection' }} />
            <Stack.Screen name="FreelancerOnboarding" component={FreelancerOnboardingScreen} options={{ title: 'Onboarding' }} />
            <Stack.Screen name="MatchingJobs" component={MatchingJobsScreen} options={{ title: 'Matching Jobs' }} />
        </Stack.Navigator>
    );
}

function OnboardingWrapper({ navigation }: any) {
    return (
        <OnboardingScreen navigation={navigation} />
    );
}

function WelcomeWrapper({ navigation }: any) {
    return (
        <WelcomeScreen
            onLogin={() => navigation.navigate('Login')}
            onSignup={() => navigation.navigate('RoleSelection')}
        />
    );
}

function LoginWrapper({ navigation }: any) {
    return (
        <LoginScreen
            onSignedIn={(user: any) => {
                // Navigate based on role
                if (user?.userType === 'client') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ClientMain' }],
                    });
                } else if (user?.userType === 'freelancer') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'FreelancerMain' }],
                    });
                }
            }}
            onSignup={() => navigation.navigate('RoleSelection')}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
        />
    );
}

function ForgotPasswordWrapper({ navigation }: any) {
    return (
        <ForgotPasswordScreen
            onBackToLogin={() => navigation.goBack()}
            onOTPSent={(email: string) => navigation.navigate('OTPVerification', { email })}
        />
    );
}

function OTPVerificationWrapper({ navigation, route }: any) {
    const { email, mode, role } = route.params || {};

    return (
        <OTPVerificationScreen />
    );
}

function ResetPasswordWrapper({ navigation, route }: any) {
    const { email, resetToken } = route.params || {};

    return (
        <ResetPasswordScreen
            email={email}
            resetToken={resetToken}
            onPasswordReset={() => navigation.navigate('Login')}
        />
    );
}
