import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { verifyOTP, sendPasswordResetOTP, verifyEmail, resendVerification, signup } from '../services/authService';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import { useNavigation } from '@react-navigation/native';

interface OTPVerificationScreenProps {
    email: string;
    mode?: 'signup' | 'forgotPassword';
    onBackToForgotPassword?: () => void;
    onOTPVerified?: (tokenData: string | { token: string; user: any }) => void;
    role?: 'client' | 'freelancer';
    signupData?: any;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
    email,
    mode = 'forgotPassword',
    onBackToForgotPassword,
    onOTPVerified,
    signupData
}) => {
    const navigation = useNavigation();
    // ... existing state ...
    const c = useThemeColors();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType; onOk?: () => void }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: AlertType = 'success', onOk?: () => void) => {
        setAlertConfig({ title, message, type, onOk });
        setAlertVisible(true);
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
        if (alertConfig.onOk) {
            alertConfig.onOk();
        }
    };

    // ... useEffect ...
    useEffect(() => {
        // Auto-focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Start countdown timer
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOTPChange = (value: string, index: number) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 4 digits are entered
        if (newOtp.every(digit => digit !== '') && index === 3) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (otpCode?: string) => {
        const code = otpCode || otp.join('');

        if (code.length !== 4) {
            showAlert('Error', 'Please enter the complete 4-digit code', 'error');
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // Email Verification Flow
                const response = await verifyEmail(code, email);
                console.log('Verify Email Response:', JSON.stringify(response, null, 2));
                const data = response as any;

                // Handle various response structures
                const token = data.token || data.data?.token || (response as any).token;
                const user = data.user || data.data?.user || (response as any).user;

                if (token) {
                    // onOTPVerified?.({ token, user }); // This usually logs in

                    // Navigate to Interest Form (SkillSelection)
                    showAlert('Success', 'Email verified successfully!', 'success', () => {
                        (navigation as any).navigate('SkillSelection', { token, user });
                    });
                } else {
                    // Should not happen if successful
                    if (response.success) {
                        // Fallback: Verification worked but no token returned. Send to login.
                        showAlert('Success', 'Email verified successfully! Please log in.', 'success', () => {
                            (navigation as any).navigate('Login');
                        });
                    } else {
                        throw new Error('Verification failed');
                    }
                }
            } else {
                // Password Reset Flow
                const response = await verifyOTP(email, code);
                if (response.resetToken) {
                    onOTPVerified?.(response.resetToken);
                } else {
                    throw new Error('No reset token received');
                }
            }
        } catch (error: any) {
            console.error('Verify OTP Error:', error);
            showAlert('Error', error.response?.data?.message || error.message || 'Invalid verification code. Please try again.', 'error');
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        try {
            if (mode === 'signup') {
                await resendVerification();
            } else {
                await sendPasswordResetOTP(email);
            }

            showAlert('Success', 'A new verification code has been sent to your email.', 'success');
            setResendTimer(60);
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            showAlert('Error', error.response?.data?.message || 'Failed to resend code. Please try again.', 'error');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity onPress={onBackToForgotPassword} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>

                    <View style={styles.center}>
                        <View style={[styles.logoWrap, { backgroundColor: c.card, shadowColor: c.primary }]}>
                            <MaterialIcons name="mail-outline" size={48} color={c.primary} />
                        </View>
                        <Text style={[styles.title, { color: c.text }]}>Verify Your Email</Text>
                        <Text style={[styles.subtitle, { color: c.subtext }]}>
                            We've sent a 4-digit code to{'\n'}
                            <Text style={{ fontWeight: '700', color: c.text }}>{email}</Text>
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.otpBox,
                                            {
                                                borderColor: digit ? c.primary : c.border,
                                                backgroundColor: c.card
                                            }
                                        ]}
                                    >
                                        <TextInput
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            value={digit}
                                            onChangeText={(value) => handleOTPChange(value, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            style={[styles.otpInput, { color: c.text }]}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                            editable={!isLoading}
                                        />
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={() => handleVerifyOTP()}
                                activeOpacity={0.9}
                                style={[
                                    styles.primaryBtn,
                                    { backgroundColor: c.primary },
                                    isLoading && { opacity: 0.6 }
                                ]}
                                disabled={isLoading}
                            >
                                <Text style={styles.primaryBtnText}>
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>
                                <Text style={[styles.resendText, { color: c.subtext }]}>
                                    Didn't receive the code?
                                </Text>
                                <TouchableOpacity
                                    onPress={handleResendOTP}
                                    disabled={resendTimer > 0}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={[
                                        styles.resendLink,
                                        { color: resendTimer > 0 ? c.subtext : c.primary }
                                    ]}>
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={handleAlertClose}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        padding: 8,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoWrap: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 28,
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    form: {
        width: '100%',
        maxWidth: 380,
        marginTop: 32,
        gap: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    otpBox: {
        width: 64,
        height: 64,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    otpInput: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%',
    },
    primaryBtn: {
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    resendText: {
        fontSize: 13,
    },
    resendLink: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default OTPVerificationScreen;
