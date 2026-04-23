import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
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
import * as authService from '../services/authService';

const SignupPasswordScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

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
        setPasswordError('');
        setConfirmError('');

        let hasError = false;
        if (password.length < 6) {
            setPasswordError('A good password needs at least 6 characters!');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Wait, those passwords don\'t match. Try again?');
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        setIsLoading(true);
        try {
            await storage.savePendingSignupData({
                password,
                country: 'Nigeria',
                location: 'Nigeria',
            });

            const freshData = await storage.getPendingSignupData();

            await authService.initiateSignup(
                freshData.email,
                freshData.firstName,
                'en'
            );

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            (navigation as any).navigate('OTPVerification', {
                email: freshData.email,
                mode: 'signup',
                role: freshData.userType
            });
        } catch (error: any) {
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
                        <SignupProgressBar currentStep={4} totalSteps={5} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentContainer}>
                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: firstName ? `Keep it safe, ${firstName}!` : 'Keep it safe!' },
                                        { text: "Choose a password you won't forget.", delay: 1000 }
                                    ]}
                                />
                            </View>

                            <View style={styles.form}>
                                <View style={styles.passContainer}>
                                    <Input
                                        value={password}
                                        onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                                        placeholder="Password"
                                        icon="lock-outline"
                                        secureTextEntry={!showPassword}
                                        error={passwordError}
                                    />
                                    <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    value={confirmPassword}
                                    onChangeText={(val) => { setConfirmPassword(val); setConfirmError(''); }}
                                    placeholder="Repeat Password"
                                    icon="lock-outline"
                                    secureTextEntry={!showPassword}
                                    error={confirmError}
                                />
                            </View>

                            <View style={styles.footer}>
                                <View style={styles.buttonWrapper}>
                                    <Button title="Continue" onPress={handleContinue} loading={isLoading} size="large" />
                                </View>
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
    contentContainer: { gap: 40 },
    chatSection: {
        marginBottom: 0,
    },
    form: { gap: 24 },
    passContainer: { position: 'relative' },
    eye: { position: 'absolute', right: 16, top: 18 },
    footer: { marginTop: 20, alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
});

export default SignupPasswordScreen;
