import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AuthScreen from '../screens/AuthScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SkillSelectionScreen from '../screens/SkillSelectionScreen';
import { useRole } from '../context/RoleContext';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
            <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
            <Stack.Screen name="Welcome" component={WelcomeWrapper} />
            <Stack.Screen name="Login" component={LoginWrapper} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordWrapper} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationWrapper} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordWrapper} />
            <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} />
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
            onSignup={() => navigation.navigate('Signup')}
        />
    );
}

function LoginWrapper({ navigation }: any) {
    return (
        <LoginScreen
            onSignedIn={() => {
                // The RoleContext update will trigger App.tsx to switch navigators
            }}
            onSignup={() => navigation.navigate('Signup')}
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
        <OTPVerificationScreen
            email={email}
            onBackToForgotPassword={() => navigation.goBack()}
            onOTPVerified={(token: string) => {
                // If signing up as freelancer, go to skills selection
                if (mode === 'signup' && role === 'freelancer') {
                    navigation.navigate('SkillSelection', { token });
                } else if (mode === 'signup') {
                    // Client signup - finished
                    // Trigger auth state update or nav to login
                    navigation.navigate('Login'); // Or let AuthContext handle it
                } else {
                    navigation.navigate('ResetPassword', { email, resetToken: token });
                }
            }}
        />
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
