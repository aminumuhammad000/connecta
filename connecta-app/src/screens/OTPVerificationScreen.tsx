import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { verifyOTP, signup, resendVerification, initiateSignup, sendPasswordResetOTP } from '../services/authService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as storage from '../utils/storage';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';
import SignupProgressBar from '../components/SignupProgressBar';
import Button from '../components/Button';

const OTPVerificationScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const route = useRoute();
    const { showAlert } = useInAppAlert();
    const { signup: performSignup } = useAuth();

    const { email: initialEmail, mode = 'forgotPassword' } = (route.params as any) || {};

    const [userEmail, setUserEmail] = useState(initialEmail || '');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const activeIndex = useSharedValue(0);
    const boxesScale = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)];

    useEffect(() => {
        const fetchEmail = async () => {
            if (!userEmail) {
                const data = await storage.getPendingSignupData();
                if (data?.email) setUserEmail(data.email);
            }
        };

        if (!userEmail) fetchEmail();
        
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
            activeIndex.value = index + 1;
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            activeIndex.value = index - 1;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleVerifyOTP = async (otpCode?: string) => {
        if (isLoading) return;
        const code = otpCode || otp.join('');
        if (code.length !== 4) return;

        setIsLoading(true);
        try {
            console.log(`[OTP] Verifying code: ${code} for mode: ${mode}`);
            if (mode === 'signup') {
                const pendingData = await storage.getPendingSignupData();

                const response = await performSignup({
                    ...pendingData,
                    otp: code,
                }, true);

                const user = response.user || (response as any).data?.user;

                await storage.clearPendingSignupData();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                if (user?.userType === 'freelancer') {
                    (navigation as any).reset({
                        index: 0,
                        routes: [{ name: 'FreelancerProfileSetup', params: { user } }],
                    });
                } else {
                    (navigation as any).reset({
                        index: 0,
                        routes: [{ name: 'ClientMain' }],
                    });
                }
            } else {
                const response = await verifyOTP(userEmail || initialEmail, code);
                const token = (response as any).token || (response as any).data?.token || (response as any).resetToken || (response as any).data?.resetToken;

                if (token) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    (navigation as any).navigate('ResetPassword', { email: userEmail || initialEmail, resetToken: token });
                } else {
                    console.warn('[OTP] Success response but no token found:', response);
                }
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showAlert({ title: 'Error', message: error.message || 'Verification failed', type: 'error' });
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
            activeIndex.value = 0;
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
                await initiateSignup(userEmail || email || pendingData?.email, pendingData?.firstName || 'User', 'en');
            } else if (mode === 'forgotPassword') {
                await sendPasswordResetOTP(userEmail || email);
            } else {
                await resendVerification(userEmail || email);
            }

            setResendTimer(60);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({ title: 'Success', message: 'New verification code sent!', type: 'success' });
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Resend failed', type: 'error' });
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
                        <SignupProgressBar currentStep={5} totalSteps={5} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentContainer}>
                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: 'Verify your email' },
                                        { text: `A 4-digit code was sent to: ${userEmail || 'your email'}.`, delay: 1000 }
                                    ]}
                                />
                            </View>

                            <View style={styles.otpSection}>
                                <View style={styles.otpInputsContainer}>
                                    {otp.map((digit, index) => {
                                        const animatedStyle = useAnimatedStyle(() => {
                                            const scale = index === activeIndex.value ? 1.05 : 1;
                                            return { transform: [{ scale: withSpring(scale) }] };
                                        });

                                        return (
                                            <Animated.View key={index} style={[styles.otpInputBox, { backgroundColor: c.card, borderColor: otp[index] ? c.primary : c.border }, animatedStyle]}>
                                                <TextInput
                                                    ref={(el) => { inputRefs.current[index] = el; }}
                                                    style={[styles.otpInput, { color: c.text }]}
                                                    value={digit}
                                                    onChangeText={(value) => handleOTPChange(value, index)}
                                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                                    keyboardType="number-pad"
                                                    maxLength={1}
                                                    selectTextOnFocus
                                                    editable={!isLoading}
                                                />
                                            </Animated.View>
                                        );
                                    })}
                                </View>

                                <View style={styles.resendContainer}>
                                    {resendTimer > 0 ? (
                                        <View style={styles.timerRow}>
                                            <Ionicons name="time-outline" size={16} color={c.subtext} />
                                            <Text style={[styles.timerText, { color: c.subtext }]}>
                                                Resend in <Text style={{ color: c.primary, fontWeight: '700' }}>{resendTimer}s</Text>
                                            </Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            disabled={isLoading}
                                            onPress={handleResend}
                                            style={styles.resendBtn}
                                        >
                                            <Text style={[styles.resendText, { color: c.primary }]}>
                                                Resend Code
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.verifyContainer}>
                                    <View style={styles.buttonWrapper}>
                                        <Button
                                            title="Verify Code"
                                            onPress={() => handleVerifyOTP()}
                                            loading={isLoading}
                                            disabled={otp.some(d => !d) || isLoading}
                                            size="large"
                                        />
                                    </View>
                                </View>

                                <View style={styles.changeEmailRow}>
                                    <Text style={[styles.changeEmailText, { color: c.subtext }]}>Incorrect email?</Text>
                                    <TouchableOpacity onPress={() => {
                                        if (mode === 'signup') {
                                            (navigation as any).navigate('SignupDetails');
                                        } else {
                                            navigation.goBack();
                                        }
                                    }}>
                                        <Text style={[styles.changeEmailLink, { color: c.primary }]}>Change it</Text>
                                    </TouchableOpacity>
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        flexGrow: 1,
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
        width: '100%',
        marginBottom: 8,
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
    chatSection: { marginBottom: 0 },
    otpSection: { gap: 32 },
    otpInputsContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        width: '100%',
    },
    otpInputBox: {
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
    resendContainer: { width: '100%', alignItems: 'flex-end', marginBottom: -10 },
    verifyContainer: { width: '100%', alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
    timerText: { fontSize: 15, fontWeight: '500' },
    resendBtn: { padding: 8 },
    resendText: { fontSize: 16, fontWeight: '700' },
    changeEmailRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 10, width: '100%' },
    changeEmailText: { fontSize: 14, fontWeight: '500' },
    changeEmailLink: { fontSize: 14, fontWeight: '700' },
});

export default OTPVerificationScreen;
