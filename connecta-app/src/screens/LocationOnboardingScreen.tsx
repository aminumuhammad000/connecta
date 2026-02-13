import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import * as storage from '../utils/storage';
import * as authService from '../services/authService';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import SignupProgressBar from '../components/SignupProgressBar';
import CountryPicker from '../components/CountryPicker';
import { Country } from '../utils/countries';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';

const LocationOnboardingScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();
    const { t, lang } = useTranslation();

    const [country, setCountry] = useState<any>('Nigeria');
    const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleContinue = async () => {
        if (!country.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return showAlert({ title: t('error' as any), message: 'Please select your country.', type: 'error' });
        }

        if (!agreedToTerms) {
            return showAlert({
                title: t('wait' as any),
                message: t('legal_req_msg'),
                type: 'warning'
            });
        }

        setIsLoading(true);
        try {
            await storage.savePendingSignupData({
                country: country.trim(),
                location: country.trim(),
            });

            const pendingData = await storage.getPendingSignupData();

            await authService.initiateSignup(
                pendingData.email,
                pendingData.firstName,
                pendingData.preferredLanguage
            );

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            (navigation as any).navigate('OTPVerification', {
                email: pendingData.email,
                mode: 'signup',
                role: pendingData.userType
            });

        } catch (error: any) {
            showAlert({ title: t('error' as any), message: error.message || 'Update failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="globe-outline" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Local Hubs,{'\n'}Global Reach</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                Setting your country helps us show you relevant opportunities.
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

                            <SignupProgressBar currentStep={5} totalSteps={6} />

                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: t('almost') + ' 🎉' },
                                        { text: t('where_based'), delay: 1000 }
                                    ]}
                                />
                            </View>

                            <View style={styles.form}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[styles.countryInput, { backgroundColor: c.card, borderColor: c.border }]}
                                    onPress={() => setCountryPickerVisible(true)}
                                >
                                    <View style={styles.countryLabelGroup}>
                                        <MaterialIcons name="public" size={22} color={c.primary} />
                                        <Text style={[styles.countryText, { color: country ? c.text : c.subtext }]}>
                                            {country || t('country')}
                                        </Text>
                                    </View>

                                    <MaterialIcons name="keyboard-arrow-down" size={24} color={c.subtext} />

                                    <CountryPicker
                                        visible={isCountryPickerVisible}
                                        onSelect={(item: Country) => {
                                            setCountry(item.name);
                                            setCountryPickerVisible(false);
                                        }}
                                        onClose={() => setCountryPickerVisible(false)}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: agreedToTerms ? c.primary : c.border, backgroundColor: agreedToTerms ? c.primary : 'transparent' }
                                    ]}>
                                        {agreedToTerms && <MaterialIcons name="check" size={16} color="#fff" />}
                                    </View>
                                    <View style={styles.termsTextWrap}>
                                        <Text style={[styles.checkboxText, { color: c.subtext }]}>
                                            {t('i_agree_terms')} <Text style={{ color: c.primary, fontWeight: '700' }}>{t('legal_text')}</Text>
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Button title={t('complete_setup')} onPress={handleContinue} loading={isLoading} size="large" />
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
    countryInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16
    },
    countryLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    countryText: { fontSize: 16, fontWeight: '600' },
    checkboxRow: { flexDirection: 'row', gap: 14, marginTop: 8, alignItems: 'flex-start' },
    checkbox: { width: 26, height: 26, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    termsTextWrap: { flex: 1 },
    checkboxText: { fontSize: 14, fontWeight: '500', lineHeight: 22 },
    footer: { marginTop: 'auto' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default LocationOnboardingScreen;
