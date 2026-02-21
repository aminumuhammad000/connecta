import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import SignupProgressBar from '../components/SignupProgressBar';
import { useTranslation } from '../utils/i18n';
import Button from '../components/Button';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';
import * as storage from '../utils/storage';

const RoleSelectionScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { t, lang } = useTranslation();
    const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);

    const handleRoleSelect = (role: 'client' | 'freelancer') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedRole(role);
    };

    const handleContinue = async () => {
        if (!selectedRole) return;
        await storage.savePendingSignupData({ userType: selectedRole });
        (navigation as any).navigate('Signup', { role: selectedRole });
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <MaterialCommunityIcons name="account-group" size={80} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Join the{'\n'}Community</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                Whether you're hiring or working, we have a spot for you. Connect with Nigeria's best.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <AnimatedBackground />
            <ResponsiveOnboardingWrapper sideComponent={sideContent}>
                <View style={styles.mainWrapper}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
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

                        <SignupProgressBar currentStep={1} totalSteps={6} />

                        <View style={styles.chatSection}>
                            <ChatGreeting
                                messages={[
                                    { text: t('role_title') },
                                    { text: t('role_subtitle'), delay: 1000 }
                                ]}
                            />
                        </View>

                        <View style={styles.cardsContainer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => handleRoleSelect('freelancer')}
                                style={{ width: '100%' }}
                            >
                                <View style={[
                                    styles.card,
                                    {
                                        backgroundColor: selectedRole === 'freelancer' ? c.primary : c.card,
                                        borderColor: selectedRole === 'freelancer' ? c.primary : c.border
                                    }
                                ]}>
                                    <View style={[styles.iconCircle, { backgroundColor: selectedRole === 'freelancer' ? 'rgba(255,255,255,0.2)' : c.background }]}>
                                        <MaterialCommunityIcons
                                            name="account-tie"
                                            size={32}
                                            color={selectedRole === 'freelancer' ? '#FFF' : c.primary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.cardTitle, { color: selectedRole === 'freelancer' ? '#FFF' : c.text }]}>
                                            {t('i_want_to_work')}
                                        </Text>
                                        <Text style={[styles.cardSub, { color: selectedRole === 'freelancer' ? 'rgba(255,255,255,0.8)' : c.subtext }]}>
                                            {t('i_want_to_work_sub' as any)}
                                        </Text>
                                    </View>
                                    {selectedRole === 'freelancer' && (
                                        <Ionicons name="checkmark-circle" size={28} color="#FFF" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => handleRoleSelect('client')}
                                style={{ width: '100%' }}
                            >
                                <View style={[
                                    styles.card,
                                    {
                                        backgroundColor: selectedRole === 'client' ? c.primary : c.card,
                                        borderColor: selectedRole === 'client' ? c.primary : c.border
                                    }
                                ]}>
                                    <View style={[styles.iconCircle, { backgroundColor: selectedRole === 'client' ? 'rgba(255,255,255,0.2)' : c.background }]}>
                                        <MaterialCommunityIcons
                                            name="briefcase-plus"
                                            size={32}
                                            color={selectedRole === 'client' ? '#FFF' : c.primary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.cardTitle, { color: selectedRole === 'client' ? '#FFF' : c.text }]}>
                                            {t('i_want_to_hire')}
                                        </Text>
                                        <Text style={[styles.cardSub, { color: selectedRole === 'client' ? 'rgba(255,255,255,0.8)' : c.subtext }]}>
                                            {t('i_want_to_hire_sub' as any)}
                                        </Text>
                                    </View>
                                    {selectedRole === 'client' && (
                                        <Ionicons name="checkmark-circle" size={28} color="#FFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerSpacing} />
                    </ScrollView>

                    <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
                        <Button
                            title={t('continue')}
                            onPress={handleContinue}
                            disabled={!selectedRole}
                            size="large"
                        />
                    </Animated.View>
                </View>
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
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
    cardsContainer: {
        width: '100%',
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderWidth: 2,
        minHeight: 120,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    cardSub: { fontSize: 14, fontWeight: '500', opacity: 0.9 },
    footerSpacing: { height: 100 },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'transparent',
    },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default RoleSelectionScreen;
