import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function SecurityScreen({ navigation }: any) {
    const c = useThemeColors();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Security</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Change Password</Text>
                <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>
                    Update your password to keep your account secure
                </Text>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Current Password</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            style={[styles.input, { color: c.text }]}
                            secureTextEntry={!showCurrentPassword}
                            placeholderTextColor={c.subtext}
                            placeholder="Enter current password"
                        />
                        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                            <Ionicons
                                name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>New Password</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={[styles.input, { color: c.text }]}
                            secureTextEntry={!showNewPassword}
                            placeholderTextColor={c.subtext}
                            placeholder="Enter new password"
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                            <Ionicons
                                name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Confirm New Password</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={[styles.input, { color: c.text }]}
                            secureTextEntry={!showConfirmPassword}
                            placeholderTextColor={c.subtext}
                            placeholder="Confirm new password"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: c.primary }]}
                    onPress={handleChangePassword}
                >
                    <Text style={styles.saveButtonText}>Change Password</Text>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: c.border }]} />

                <Text style={[styles.sectionTitle, { color: c.text }]}>Two-Factor Authentication</Text>
                <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>
                    Add an extra layer of security to your account
                </Text>

                <TouchableOpacity style={[styles.optionRow, { borderColor: c.border }]}>
                    <View style={styles.optionLeft}>
                        <Ionicons name="shield-checkmark-outline" size={22} color={c.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.optionTitle, { color: c.text }]}>Enable 2FA</Text>
                            <Text style={[styles.optionSubtitle, { color: c.subtext }]}>
                                Protect your account with 2FA
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                </TouchableOpacity>
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
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
    },
    saveButton: {
        marginTop: 8,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 32,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 12,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    optionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
