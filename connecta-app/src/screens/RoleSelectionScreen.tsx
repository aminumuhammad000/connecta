import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import SignupProgressBar from '../components/SignupProgressBar';
import Button from '../components/Button';
import ChatGreeting from '../components/ChatGreeting';
import AnimatedBackground from '../components/AnimatedBackground';
import * as storage from '../utils/storage';

const RoleSelectionScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
            <AnimatedBackground />
            <View style={styles.mainWrapper}>
                <View style={styles.stickyHeader}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color={c.text} />
                        </TouchableOpacity>
                    </View>
                    <SignupProgressBar currentStep={1} totalSteps={5} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.chatSection}>
                        <ChatGreeting
                            messages={[
                                { text: 'What would you like to do?' },
                                { text: 'Select the role that best describes your goals on Connecta.', delay: 1000 }
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
                                        size={24}
                                        color={selectedRole === 'freelancer' ? '#FFF' : c.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitle, { color: selectedRole === 'freelancer' ? '#FFF' : c.text }]}>
                                        Freelancer
                                    </Text>
                                    <Text style={[styles.cardSub, { color: selectedRole === 'freelancer' ? 'rgba(255,255,255,0.8)' : c.subtext }]}>
                                        Work and earn money from top projects.
                                    </Text>
                                </View>
                                {selectedRole === 'freelancer' && (
                                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
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
                                        size={24}
                                        color={selectedRole === 'client' ? '#FFF' : c.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitle, { color: selectedRole === 'client' ? '#FFF' : c.text }]}>
                                        Client
                                    </Text>
                                    <Text style={[styles.cardSub, { color: selectedRole === 'client' ? 'rgba(255,255,255,0.8)' : c.subtext }]}>
                                        Hire experts and manage your work.
                                    </Text>
                                </View>
                                {selectedRole === 'client' && (
                                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerSpacing} />
                </ScrollView>

                <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            disabled={!selectedRole}
                            size="large"
                        />
                    </View>
                </Animated.View>
            </View>
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
        paddingTop: 20,
        paddingBottom: 40,
        gap: 30,
        flexGrow: 1,
    },
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
    chatSection: {
        marginBottom: 0,
    },
    cardsContainer: {
        width: '100%',
        gap: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1.5,
        minHeight: 90,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    cardSub: { fontSize: 13, fontWeight: '500', opacity: 0.9 },
    footerSpacing: { height: 100 },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        width: '100%',
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
    },
    buttonWrapper: { width: '60%' },
});

export default RoleSelectionScreen;
