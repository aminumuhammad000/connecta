import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import Button from './Button';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from './InAppAlert';

interface EmailVerificationModalProps {
    visible: boolean;
    onSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
    visible,
    onSuccess,
}) => {
    const c = useThemeColors();
    const { user, logout, updateUser } = useAuth();
    const { showAlert } = useInAppAlert();

    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0 && visible) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer, visible]);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto verify? Optional. Let's keep manual button for stability or auto-verify if desired.
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            showAlert({ title: 'Error', message: 'Please enter the complete 4-digit code', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.verifyEmail(otpString);
            if (response.success) {
                showAlert({ title: 'Success', message: 'Email verified successfully!', type: 'success' });
                // Update local user state
                if (user) {
                    updateUser({ ...user, isVerified: true });
                }
                onSuccess();
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Invalid code';
            showAlert({ title: 'Verification Failed', message: msg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        try {
            await authService.resendVerification();
            showAlert({ title: 'Sent', message: 'New code sent to your email', type: 'success' });
            setResendTimer(60); // 1 minute cooldown
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            showAlert({ title: 'Error', message: 'Failed to resend code', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent={false} visible={visible} animationType="slide">
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                        {/* Logout/Back Button logic - since we are blocking until verified, show Logout */}
                        <TouchableOpacity onPress={logout} style={styles.backButton}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons name="logout" size={24} color={c.text} />
                                <Text style={{ color: c.text, fontWeight: '600' }}>Log Out</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.center}>
                            <View style={[styles.logoWrap, { backgroundColor: c.card, shadowColor: c.primary }]}>
                                <MaterialIcons name="mark-email-read" size={48} color={c.primary} />
                            </View>
                            <Text style={[styles.title, { color: c.text }]}>Verify Your Email</Text>
                            <Text style={[styles.subtitle, { color: c.subtext }]}>
                                We've sent a 4-digit code to{'\n'}
                                <Text style={{ fontWeight: '700', color: c.text }}>{user?.email}</Text>
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
                                                onChangeText={(value) => handleOtpChange(value, index)}
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
                                    onPress={handleVerify}
                                    activeOpacity={0.9}
                                    style={[
                                        styles.primaryBtn,
                                        { backgroundColor: c.primary },
                                        isLoading && { opacity: 0.6 }
                                    ]}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.primaryBtnText}>
                                        {isLoading ? 'Verifying...' : 'Verify Email'}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.resendContainer}>
                                    <Text style={[styles.resendText, { color: c.subtext }]}>
                                        Didn't receive the code?
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleResend}
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
            </SafeAreaView>
        </Modal>
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

export default EmailVerificationModal;
