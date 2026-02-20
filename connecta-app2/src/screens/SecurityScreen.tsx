import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Input from '../components/Input';
import Button from '../components/Button';
import CustomAlert, { AlertType } from '../components/CustomAlert';

export default function SecurityScreen({ navigation }: any) {
    const c = useThemeColors();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType }>({
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const showCustomAlert = (title: string, message: string, type: AlertType = 'success') => {
        setAlertConfig({ title, message, type });
        setAlertVisible(true);
        if (type === 'success') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (type === 'error') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showCustomAlert('Error', 'Please fill in all fields', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showCustomAlert('Error', 'New passwords do not match', 'error');
            return;
        }
        if (newPassword.length < 8) {
            showCustomAlert('Error', 'Password must be at least 8 characters', 'error');
            return;
        }

        try {
            setIsLoading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const { changePassword } = require('../services/authService');
            await changePassword(currentPassword, newPassword);
            showCustomAlert('Success', 'Password changed successfully', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to change password';
            showCustomAlert('Error', msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />

            {/* Premium Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Security Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSection}>
                    <View style={[styles.iconCircle, { backgroundColor: c.primary + '15' }]}>
                        <Ionicons name="lock-closed" size={32} color={c.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Update Password</Text>
                    <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>
                        Keep your account safe by using a strong password that you don't use elsewhere.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <Input
                            label="CURRENT PASSWORD"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Enter current password"
                            secureTextEntry={!showCurrentPassword}
                            icon="lock-outline"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            <MaterialIcons
                                name={showCurrentPassword ? "visibility" : "visibility-off"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            label="NEW PASSWORD"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            secureTextEntry={!showNewPassword}
                            icon="vpn-key"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <MaterialIcons
                                name={showNewPassword ? "visibility" : "visibility-off"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            label="CONFIRM NEW PASSWORD"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry={!showConfirmPassword}
                            icon="check-circle-outline"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <MaterialIcons
                                name={showConfirmPassword ? "visibility" : "visibility-off"}
                                size={20}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Update Password"
                        onPress={handleChangePassword}
                        loading={isLoading}
                        variant="primary"
                        size="large"
                        style={styles.saveButton}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={c.subtext} />
                    <Text style={[styles.infoText, { color: c.subtext }]}>
                        Your password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                    </Text>
                </View>
            </Animated.ScrollView>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertVisible(false)}
            />
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    content: {
        padding: 24,
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    formContainer: {
        gap: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 40, // Adjusted for label height in Input component
        padding: 4,
    },
    saveButton: {
        marginTop: 16,
        borderRadius: 14,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 16,
        borderRadius: 12,
        marginTop: 32,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
