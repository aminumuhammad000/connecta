import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as storage from '../utils/storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import { useTranslation } from '../utils/i18n';
import { useAuth } from '../context/AuthContext';
import { updatePreferredLanguage } from '../services/authService';
import Button from '../components/Button';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';

const LanguageSelectScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const c = useThemeColors();
    const { t, lang: currentLang, changeLanguage } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [selected, setSelected] = useState<'en' | 'ha'>(currentLang as any);

    useEffect(() => {
        const init = async () => {
            const saved = await storage.getItem('PREFERRED_LANGUAGE');
            if (saved) {
                setSelected(saved as any);
            }
        };
        init();
    }, []);

    const selectLanguage = async (lang: 'en' | 'ha') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelected(lang);
        await storage.setItem('PREFERRED_LANGUAGE', lang);
        changeLanguage(lang);

        if (isAuthenticated) {
            try {
                await updatePreferredLanguage(lang);
            } catch (error) {
                console.warn('[LanguageSelect] Failed to sync language to server', error);
            }
        }
    };

    const handleContinue = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Welcome');
        }
    };

    const sideContent = (
        <View style={styles.desktopSide}>
            <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
                <MaterialCommunityIcons name="translate" size={70} color={c.primary} />
            </View>
            <Text style={[styles.sideTitle, { color: c.text }]}>Which language{'\n'}do you prefer?</Text>
            <Text style={[styles.sideSub, { color: c.subtext }]}>
                We want to make sure you feel right at home while using Connecta.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <AnimatedBackground />
            <ResponsiveOnboardingWrapper sideComponent={sideContent}>
                <View style={styles.mainWrapper}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                            <ChatGreeting
                                messages={[
                                    { text: t('lang_greet') },
                                    { text: t('lang_select_title'), delay: 1000 },
                                    { text: t('lang_select_sub'), delay: 2000, speed: 30 }
                                ]}
                            />
                        </Animated.View>

                        <View style={styles.optionsContainer}>
                            {[
                                { id: 'en', label: 'English', sub: 'The global standard', icon: '🇺🇸' },
                                { id: 'ha', label: 'Hausa', sub: 'Yaren mu na gida', icon: '🇳🇬' }
                            ].map((item, index) => (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInUp.delay(3000 + (index * 150)).springify()}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => selectLanguage(item.id as any)}
                                        style={[
                                            styles.optionCard,
                                            { backgroundColor: c.card, borderColor: selected === item.id ? c.primary : c.border },
                                            selected === item.id && { borderWidth: 2 }
                                        ]}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: c.background }]}>
                                            <Text style={styles.flagText}>{item.icon}</Text>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <Text style={[styles.langText, { color: c.text }]}>{item.label}</Text>
                                            <Text style={[styles.subLangText, { color: c.subtext }]}>{item.sub}</Text>
                                        </View>
                                        {selected === item.id && (
                                            <Ionicons name="checkmark-circle" size={24} color={c.primary} />
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>

                        <Animated.View entering={FadeInUp.delay(3600)} style={styles.footer}>
                            <Button
                                title={t('continue')}
                                onPress={handleContinue}
                                style={styles.nextBtn}
                                size="large"
                            />
                            <Text style={[styles.footerText, { color: c.subtext }]}>
                                {t('change_later')}
                            </Text>
                        </Animated.View>
                    </View>
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
    content: { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 24,
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
    header: { marginBottom: 32 },
    optionsContainer: { gap: 16 },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    flagText: { fontSize: 26 },
    textGroup: { flex: 1, marginLeft: 16 },
    langText: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    subLangText: { fontSize: 14, fontWeight: '500' },
    footer: { marginTop: 'auto', alignItems: 'center', paddingTop: 40 },
    footerText: { fontSize: 14, textAlign: 'center', marginTop: 16, opacity: 0.6, fontWeight: '500' },
    nextBtn: { width: '100%' },
    // Desktop
    desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
    sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default LanguageSelectScreen;
