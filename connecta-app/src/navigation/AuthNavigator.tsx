import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AuthScreen from '../screens/AuthScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useRole } from '../context/RoleContext';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeWrapper} />
            <Stack.Screen name="Login" component={LoginWrapper} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordWrapper} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationWrapper} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordWrapper} />
        </Stack.Navigator>
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
    const { email } = route.params || {};

    return (
        <OTPVerificationScreen
            email={email}
            onBackToForgotPassword={() => navigation.goBack()}
            onOTPVerified={() => navigation.navigate('ResetPassword', { email })}
        />
    );
}

function ResetPasswordWrapper({ navigation, route }: any) {
    const { email } = route.params || {};

    return (
        <ResetPasswordScreen
            email={email}
            onPasswordReset={() => navigation.navigate('Login')}
        />
    );
}
