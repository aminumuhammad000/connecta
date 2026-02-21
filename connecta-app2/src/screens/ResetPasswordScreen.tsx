import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { resetPassword } from '../services/authService';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import ChatGreeting from '../components/ChatGreeting';
import { useTranslation } from '../utils/i18n';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedBackground from '../components/AnimatedBackground';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

interface ResetPasswordScreenProps {
    email: string;
    resetToken: string;
    onPasswordReset?: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ email, resetToken, onPasswordReset }) => {
    const navigation = useNavigation();
    const c = useThemeColors();
    const { t, lang } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

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

    const validatePassword = () => {
        setPasswordError('');
        setConfirmError('');

        let hasError = false;
        if (!password.trim()) {
            setPasswordError('Please enter a new password.');
            hasError = true;
        }

        if (password.length < 8) {
            setPasswordError('Your new password should be at least 8 characters long.');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Those passwords don\'t match. Can you double check?');
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) return;

        setIsLoading(true);

        try {
            await resetPassword(resetToken, password);

            showAlert(
                'success',
                'Your password has been updated. You can now log in with your new password!',
                'success',
                () => onPasswordReset?.()
            );
        } catch (error: any) {
            showAlert('error', error.response?.data?.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="refresh-circle-outline" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Account{'\n'}Restored</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                You're one step away from getting back into your account. Choose a strong password and stay secure.
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
                            contentContainerStyle={styles.scroll}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.headerControls}>
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
                                        { text: t('reset_header') },
                                        { text: t('reset_sub') },
                                        { text: email, delay: 500 }
                                    ]}
                                />
                            </View>

                            <View style={styles.form}>
                                <View style={styles.passContainer}>
                                    <Input
                                        value={password}
                                        onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                                        placeholder={t('password')}
                                        icon="lock-outline"
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                        error={passwordError}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    value={confirmPassword}
                                    onChangeText={(val) => { setConfirmPassword(val); setConfirmError(''); }}
                                    placeholder={t('confirm_new_pass')}
                                    icon="lock-outline"
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                    error={confirmError}
                                />

                                <View style={styles.passwordRequirements}>
                                    <Text style={[styles.requirementTitle, { color: c.text }]}>{t('pass_req')}</Text>
                                    <View style={styles.requirementItem}>
                                        <MaterialIcons
                                            name={password.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                                            size={18}
                                            color={password.length >= 8 ? '#4CAF50' : c.subtext}
                                        />
                                        <Text style={[styles.requirementText, { color: c.subtext }]}>
                                            {t('min_chars')}
                                        </Text>
                                    </View>
                                    <View style={styles.requirementItem}>
                                        <MaterialIcons
                                            name={password === confirmPassword && password.length > 0 ? "check-circle" : "radio-button-unchecked"}
                                            size={18}
                                            color={password === confirmPassword && password.length > 0 ? '#4CAF50' : c.subtext}
                                        />
                                        <Text style={[styles.requirementText, { color: c.subtext }]}>
                                            {t('pass_match')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Button
                                    title={isLoading ? t('resetting') : t('reset_btn')}
                                    onPress={handleResetPassword}
                                    loading={isLoading}
                                    size="large"
                                />
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
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40 },
    chatSection: {
        marginBottom: 32,
    },
    headerControls: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
    langToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
    langToggleText: { fontSize: 14, fontWeight: '700' },
    form: { gap: 20, marginBottom: 32 },
    passContainer: { position: 'relative' },
    eyeIcon: { position: 'absolute', right: 16, top: 18 },
    passwordRequirements: {
        marginTop: 10,
        gap: 10,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
    },
    requirementTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
    requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    requirementText: { fontSize: 13, fontWeight: '500' },
    footer: { marginTop: 'auto' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 },
});

export default ResetPasswordScreen;
