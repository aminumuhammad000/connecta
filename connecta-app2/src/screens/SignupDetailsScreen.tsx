import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import * as authService from '../services/authService';
import { checkEmailExists } from '../services/authService';
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

const SignupDetailsScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();
    const { t, lang } = useTranslation();

    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [referrerCode, setReferrerCode] = useState('');

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
        setEmailError('');
        setPhoneError('');

        let hasError = false;
        if (!email.trim() || !email.includes('@')) {
            setEmailError('That email doesn\'t look quite right.');
            hasError = true;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            setPhoneError(t('invalid_phone_msg'));
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }

        setIsLoading(true);
        try {
            const emailCheck = await checkEmailExists(email.trim());
            if (emailCheck.exists) {
                setEmailError('This email is already in use.');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                // The user requested to show red in input and the message, which setEmailError handles.
                // We can also show a toast/alert for better visibility if desired, but red input + text is what was asked.
                showAlert({ title: 'Email Taken', message: 'Wait, this email is already being used! Maybe try logging in?', type: 'error' });
                setIsLoading(false);
                return;
            }

            const phoneCheck = await authService.checkPhoneExists(phoneNumber.trim());
            if (phoneCheck.exists) {
                setPhoneError('This phone number is already registered.');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                showAlert({ title: 'Phone Number Taken', message: 'This phone number is already registered. Please use a different one.', type: 'error' });
                setIsLoading(false);
                return;
            }

            await storage.savePendingSignupData({
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                preferredLanguage: lang,
                referrerCode: referrerCode.trim(),
            });

            (navigation as any).navigate('SignupPassword');
        } catch (error: any) {
            console.error("Signup validation error:", error);
            showAlert({ title: t('error' as any), message: error.message || 'Saving failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="call-outline" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Stay Connected</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                We'll only use these to keep your account safe and tell you about great opportunities.
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

                            <SignupProgressBar currentStep={3} totalSteps={6} />

                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: firstName ? `${t('final_steps')} ${firstName}!` : t('final_steps') },
                                        { text: t('security_requirement'), delay: 1000, speed: 30 }
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

                                <Input
                                    value={phoneNumber}
                                    onChangeText={(val) => { setPhoneNumber(val); setPhoneError(''); }}
                                    placeholder={t('phone_number')}
                                    icon="phone-iphone"
                                    keyboardType="phone-pad"
                                    error={phoneError}
                                />

                                <Input
                                    value={referrerCode}
                                    onChangeText={setReferrerCode}
                                    placeholder="Referral Code (Optional)"
                                    icon="card-giftcard"
                                    autoCapitalize="characters"
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
    form: { gap: 24, marginBottom: 32 },
    footer: { marginTop: 'auto' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default SignupDetailsScreen;
