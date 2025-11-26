import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { scheduleLocalNotification } from '../utils/notifications';
import { useInAppAlert } from '../components/InAppAlert';

export default function SettingsScreen({ navigation }: any) {
    const c = useThemeColors();
    const { setRole } = useRole();
    const { isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const { showAlert } = useInAppAlert();

    const handleThemeToggle = () => {
        toggleTheme();
        const newMode = !isDark ? 'dark' : 'light';
        // Always show an in-app alert for immediate feedback
        showAlert({ title: 'Theme changed', message: `Switched to ${newMode} mode`, type: 'success' });
        if (notificationsEnabled) {
            void scheduleLocalNotification('Theme changed', `Switched to ${newMode} mode`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setRole(null);
            showAlert({ title: 'Logged out', message: 'You have been logged out successfully', type: 'success' });
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to logout', type: 'error' });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.subtext }]}>Preferences</Text>

                    <View style={[styles.row, { borderBottomColor: c.border }]}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="notifications-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#767577', true: c.primary }}
                            thumbColor={'#ffffff'}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomColor: c.border }]}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="moon-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={handleThemeToggle}
                            trackColor={{ false: '#767577', true: c.primary }}
                            thumbColor={'#ffffff'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.subtext }]}>Account</Text>

                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: c.border }]}
                        onPress={() => navigation.navigate('PersonalInformation')}
                    >
                        <View style={styles.rowLeft}>
                            <Ionicons name="person-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Personal Information</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: c.border }]}
                        onPress={() => navigation.navigate('Security')}
                    >
                        <View style={styles.rowLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Security</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.subtext }]}>Support</Text>

                    <TouchableOpacity style={[styles.row, { borderBottomColor: c.border }]} onPress={() => navigation.navigate('HelpSupport')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="help-circle-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Help Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, { borderBottomColor: c.border }]} onPress={() => navigation.navigate('ContactSupport')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="mail-outline" size={22} color={c.text} />
                            <Text style={[styles.rowLabel, { color: c.text }]}>Contact Us</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: c.subtext }]}>Version 1.0.0</Text>
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
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        fontSize: 16,
    },
    logoutButton: {
        marginTop: 24,
        alignItems: 'center',
        padding: 16,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 12,
    },
});
