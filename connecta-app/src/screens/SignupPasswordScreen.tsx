import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Input from '../components/Input';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import SignupProgressBar from '../components/SignupProgressBar';
import * as storage from '../utils/storage';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';

const SignupPasswordScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();
    const { t, lang } = useTranslation();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    useEffect(() => {
        const loadName = async () => {
            const data = await storage.getPendingSignupData();
            if (data?.firstName) {
                setFirstName(data.firstName);
            }
        };
        loadName();
    }, []);

    const handleContinue = async () => {
        setPasswordError('');
        setConfirmError('');

        let hasError = false;
        if (password.length < 6) {
            setPasswordError('A good password needs at least 6 characters!');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Wait, those passwords don\'t match. Try again?');
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        setIsLoading(true);
        try {
            await storage.savePendingSignupData({
                password
            });

            (navigation as any).navigate('LocationOnboarding');
        } catch (error: any) {
            showAlert({ title: t('error' as any), message: error.message || 'Saving failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="lock-closed-outline" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Keep It{'\n'}Safe</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                A strong password keeps your hard-earned money and private data secure.
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

                            <SignupProgressBar currentStep={4} totalSteps={6} />

                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        {
                                            text: firstName
                                                ? (t('password_chat_title_personalized' as any) || '').replace('{{name}}', firstName)
                                                : t('password_chat_title' as any)
                                        },
                                        { text: t('password_chat_sub' as any), delay: 1000 }
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
                                        error={passwordError}
                                    />
                                    <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    value={confirmPassword}
                                    onChangeText={(val) => { setConfirmPassword(val); setConfirmError(''); }}
                                    placeholder="Repeat Password"
                                    icon="lock-outline"
                                    secureTextEntry={!showPassword}
                                    error={confirmError}
                                />
                            </View>

                            <View style={styles.footer}>
                                <Button title={t('continue')} onPress={handleContinue} loading={isLoading} size="large" />
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ResponsiveOnboardingWrapper>
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
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
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
    form: { gap: 20, marginBottom: 32 },
    passContainer: { position: 'relative' },
    eye: { position: 'absolute', right: 16, top: 18 },
    footer: { marginTop: 'auto' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 },
});

export default SignupPasswordScreen;
