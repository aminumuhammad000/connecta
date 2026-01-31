import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { scheduleLocalNotification } from '../utils/notifications';
import { useInAppAlert } from '../components/InAppAlert';
import * as LocalAuthentication from 'expo-local-authentication';
import * as storage from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

export default function SettingsScreen({ navigation }: any) {
    const c = useThemeColors();
    const { setRole } = useRole();
    const { isDark, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { showAlert } = useInAppAlert();

    useEffect(() => {
        loadBiometricSettings();
    }, []);

    const loadBiometricSettings = async () => {
        const enabled = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
        setBiometricEnabled(enabled === 'true');
    };

    const handleBiometricToggle = async (value: boolean) => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (!compatible || types.length === 0) {
                showAlert({
                    title: 'Not Supported',
                    message: 'Biometric authentication is not supported on this device',
                    type: 'error'
                });
                return;
            }

            if (!enrolled) {
                showAlert({
                    title: 'Not Enrolled',
                    message: 'Please set up Face ID or Fingerprint in your device settings first',
                    type: 'error'
                });
                return;
            }

            // Explicitly request biometric authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: value ? 'Verify your fingerprint to enable' : 'Verify your fingerprint to disable',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, String(value));
                setBiometricEnabled(value);

                if (!value) {
                    await storage.removeSecureItem('connecta_secure_email');
                    await storage.removeSecureItem('connecta_secure_pass');
                }

                showAlert({
                    title: 'Success',
                    message: `Biometric login ${value ? 'enabled' : 'disabled'}`,
                    type: 'success'
                });
            } else {
                // If user cancelled, we don't show an error, just don't toggle
                if (result.error !== 'user_cancel' && result.error !== 'app_cancel') {
                    showAlert({
                        title: 'Authentication Failed',
                        message: 'Could not verify your identity. Please try again.',
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            console.error('Biometric toggle error:', error);
            showAlert({
                title: 'Error',
                message: 'An unexpected error occurred during biometric verification',
                type: 'error'
            });
        }
    };

    const handleThemeToggle = () => {
        toggleTheme();
        const newMode = !isDark ? 'dark' : 'light';
        showAlert({ title: 'Theme changed', message: `Switched to ${newMode} mode`, type: 'success' });
        if (notificationsEnabled) {
            void scheduleLocalNotification('Theme changed', `Switched to ${newMode} mode`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setRole(null);
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Landing' }],
                });
                showAlert({ title: 'Logged out', message: 'You have been logged out successfully', type: 'success' });
            }, 100);
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to logout', type: 'error' });
        }
    };

    const SettingItem = ({ icon, color, label, value, onToggle, onPress, type = 'link' }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: c.border }]}
            onPress={type === 'link' ? onPress : () => onToggle(!value)}
            activeOpacity={0.7}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={18} color={color} />
                </View>
                <Text style={[styles.settingLabel, { color: c.text }]}>{label}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#E5E7EB', true: c.primary }}
                    thumbColor={'#ffffff'}
                    ios_backgroundColor="#E5E7EB"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={c.subtext} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: c.subtext }]}>{title}</Text>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.sectionContainer}>
                    <SectionHeader title="Preferences" />
                    <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
                        <SettingItem
                            icon="notifications-outline"
                            color="#F59E0B"
                            label="Push Notifications"
                            type="toggle"
                            value={notificationsEnabled}
                            onToggle={setNotificationsEnabled}
                        />
                        <SettingItem
                            icon="moon-outline"
                            color="#6366F1"
                            label="Dark Mode"
                            type="toggle"
                            value={isDark}
                            onToggle={handleThemeToggle}
                        />
                        <SettingItem
                            icon="finger-print-outline"
                            color="#10B981"
                            label="Biometric Login"
                            type="toggle"
                            value={biometricEnabled}
                            onToggle={handleBiometricToggle}
                        />
                        <SettingItem
                            icon="briefcase-outline"
                            color="#FD6730"
                            label="Job Preferences"
                            onPress={() => navigation.navigate('JobPreferences')}
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <SectionHeader title="Account" />
                    <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
                        <SettingItem
                            icon="person-outline"
                            color="#3B82F6"
                            label="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <SettingItem
                            icon="lock-closed-outline"
                            color="#EF4444"
                            label="Security"
                            onPress={() => navigation.navigate('Security')}
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <SectionHeader title="Support" />
                    <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
                        <SettingItem
                            icon="help-circle-outline"
                            color="#8B5CF6"
                            label="Help Center"
                            onPress={() => navigation.navigate('HelpSupport')}
                        />
                        <SettingItem
                            icon="mail-outline"
                            color="#EC4899"
                            label="Contact Us"
                            onPress={() => navigation.navigate('ContactSupport')}
                        />
                    </View>
                </View>

                {user?.email === 'admin@connecta.com' && (
                    <View style={styles.sectionContainer}>
                        <SectionHeader title="Admin" />
                        <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
                            <SettingItem
                                icon="shield-checkmark-outline"
                                color={c.primary}
                                label="Admin Panel"
                                onPress={() => navigation.navigate('AdminWithdrawals')}
                            />
                        </View>
                    </View>
                )}

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#EF444415' }]} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: c.subtext }]}>Version 1.0.0 (Build 2)</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 16, // Reduced from 17
        fontWeight: '600', // Slightly lighter weight
    },
    content: {
        padding: 16, // Reduced padding slightly
    },
    sectionContainer: {
        marginBottom: 20, // Reduced margin
    },
    sectionHeader: {
        fontSize: 12, // Reduced from 13
        fontWeight: '500', // Lighter weight
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginLeft: 12,
    },
    sectionCard: {
        borderRadius: 12, // Slightly smaller radius
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 28, // Reduced from 32
        height: 28, // Reduced from 32
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 14, // Reduced from 16
        fontWeight: '400', // Lighter weight for cleaner look
    },
    logoutButton: {
        marginTop: 8,
        alignItems: 'center',
        paddingVertical: 14, // Reduced from 16
        borderRadius: 12,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 14, // Reduced from 16
        fontWeight: '500',
    },
    version: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 11, // Reduced from 12
        opacity: 0.5,
    },
});
