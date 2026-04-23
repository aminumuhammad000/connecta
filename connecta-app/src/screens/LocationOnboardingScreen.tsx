import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import * as storage from '../utils/storage';
import * as authService from '../services/authService';
import SignupProgressBar from '../components/SignupProgressBar';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';

const LocationOnboardingScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [country, setCountry] = useState<any>('Nigeria');
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleContinue = async () => {
        if (!country.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return showAlert({ title: 'Error', message: 'Please select your country.', type: 'error' });
        }

        if (!agreedToTerms) {
            return showAlert({
                title: 'Wait!',
                message: 'Please accept the terms and conditions to continue.',
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
            showAlert({ title: 'Error', message: error.message || 'Update failed', type: 'error' });
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
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        <SignupProgressBar currentStep={5} totalSteps={6} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentContainer}>
                            <View style={styles.chatSection}>
                                <ChatGreeting
                                    messages={[
                                        { text: 'Almost there!' },
                                        { text: 'Where are you based?', delay: 1000 }
                                    ]}
                                />
                            </View>

                            <View style={styles.form}>
                                <View
                                    style={[styles.countryInput, { backgroundColor: c.card, borderColor: c.border, opacity: 0.7 }]}
                                >
                                    <View style={styles.countryLabelGroup}>
                                        <MaterialIcons name="public" size={22} color={c.primary} />
                                        <Text style={[styles.countryText, { color: c.text }]}>
                                            Nigeria
                                        </Text>
                                    </View>
                                </View>

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
                                            I agree to the <Text style={{ color: c.primary, fontWeight: '700' }}>Terms & Privacy</Text>
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <View style={styles.buttonWrapper}>
                                    <Button title="Done! Let's Go" onPress={handleContinue} loading={isLoading} size="large" />
                                </View>
                            </View>
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
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, gap: 30 },
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
    chatSection: {
        marginBottom: 0,
    },
    form: { gap: 24 },
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
    footer: { marginTop: 20, alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
});

export default LocationOnboardingScreen;
