import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import * as authService from '../services/authService';
import { checkEmailExists } from '../services/authService';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Input from '../components/Input';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import SignupProgressBar from '../components/SignupProgressBar';
import * as storage from '../utils/storage';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';

const SignupDetailsScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        const loadName = async () => {
            const data = await storage.getPendingSignupData();
            if (data?.firstName) {
                setFirstName(data.firstName);
            }
        };
        loadName();
    }, []);

    const handleContinue = async () => {
        setEmailError('');
        setPhoneError('');

        let hasError = false;
        if (!email.trim() || !email.includes('@')) {
            setEmailError('That email doesn\'t look quite right.');
            hasError = true;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            setPhoneError("That phone number doesn't look right.");
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        setIsLoading(true);
        try {
            const emailCheck = await checkEmailExists(email.trim());
            if (emailCheck.exists) {
                setEmailError('This email is already in use.');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                showAlert({ title: 'Email Taken', message: 'Wait, this email is already being used! Maybe try logging in?', type: 'error' });
                setIsLoading(false);
                return;
            }

            const phoneCheck = await authService.checkPhoneExists(phoneNumber.trim());
            if (phoneCheck.exists) {
                setPhoneError('This phone number is already registered.');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                showAlert({ title: 'Phone Number Taken', message: 'This phone number is already registered. Please use a different one.', type: 'error' });
                setIsLoading(false);
                return;
            }

            await storage.savePendingSignupData({
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                preferredLanguage: 'en',
            });

            (navigation as any).navigate('SignupPassword');
        } catch (error: any) {
            console.error("Signup validation error:", error);
            showAlert({ title: 'Error', message: error.message || 'Saving failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <AnimatedBackground />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.mainWrapper}>
                    <View style={styles.stickyHeader}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        <SignupProgressBar currentStep={3} totalSteps={5} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.chatSection}>
                            <ChatGreeting
                                messages={[
                                    { text: firstName ? `Almost there, ${firstName}!` : 'Almost there!' },
                                    { text: 'We just need your email and phone number to keep your account safe.', delay: 1000, speed: 30 }
                                ]}
                            />
                        </View>

                        <View style={styles.form}>
                            <Input
                                value={email}
                                onChangeText={(val) => { setEmail(val); setEmailError(''); }}
                                placeholder="Email Address"
                                icon="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={emailError}
                            />

                            <Input
                                value={phoneNumber}
                                onChangeText={(val) => { setPhoneNumber(val); setPhoneError(''); }}
                                placeholder="Phone Number"
                                icon="phone-iphone"
                                keyboardType="phone-pad"
                                error={phoneError}
                            />
                        </View>
                        <View style={styles.footer}>
                            <View style={styles.buttonWrapper}>
                                <Button title="Continue" onPress={handleContinue} loading={isLoading} size="large" />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    mainWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        gap: 30,
    },
    stickyHeader: {
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingHorizontal: 24,
        paddingBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.01)',
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    chatSection: {
        marginBottom: 0,
    },
    form: { gap: 24 },
    footer: { paddingTop: 20, alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
});

export default SignupDetailsScreen;
