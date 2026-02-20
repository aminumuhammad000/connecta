import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useRole } from '../context/RoleContext';

export default function AuthScreen({ navigation }: any) {
    const c = useThemeColors();
    const { setRole } = useRole();
    const [selectedRole, setSelectedRoleState] = useState<'client' | 'freelancer' | null>(null);

    const handleRoleSelect = (role: 'client' | 'freelancer') => {
        setSelectedRoleState(role);
        setRole(role);
    };

    const handleCreateAccount = () => {
        if (selectedRole) {
            navigation.navigate('Signup', { role: selectedRole });
        }
    };

    const buttonText =
        selectedRole === 'client'
            ? 'Create Client Account'
            : selectedRole === 'freelancer'
                ? 'Create Freelancer Account'
                : 'Next';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    {/* Placeholder for Logo if not available locally, or use text */}
                    <Text style={[styles.logoText, { color: c.primary }]}>Connecta</Text>
                </View>

                <Text style={[styles.title, { color: c.text }]}>Join as a Client or Freelancer</Text>

                <View style={styles.cardsContainer}>
                    {/* Client Card */}
                    <TouchableOpacity
                        style={[
                            styles.card,
                            { backgroundColor: c.card, borderColor: selectedRole === 'client' ? c.primary : c.border },
                            selectedRole === 'client' && styles.selectedCard
                        ]}
                        onPress={() => handleRoleSelect('client')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardHeader}>
                            <Ionicons name="briefcase" size={32} color={c.text} />
                            <View style={[styles.radioButton, { borderColor: c.border }]}>
                                {selectedRole === 'client' && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
                            </View>
                        </View>
                        <Text style={[styles.cardText, { color: c.text }]}>I'm a client, hiring for a project</Text>
                    </TouchableOpacity>

                    {/* Freelancer Card */}
                    <TouchableOpacity
                        style={[
                            styles.card,
                            { backgroundColor: c.card, borderColor: selectedRole === 'freelancer' ? c.primary : c.border },
                            selectedRole === 'freelancer' && styles.selectedCard
                        ]}
                        onPress={() => handleRoleSelect('freelancer')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardHeader}>
                            <Ionicons name="laptop-outline" size={32} color={c.text} />
                            <View style={[styles.radioButton, { borderColor: c.border }]}>
                                {selectedRole === 'freelancer' && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
                            </View>
                        </View>
                        <Text style={[styles.cardText, { color: c.text }]}>I'm a freelancer, looking for work</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: selectedRole ? c.primary : c.border },
                        !selectedRole && styles.disabledButton
                    ]}
                    onPress={handleCreateAccount}
                    disabled={!selectedRole}
                >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: c.subtext }]}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.linkText, { color: c.primary }]}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32,
    },
    cardsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    card: {
        padding: 24,
        borderRadius: 12,
        borderWidth: 2,
    },
    selectedCard: {
        backgroundColor: 'rgba(242, 127, 13, 0.05)', // Light orange tint
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    cardText: {
        fontSize: 18,
        fontWeight: '500',
    },
    button: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 16,
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
