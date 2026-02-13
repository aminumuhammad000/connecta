import React, { useEffect, useState, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import ChatGreeting from '../components/ChatGreeting';
import { STORAGE_KEYS } from '../utils/constants';
import * as storage from '../utils/storage';
import Button from '../components/Button';
import Input from '../components/Input';
import { useTranslation } from '../utils/i18n';
import TypewriterText from '../components/TypewriterText';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import AnimatedBackground from '../components/AnimatedBackground';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
    onSignedIn?: (user?: any) => void;
    onSignup?: () => void;
    onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, onSignup, onForgotPassword }) => {
    const navigation = useNavigation();
    const c = useThemeColors();
    const { login } = useAuth();
    const { t, lang } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showCustomAlert = (title: string, message: string, type: AlertType = 'success') => {
        setAlertConfig({ title: t(title as any) || title, message: t(message as any) || message, type });
        setAlertVisible(true);
        if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const biometricEnabled = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            setIsBiometricSupported(compatible && enrolled && biometricEnabled === 'true');
            if (compatible && enrolled && biometricEnabled === 'true') {
                handleBiometricAuth();
            }
        })();
    }, []);

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometric',
                fallbackLabel: 'Use Passcode',
            });
            if (result.success) {
                const storedEmail = await storage.getSecureItem('connecta_secure_email');
                const storedPass = await storage.getSecureItem('connecta_secure_pass');
                if (storedEmail && storedPass) {
                    setIsLoading(true);
                    try {
                        const user = await login({ email: storedEmail, password: storedPass });
                        onSignedIn?.(user);
                    } catch (error: any) {
                        showCustomAlert('Error', error.message || 'Failed to login.', 'error');
                    } finally {
                        setIsLoading(false);
                    }
                }
            }
        } catch (e) {
            showCustomAlert('Error', 'Biometric authentication failed', 'error');
        }
    };

    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');

        let hasError = false;
        if (!email.trim()) {
            setEmailError('Please enter your email address');
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError('Please enter your password');
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }
        setIsLoading(true);
        try {
            const user = await login({ email: email.trim(), password });
            await storage.setSecureItem('connecta_secure_email', email.trim());
            await storage.setSecureItem('connecta_secure_pass', password);
            onSignedIn?.(user);
        } catch (error: any) {
            showCustomAlert('Error', error.message || 'Invalid credentials', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Logo size={80} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>{t('login_header')}</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                Continue where you left off and connect with the best talent.
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
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
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

                                <View style={styles.chatSection}>
                                    <ChatGreeting
                                        messages={[
                                            { text: t('login_header') },
                                            { text: t('login_sub'), delay: 1000 }
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
                                        error={emailError}
                                    />

                                    <View style={styles.passContainer}>
                                        <Input
                                            value={password}
                                            onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                                            placeholder={t('password')}
                                            icon="lock-outline"
                                            secureTextEntry={!showPassword}
                                            error={passwordError}
                                        />
                                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                                        <Text style={[styles.forgotPasswordText, { color: c.primary }]}>{t('forgot_password')}</Text>
                                    </TouchableOpacity>

                                    <View style={styles.actionSection}>
                                        <Button
                                            title={t('sign_in')}
                                            onPress={handleLogin}
                                            loading={isLoading}
                                            variant="primary"
                                            size="large"
                                        />
                                        {isBiometricSupported && (
                                            <TouchableOpacity
                                                onPress={handleBiometricAuth}
                                                style={[styles.biometricBtn, { borderColor: c.primary + '30', backgroundColor: c.card }]}
                                            >
                                                <MaterialCommunityIcons name="fingerprint" size={32} color={c.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        onPress={onSignup}
                                        style={styles.signupLinkContainer}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.footerText, { color: c.subtext }]}>{t('dont_have_account')}</Text>
                                        <View style={styles.signupAction}>
                                            <Text style={[styles.footerLink, { color: c.primary }]}>{t('sign_up')}</Text>
                                            <Ionicons name="arrow-forward" size={18} color={c.primary} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ResponsiveOnboardingWrapper>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertVisible(false)}
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
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
    chatSection: { marginBottom: 36 },
    form: { gap: 20, marginBottom: 24 },
    passContainer: { position: 'relative' },
    eyeIcon: { position: 'absolute', right: 16, top: 18 },
    forgotPassword: { alignSelf: 'flex-end', marginTop: -4 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600' },
    actionSection: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    biometricBtn: { width: 64, height: 60, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    footer: { marginTop: 'auto', paddingTop: 40, alignItems: 'flex-end' },
    signupLinkContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    signupAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 14, fontWeight: '500' },
    footerLink: { fontSize: 15, fontWeight: '700' },
    // Desktop
    desktopSide: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 140, height: 140, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: -1.5 },
    sideSub: { fontSize: 18, textAlign: 'center', lineHeight: 28, maxWidth: 360, opacity: 0.7 }
});

export default LoginScreen;
