import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { verifyOTP, signup, verifyEmail, resendVerification, initiateSignup, sendPasswordResetOTP } from '../services/authService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import * as storage from '../utils/storage';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';
import SignupProgressBar from '../components/SignupProgressBar';

const OTPVerificationScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const route = useRoute();
    const { t, lang } = useTranslation();
    const { showAlert } = useInAppAlert();
    const { signup: performSignup } = useAuth();

    const { email, mode = 'forgotPassword' } = (route.params as any) || {};

    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Animation values
    const boxesScale = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)];

    useEffect(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();

        const interval = setInterval(() => {
            setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOTPChange = (value: string, index: number) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        boxesScale[index].value = withSequence(withTiming(1.1, { duration: 100 }), withSpring(1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== '') && index === 3) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleVerifyOTP = async (otpCode?: string) => {
        const code = otpCode || otp.join('');
        if (code.length !== 4) return;

        setIsLoading(true);
        try {
            if (mode === 'signup') {
                const pendingData = await storage.getPendingSignupData();

                const response = await performSignup({
                    ...pendingData,
                    otp: code,
                }, true); // autoLogin: true

                const user = response.user || (response as any).data?.user;

                await storage.clearPendingSignupData();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showAlert({
                    title: t('success' as any),
                    message: t('email_verified_success'),
                    type: 'success'
                });

                setTimeout(() => {
                    if (user?.userType === 'freelancer') {
                        (navigation as any).reset({
                            index: 0,
                            routes: [{ name: 'SkillSelection', params: { user } }],
                        });
                    } else {
                        (navigation as any).reset({
                            index: 0,
                            routes: [{ name: 'ClientMain' }],
                        });
                    }
                }, 1000);
            } else {
                const response = await verifyOTP(email, code);
                const token = (response as any).token || (response as any).data?.token;

                if (token) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    (navigation as any).navigate('ResetPassword', { email, resetToken: token });
                }
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showAlert({ title: t('error' as any), message: error.message || 'Verification failed', type: 'error' });
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        try {
            if (mode === 'signup') {
                const pendingData = await storage.getPendingSignupData();
                await initiateSignup(email || pendingData?.email, pendingData?.firstName || 'User', lang);
            } else if (mode === 'forgotPassword') {
                await sendPasswordResetOTP(email);
            } else {
                await resendVerification(email);
            }

            setResendTimer(60);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({ title: t('success' as any), message: 'New verification code sent!', type: 'success' });
        } catch (error: any) {
            showAlert({ title: t('error' as any), message: error.message || 'Resend failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="mail-unread" size={80} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Check Your{'\n'}Inbox</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                We've sent a 4-digit verification code to your email.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <AnimatedBackground />
            <ResponsiveOnboardingWrapper sideComponent={sideContent}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <View style={styles.mainWrapper}>
                        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.headerRow}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Ionicons name="chevron-back" size={24} color={c.text} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => (navigation as any).navigate('LanguageSelect')}
                                    style={[styles.langToggle, { backgroundColor: c.card, borderColor: c.border }]}
                                >
                                    <MaterialIcons name="language" size={18} color={c.primary} />
                                    <Text style={[styles.langToggleText, { color: c.text }]}>
                                        {lang === 'ha' ? 'Hausa' : 'English'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <SignupProgressBar currentStep={6} totalSteps={6} />

                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: t('verify_email') },
                                        { text: t('otp_sub') },
                                        { text: email, delay: 500 }
                                    ]}
                                />
                            </View>

                            <View style={styles.otpContainer}>
                                <View style={styles.otpGrid}>
                                    {otp.map((digit, index) => {
                                        const animatedStyle = useAnimatedStyle(() => ({
                                            transform: [{ scale: boxesScale[index].value }],
                                            borderColor: digit ? c.primary : withTiming(c.border),
                                        }));
                                        return (
                                            <Animated.View key={index} style={[styles.otpBox, animatedStyle, { backgroundColor: c.card }]}>
                                                <TextInput
                                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                                    value={digit}
                                                    onChangeText={(v) => handleOTPChange(v, index)}
                                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                                    style={[styles.otpInput, { color: c.text }]}
                                                    keyboardType="number-pad"
                                                    maxLength={1}
                                                    editable={!isLoading}
                                                />
                                            </Animated.View>
                                        );
                                    })}
                                </View>

                                <View style={styles.resendContainer}>
                                    <TouchableOpacity
                                        disabled={resendTimer > 0 || isLoading}
                                        onPress={handleResend}
                                        style={styles.resendBtn}
                                    >
                                        <Text style={[styles.resendText, { color: resendTimer > 0 || isLoading ? c.subtext : c.primary }]}>
                                            {resendTimer > 0 ? `${t('resend_in')} ${resendTimer}s` : t('resend_code')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ResponsiveOnboardingWrapper>
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
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    langToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, gap: 6 },
    langToggleText: { fontSize: 13, fontWeight: '700' },
    chatSection: {
        marginBottom: 32,
    },
    otpContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    otpGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
        justifyContent: 'center',
        width: '100%',
    },
    otpBox: {
        width: 64,
        height: 76,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    otpInput: { fontSize: 32, fontWeight: '900', textAlign: 'center', width: '100%' },
    resendContainer: { width: '100%', alignItems: 'center' },
    resendBtn: { padding: 12 },
    resendText: { fontSize: 16, fontWeight: '700' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default OTPVerificationScreen;
