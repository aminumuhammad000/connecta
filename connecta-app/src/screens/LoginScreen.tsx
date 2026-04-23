import React, { useEffect, useState, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ChatGreeting from '../components/ChatGreeting';
import { useInAppAlert } from '../components/InAppAlert';
import { STORAGE_KEYS } from '../utils/constants';
import * as storage from '../utils/storage';
import Button from '../components/Button';
import Input from '../components/Input';
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
    const { showAlert } = useInAppAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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
                        showAlert({ title: 'Error', message: error.message || 'Failed to login', type: 'error' });
                    } finally {
                        setIsLoading(false);
                    }
                }
            }
        } catch (e) {
            showAlert({ title: 'Error', message: 'Biometric authentication failed', type: 'error' });
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
            showAlert({ title: 'Error', message: error.message || 'Invalid credentials', type: 'error' });
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
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
                            <View style={styles.headerRow}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Ionicons name="chevron-back" size={24} color={c.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.contentContainer}>
                                <View style={styles.chatSection}>
                                    <ChatGreeting
                                        messages={[
                                            { text: 'Welcome back!' },
                                            { text: 'Good to see you again. Sign in to continue.', delay: 1000 }
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
                                        error={emailError}
                                    />

                                    <View style={styles.passContainer}>
                                        <Input
                                            value={password}
                                            onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                                            placeholder="Password"
                                            icon="lock-outline"
                                            secureTextEntry={!showPassword}
                                            error={passwordError}
                                        />
                                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                                        <Text style={[styles.forgotPasswordText, { color: c.primary }]}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    <View style={styles.actionSection}>
                                        {isBiometricSupported && (
                                            <TouchableOpacity
                                                onPress={handleBiometricAuth}
                                                style={[styles.biometricBtn, { borderColor: c.primary + '30', backgroundColor: c.card }]}
                                            >
                                                <MaterialCommunityIcons name="fingerprint" size={32} color={c.primary} />
                                            </TouchableOpacity>
                                        )}
                                        <View style={styles.buttonWrapper}>
                                            <Button
                                                title="Sign In"
                                                onPress={handleLogin}
                                                loading={isLoading}
                                                variant="primary"
                                                size="large"
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        onPress={onSignup}
                                        style={styles.signupLinkContainer}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.footerText, { color: c.subtext }]}>New here?</Text>
                                        <View style={styles.signupAction}>
                                            <Text style={[styles.footerLink, { color: c.primary }]}>Join Connecta</Text>
                                            <Ionicons name="arrow-forward" size={18} color={c.primary} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
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
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
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
    chatSection: { marginBottom: 0 },
    form: { gap: 20 },
    passContainer: { position: 'relative' },
    eyeIcon: { position: 'absolute', right: 16, top: 18 },
    forgotPassword: { alignSelf: 'flex-end', marginTop: -4 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600' },
    actionSection: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'flex-end' },
    buttonWrapper: { width: '64%' },
    biometricBtn: { width: 64, height: 60, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    footer: { paddingTop: 40, alignItems: 'center' },
    signupLinkContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    signupAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 14, fontWeight: '500' },
    footerLink: { fontSize: 15, fontWeight: '700' },
});

export default LoginScreen;
