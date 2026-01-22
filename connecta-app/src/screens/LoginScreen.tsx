import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, BackHandler, ActivityIndicator, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    const c = useThemeColors();
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

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
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, []);

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
        // Validation
        if (!email.trim() || !password.trim()) {
            showCustomAlert('Error', 'Please enter both email and password', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const user = await login({ email: email.trim(), password });

            // Save credentials for future biometric login
            await storage.setSecureItem('connecta_secure_email', email.trim());
            await storage.setSecureItem('connecta_secure_pass', password);

            showCustomAlert('Success', 'Logged in successfully!', 'success');
            // Navigation will happen automatically via AuthContext
            onSignedIn?.(user);
        } catch (error: any) {
            showCustomAlert('Login Failed', error.message || 'Invalid email or password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const { width, height } = useWindowDimensions();
    const isDesktop = width > 768;

    const renderLoginForm = () => (
        <View style={[
            styles.mainContent,
            isDesktop && styles.desktopFormContent
        ]}>
            {/* Header/Logo - Hide on Desktop usage of specific styles if wanted, but keep for now as requested "Welcome back" is checking mockups */}
            <View style={styles.topSection}>
                {/* On Desktop, we might want to hide the small logo since we have a big one on the left, but let's keep it consistent or small */}
                {!isDesktop && (
                    <View style={[styles.logoWrap, { backgroundColor: c.card }]}>
                        <Logo size={48} />
                    </View>
                )}
                <Text style={[styles.title, { color: c.text, fontSize: isDesktop ? 32 : 28 }]}>Welcome back!</Text>
                <Text style={[styles.subtitle, { color: c.subtext }]}>Sign in to continue.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email Address"
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={styles.inputSpacing}
                />

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
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: c.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        variant="primary"
                        size="large"
                        style={styles.mainBtn}
                    />

                    {isBiometricSupported && (
                        <TouchableOpacity
                            onPress={handleBiometricAuth}
                            style={[styles.biometricBtn, { borderColor: c.primary, backgroundColor: c.background }]}
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
                    activeOpacity={0.9}
                    style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.background }]}
                    onPress={() => promptAsync()}
                    disabled={!request}
                >
                    <MaterialCommunityIcons name="google" size={20} color={c.text} />
                    <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: c.subtext }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={onSignup}>
                    <Text style={[styles.footerLink, { color: c.primary }]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
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
                                    {/* Show original logo without tint */}
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

    // MOBILE RENDER (Unchanged mostly)
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
        backgroundColor: '#f8f9fa', // Light gray background behind card
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
        maxHeight: '90%', // Ensure it fits in screen
    },
    desktopFormContent: {
        // Adjustments inside the card
        paddingVertical: 0,
    },
    // Existing Styles
    topSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrap: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        marginBottom: 20,
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
        marginBottom: 24,
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtons: {
        gap: 12,
    },
    mainBtn: {
        borderRadius: 12,
    },
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    biometricText: {
        fontSize: 15,
        fontWeight: '600',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
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
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
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
