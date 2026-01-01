import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { resetPassword } from '../services/authService';
import CustomAlert, { AlertType } from '../components/CustomAlert';

interface ResetPasswordScreenProps {
    email: string;
    resetToken: string;
    onPasswordReset?: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ email, resetToken, onPasswordReset }) => {
    // ... (keep state)
    const c = useThemeColors();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType; onOk?: () => void }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: AlertType = 'success', onOk?: () => void) => {
        setAlertConfig({ title, message, type, onOk });
        setAlertVisible(true);
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
        if (alertConfig.onOk) {
            alertConfig.onOk();
        }
    };

    const validatePassword = () => {
        if (!password.trim() || !confirmPassword.trim()) {
            showAlert('Error', 'Please fill in all fields', 'error');
            return false;
        }

        if (password.length < 8) {
            showAlert('Error', 'Password must be at least 8 characters long', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            showAlert('Error', 'Passwords do not match', 'error');
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) return;

        setIsLoading(true);

        try {
            await resetPassword(resetToken, password);

            showAlert(
                'Success',
                'Your password has been reset successfully!',
                'success',
                () => onPasswordReset?.()
            );
        } catch (error: any) {
            showAlert('Error', error.response?.data?.message || 'Failed to reset password. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <View style={styles.center}>
                        <View style={[styles.logoWrap, { backgroundColor: c.card, shadowColor: c.primary }]}>
                            <MaterialIcons name="lock-reset" size={48} color={c.primary} />
                        </View>
                        <Text style={[styles.title, { color: c.text }]}>Reset Password</Text>
                        <Text style={[styles.subtitle, { color: c.subtext }]}>
                            Create a new password for your account
                        </Text>

                        <View style={styles.form}>
                            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }]}>
                                <MaterialIcons name="lock-outline" size={20} color={c.subtext} style={styles.inputIcon} />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="New Password"
                                    placeholderTextColor={c.subtext}
                                    style={[styles.input, { color: c.text }]}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <MaterialIcons
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={c.subtext}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }]}>
                                <MaterialIcons name="lock-outline" size={20} color={c.subtext} style={styles.inputIcon} />
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm New Password"
                                    placeholderTextColor={c.subtext}
                                    style={[styles.input, { color: c.text }]}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <MaterialIcons
                                        name={showConfirmPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={c.subtext}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.passwordRequirements}>
                                <Text style={[styles.requirementTitle, { color: c.text }]}>Password must contain:</Text>
                                <View style={styles.requirementItem}>
                                    <MaterialIcons
                                        name={password.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                                        size={16}
                                        color={password.length >= 8 ? '#4CAF50' : c.subtext}
                                    />
                                    <Text style={[styles.requirementText, { color: c.subtext }]}>
                                        At least 8 characters
                                    </Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <MaterialIcons
                                        name={password === confirmPassword && password.length > 0 ? "check-circle" : "radio-button-unchecked"}
                                        size={16}
                                        color={password === confirmPassword && password.length > 0 ? '#4CAF50' : c.subtext}
                                    />
                                    <Text style={[styles.requirementText, { color: c.subtext }]}>
                                        Passwords match
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleResetPassword}
                                activeOpacity={0.9}
                                style={[
                                    styles.primaryBtn,
                                    { backgroundColor: c.primary },
                                    isLoading && { opacity: 0.6 }
                                ]}
                                disabled={isLoading}
                            >
                                <Text style={styles.primaryBtnText}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={handleAlertClose}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoWrap: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 28,
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
        maxWidth: 380,
        marginTop: 32,
        gap: 14,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    passwordRequirements: {
        marginTop: 8,
        gap: 8,
    },
    requirementTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    requirementText: {
        fontSize: 12,
    },
    primaryBtn: {
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default ResetPasswordScreen;
