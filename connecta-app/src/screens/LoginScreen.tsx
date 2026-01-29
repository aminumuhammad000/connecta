import React, { useEffect, useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar, useWindowDimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import { STORAGE_KEYS } from '../utils/constants';
import * as storage from '../utils/storage';
import Button from '../components/Button';
import Input from '../components/Input';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
    onSignedIn?: (user?: any) => void;
    onSignup?: () => void;
    onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, onSignup, onForgotPassword }) => {
    const navigation = useNavigation();
    const c = useThemeColors();
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const inputFocusAnim = useRef(new Animated.Value(0)).current;
    const emailInputScale = useRef(new Animated.Value(1)).current;
    const passwordInputScale = useRef(new Animated.Value(1)).current;

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showCustomAlert = (title: string, message: string, type: AlertType = 'success') => {
        setAlertConfig({ title, message, type });
        setAlertVisible(true);

        // Haptic feedback based on alert type
        if (type === 'success') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (type === 'error') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
    };

    // Entrance animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Allow back navigation to landing page - BackHandler removed

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const biometricEnabled = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            setIsBiometricSupported(compatible && enrolled && biometricEnabled === 'true');

            // Auto-prompt if enabled
            if (compatible && enrolled && biometricEnabled === 'true') {
                handleBiometricAuth();
            }
        })();
    }, []);

    const handleBiometricAuth = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Face ID',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                const token = await storage.getToken();
                if (token) {
                    const savedUser = await storage.getUserData();
                    if (token && savedUser) {
                        showCustomAlert('Success', 'Welcome back!', 'success');

                        const storedEmail = await storage.getSecureItem('connecta_secure_email');
                        const storedPass = await storage.getSecureItem('connecta_secure_pass');

                        if (storedEmail && storedPass) {
                            await login({ email: storedEmail, password: storedPass });
                            showCustomAlert('Success', 'Biometric Login Successful', 'success');
                            onSignedIn?.();
                        } else {
                            showCustomAlert('Error', 'No credentials stored for biometric login', 'error');
                        }
                    }
                } else {
                    // Try to get creds
                    const storedEmail = await storage.getSecureItem('connecta_secure_email');
                    const storedPass = await storage.getSecureItem('connecta_secure_pass');

                    if (storedEmail && storedPass) {
                        await login({ email: storedEmail, password: storedPass });
                        onSignedIn?.();
                    }
                }
            }
        } catch (e) {
            console.log('Biometric error', e);
        }
    };

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
        iosClientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
        androidClientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
        redirectUri: 'https://auth.expo.io/@0x_mrcoder/connecta',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        } else if (response?.type === 'error') {
            console.error('Google Auth Error:', response.error);
        }
    }, [response]);

    const handleGoogleLogin = async (token: string) => {
        setIsLoading(true);
        try {
            await googleLogin(token);
            showCustomAlert('Success', 'Logged in with Google!', 'success');
            onSignedIn?.();
        } catch (error: any) {
            showCustomAlert('Google Login Failed', error.message || 'Failed to login with Google', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        console.log('🔐 [LOGIN] Starting login process...');

        // Validation
        if (!email.trim() || !password.trim()) {
            console.log('❌ [LOGIN] Validation failed - missing email or password');
            showCustomAlert('Error', 'Please enter both email and password', 'error');

            // Shake animation for empty fields
            if (!email.trim()) {
                Animated.sequence([
                    Animated.timing(emailInputScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                    Animated.timing(emailInputScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                    Animated.timing(emailInputScale, { toValue: 1, duration: 100, useNativeDriver: true }),
                ]).start();
            }
            if (!password.trim()) {
                Animated.sequence([
                    Animated.timing(passwordInputScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                    Animated.timing(passwordInputScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                    Animated.timing(passwordInputScale, { toValue: 1, duration: 100, useNativeDriver: true }),
                ]).start();
            }
            return;
        }

        console.log('📧 [LOGIN] Email:', email.trim());
        console.log('🔑 [LOGIN] Password length:', password.length);

        // Button press animation
        Animated.sequence([
            Animated.spring(buttonScale, {
                toValue: 0.95,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setIsLoading(true);
        try {
            console.log('🌐 [LOGIN] Calling login API...');
            const user = await login({ email: email.trim(), password });
            console.log('✅ [LOGIN] Login successful! User:', JSON.stringify(user, null, 2));

            // Save credentials for future biometric login
            console.log('💾 [LOGIN] Saving credentials for biometric login...');
            await storage.setSecureItem('connecta_secure_email', email.trim());
            await storage.setSecureItem('connecta_secure_pass', password);
            console.log('✅ [LOGIN] Credentials saved!');

            showCustomAlert('Success', 'Logged in successfully!', 'success');
            console.log('🎉 [LOGIN] Calling onSignedIn callback...');
            // Navigation will happen automatically via AuthContext
            onSignedIn?.(user);
            console.log('✅ [LOGIN] onSignedIn callback completed!');
        } catch (error: any) {
            console.error('❌ [LOGIN] Login failed:', error);
            console.error('❌ [LOGIN] Error message:', error.message);
            console.error('❌ [LOGIN] Error details:', JSON.stringify(error, null, 2));
            showCustomAlert('Login Failed', error.message || 'Invalid email or password', 'error');
        } finally {
            console.log('🔄 [LOGIN] Setting loading to false');
            setIsLoading(false);
        }
    };

    const handleGooglePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        promptAsync();
    };

    const handleBiometricPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleBiometricAuth();
    };

    const handlePasswordToggle = () => {
        Haptics.selectionAsync();
        setShowPassword(!showPassword);
    };

    const { width, height } = useWindowDimensions();
    const isDesktop = width > 768;

    const renderLoginForm = () => (
        <Animated.View
            style={[
                styles.mainContent,
                isDesktop && styles.desktopFormContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            {/* Back Button */}
            {!isDesktop && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
            )}

            {/* Header/Logo */}
            <View style={styles.topSection}>
                {!isDesktop && (
                    <Animated.View
                        style={[
                            styles.logoWrap,
                            { backgroundColor: c.card },
                            {
                                transform: [{
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
                                    })
                                }]
                            }
                        ]}
                    >
                        <Logo size={48} />
                    </Animated.View>
                )}
                <Text style={[styles.title, { color: c.text, fontSize: isDesktop ? 32 : 28 }]}>Welcome back!</Text>
                <Text style={[styles.subtitle, { color: c.subtext }]}>Sign in to continue your journey.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Animated.View style={[styles.inputContainer, { transform: [{ scale: emailInputScale }] }]}>
                    <Input
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email Address"
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        containerStyle={styles.inputSpacing}
                    />
                </Animated.View>

                <Animated.View style={[styles.inputContainer, { transform: [{ scale: passwordInputScale }] }]}>
                    <View style={styles.inputSpacing}>
                        <Input
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            icon="lock-outline"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={handlePasswordToggle}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: c.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            variant="primary"
                            size="large"
                            style={styles.mainBtn}
                        />
                    </Animated.View>

                    {isBiometricSupported && (
                        <TouchableOpacity
                            onPress={handleBiometricPress}
                            style={[styles.biometricBtn, { borderColor: c.primary, backgroundColor: c.background }]}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="face-recognition" size={20} color={c.primary} />
                            <Text style={[styles.biometricText, { color: c.primary }]}>Login with Face ID</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.background }]}
                    onPress={handleGooglePress}
                    disabled={!request}
                >
                    <MaterialCommunityIcons name="google" size={20} color={c.text} />
                    <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: c.subtext }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={onSignup} activeOpacity={0.7}>
                    <Text style={[styles.footerLink, { color: c.primary }]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    if (isDesktop) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
                <StatusBar barStyle="dark-content" />
                <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => { }, setThemeMode: () => { }, themeMode: 'light' }}>
                    <View style={styles.desktopContainer}>
                        {/* Left Panel - Hero */}
                        <LinearGradient
                            colors={['#ffffff', '#f0f5ff']}
                            style={styles.desktopHero}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.heroContent}>
                                <View style={styles.heroLogoWrap}>
                                    <Logo size={120} />
                                </View>
                                <Text style={[styles.heroTitle, { color: '#1a1a1a' }]}>Connecta</Text>
                                <Text style={[styles.heroSubtitle, { color: '#555' }]}>
                                    The world's leading platform for{'\n'}freelancers and visionaries.
                                </Text>
                            </View>
                            <View style={styles.heroFooter}>
                                <Text style={[styles.heroFooterText, { color: '#999' }]}>© 2026 Connecta Global</Text>
                            </View>
                        </LinearGradient>

                        {/* Right Panel - Login Form */}
                        <View style={styles.desktopRightPanel}>
                            <View style={[styles.desktopCard, { backgroundColor: '#ffffff' }]}>
                                <ScrollView
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {renderLoginForm()}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </ThemeContext.Provider>

                <CustomAlert
                    visible={alertVisible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    onClose={handleAlertClose}
                />
            </SafeAreaView>
        );
    }

    // MOBILE RENDER
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {renderLoginForm()}
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    mainContent: {
        paddingVertical: 20,
        width: '100%',
    },
    // Desktop Styles
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },
    desktopHero: {
        flex: 1,
        justifyContent: 'center',
        padding: 60,
        position: 'relative',
    },
    heroContent: {
        maxWidth: 600,
    },
    heroLogoWrap: {
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 34,
        fontWeight: '500',
    },
    heroFooter: {
        position: 'absolute',
        bottom: 40,
        left: 60,
    },
    heroFooterText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    desktopRightPanel: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    desktopCard: {
        width: '100%',
        maxWidth: 480,
        paddingHorizontal: 40,
        paddingVertical: 40,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
        maxHeight: '90%',
    },
    desktopFormContent: {
        paddingVertical: 0,
    },
    // Form Styles
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        padding: 12,
        borderRadius: 12,
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoWrap: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        marginBottom: 24,
    },
    inputContainer: {
        width: '100%',
    },
    inputSpacing: {
        marginBottom: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtons: {
        gap: 14,
    },
    mainBtn: {
        borderRadius: 14,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    biometricText: {
        fontSize: 15,
        fontWeight: '600',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
        gap: 14,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    orText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 10,
    },
    googleText: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingTop: 20,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default LoginScreen;
