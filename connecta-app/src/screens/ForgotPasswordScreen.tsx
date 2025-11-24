import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';

interface ForgotPasswordScreenProps {
    onBackToLogin?: () => void;
    onOTPSent?: (email: string) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin, onOTPSent }) => {
    const c = useThemeColors();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            // const response = await api.sendPasswordResetOTP(email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                'OTP Sent',
                'A 4-digit verification code has been sent to your email.',
                [
                    {
                        text: 'OK',
                        onPress: () => onOTPSent?.(email)
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>

                    <View style={styles.center}>
                        <View style={[styles.logoWrap, { backgroundColor: c.card, shadowColor: c.primary }]}>
                            <Logo size={48} />
                        </View>
                        <Text style={[styles.title, { color: c.text }]}>Forgot Password?</Text>
                        <Text style={[styles.subtitle, { color: c.subtext }]}>
                            No worries! Enter your email and we'll send you a verification code.
                        </Text>

                        <View style={styles.form}>
                            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }]}>
                                <MaterialIcons name="mail-outline" size={20} color={c.subtext} style={styles.inputIcon} />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor={c.subtext}
                                    style={[styles.input, { color: c.text }]}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSendOTP}
                                activeOpacity={0.9}
                                style={[
                                    styles.primaryBtn,
                                    { backgroundColor: c.primary },
                                    isLoading && { opacity: 0.6 }
                                ]}
                                disabled={isLoading}
                            >
                                <Text style={styles.primaryBtnText}>
                                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: c.subtext }]}>Remember your password?</Text>
                        <TouchableOpacity onPress={onBackToLogin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={[styles.footerLink, { color: c.primary }]}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    },
    form: {
        width: '100%',
        maxWidth: 380,
        marginTop: 32,
        gap: 14,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
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
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 13,
    },
    footerLink: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
