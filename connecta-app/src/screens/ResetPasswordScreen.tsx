import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../services/authService';
import { useInAppAlert } from '../components/InAppAlert';
import ChatGreeting from '../components/ChatGreeting';
import Button from '../components/Button';
import Input from '../components/Input';
import AnimatedBackground from '../components/AnimatedBackground';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

interface ResetPasswordScreenProps {
    email: string;
    resetToken: string;
    onPasswordReset?: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ email, resetToken, onPasswordReset }) => {
    const navigation = useNavigation();
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const validatePassword = () => {
        setPasswordError('');
        setConfirmError('');

        let hasError = false;
        if (!password.trim()) {
            setPasswordError('Please enter a new password.');
            hasError = true;
        }

        if (password.length < 8) {
            setPasswordError('Your new password should be at least 8 characters long.');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Those passwords don\'t match. Can you double check?');
            hasError = true;
        }

        if (hasError) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) return;

        setIsLoading(true);

        try {
            await resetPassword(resetToken, password);

            showAlert({
                title: 'Success',
                message: 'Your password has been updated. You can now log in with your new password!',
                type: 'success'
            });
            onPasswordReset?.();
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.', type: 'error' });
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
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.headerControls}>
                        </View>

                        <View style={styles.chatSection}>
                            <ChatGreeting
                                messages={[
                                    { text: 'New Beginnings 🔑' },
                                    { text: "Let's get your account back with a fresh password." },
                                    { text: email, delay: 500 }
                                ]}
                            />
                        </View>

                        <View style={styles.form}>
                            <View style={styles.passContainer}>
                                <Input
                                    value={password}
                                    onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                                    placeholder="New Password"
                                    icon="lock-outline"
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                    error={passwordError}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
                                </TouchableOpacity>
                            </View>

                            <Input
                                value={confirmPassword}
                                onChangeText={(val) => { setConfirmPassword(val); setConfirmError(''); }}
                                placeholder="Confirm New Password"
                                icon="lock-outline"
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                                error={confirmError}
                            />

                            <View style={styles.passwordRequirements}>
                                <Text style={[styles.requirementTitle, { color: c.text }]}>Password must contain:</Text>
                                <View style={styles.requirementItem}>
                                    <MaterialIcons
                                        name={password.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                                        size={18}
                                        color={password.length >= 8 ? '#4CAF50' : c.subtext}
                                    />
                                    <Text style={[styles.requirementText, { color: c.subtext }]}>
                                        At least 8 characters
                                    </Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <MaterialIcons
                                        name={password === confirmPassword && password.length > 0 ? "check-circle" : "radio-button-unchecked"}
                                        size={18}
                                        color={password === confirmPassword && password.length > 0 ? '#4CAF50' : c.subtext}
                                    />
                                    <Text style={[styles.requirementText, { color: c.subtext }]}>
                                        Passwords match
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.buttonWrapper}>
                                <Button
                                    title={isLoading ? 'Resetting...' : 'Reset Password'}
                                    onPress={handleResetPassword}
                                    loading={isLoading}
                                    size="large"
                                />
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
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40 },
    chatSection: {
        marginBottom: 32,
    },
    headerControls: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
    form: { gap: 20, marginBottom: 32 },
    passContainer: { position: 'relative' },
    eyeIcon: { position: 'absolute', right: 16, top: 18 },
    passwordRequirements: {
        marginTop: 10,
        gap: 10,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
    },
    requirementTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
    requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    requirementText: { fontSize: 13, fontWeight: '500' },
    footer: { marginTop: 'auto', alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
});

export default ResetPasswordScreen;
