import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetOTP } from '../services/authService';
import { useInAppAlert } from '../components/InAppAlert';
import ChatGreeting from '../components/ChatGreeting';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedBackground from '../components/AnimatedBackground';
import * as Haptics from 'expo-haptics';

interface ForgotPasswordScreenProps {
    onBackToLogin?: () => void;
    onOTPSent?: (email: string) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin, onOTPSent }) => {
    const navigation = useNavigation();
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const handleSendOTP = async () => {
        setEmailError('');
        if (!email.trim()) {
            setEmailError('Please enter your email address');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        setIsLoading(true);

        try {
            await sendPasswordResetOTP(email);
            showAlert({
                title: 'Success',
                message: 'A 4-digit verification code has been sent to your email.',
                type: 'success'
            });
            onOTPSent?.(email);
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
            showAlert({ title: 'Error', message: errorMessage, type: 'error' });
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
                            <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.chatSection}>
                            <ChatGreeting
                                messages={[
                                    { text: 'Forgot Password?' },
                                    { text: 'No worries! Enter your email and we\'ll send you a verification code.', delay: 1000 }
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
                                editable={!isLoading}
                                error={emailError}
                            />

                            <View style={styles.buttonContainer}>
                                <View style={styles.buttonWrapper}>
                                    <Button
                                        title="Send Code"
                                        onPress={handleSendOTP}
                                        loading={isLoading}
                                        size="large"
                                        variant="primary"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: c.subtext }]}>Remember your password?</Text>
                            <TouchableOpacity onPress={onBackToLogin}>
                                <Text style={[styles.footerLink, { color: c.primary }]}>Back to Login</Text>
                            </TouchableOpacity>
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
    chatSection: {
        marginBottom: 32,
    },
    form: {
        width: '100%',
        gap: 20,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    buttonWrapper: {
        width: '60%',
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerText: { fontSize: 14, fontWeight: '500' },
    footerLink: { fontSize: 14, fontWeight: '700' },
});

export default ForgotPasswordScreen;
