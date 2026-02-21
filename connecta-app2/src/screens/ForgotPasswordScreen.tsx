import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetOTP } from '../services/authService';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import ChatGreeting from '../components/ChatGreeting';
import { useTranslation } from '../utils/i18n';
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
    const { t, lang } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType; onOk?: () => void }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: AlertType = 'success', onOk?: () => void) => {
        setAlertConfig({ title: t(title as any) || title, message: t(message as any) || message, type, onOk });
        setAlertVisible(true);
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
        if (alertConfig.onOk) {
            alertConfig.onOk();
        }
    };

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
            showAlert(
                'success',
                'A 4-digit verification code has been sent to your email.',
                'success',
                () => onOTPSent?.(email)
            );
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
            showAlert('error', errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="key-outline" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Safe &{'\n'}Secure</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                Recovering your account is easy. We'll send a secure code to your registered email to help you set a new password.
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
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.headerRow}>
                                <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
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

                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: t('forgot_header') },
                                        { text: t('forgot_sub'), delay: 1000 }
                                    ]}
                                />
                            </View>

                            <View style={styles.form}>
                                <Input
                                    value={email}
                                    onChangeText={(val) => { setEmail(val); setEmailError(''); }}
                                    placeholder={t('email')}
                                    icon="mail-outline"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    error={emailError}
                                />

                                <Button
                                    title={t('send_code')}
                                    onPress={handleSendOTP}
                                    loading={isLoading}
                                    size="large"
                                    variant="primary"
                                />
                            </View>

                            <View style={styles.footer}>
                                <Text style={[styles.footerText, { color: c.subtext }]}>{t('remember_password')}</Text>
                                <TouchableOpacity onPress={onBackToLogin}>
                                    <Text style={[styles.footerLink, { color: c.primary }]}>{t('back_to_login')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ResponsiveOnboardingWrapper>

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
    mainWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
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
    form: {
        width: '100%',
        gap: 20,
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
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 },
});

export default ForgotPasswordScreen;
