import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { useInAppAlert } from '../components/InAppAlert';
import * as rewardService from '../services/rewardService';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SetTransactionPinScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const slideAnim = useRef(new Animated.Value(0)).current;

    const handlePinPress = (num: string) => {
        if (!isConfirming) {
            if (pin.length < 4) {
                const newPin = pin + num;
                setPin(newPin);
                Haptics.selectionAsync();
                if (newPin.length === 4) {
                    // Move to confirmation
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setTimeout(() => {
                        setIsConfirming(true);
                        // Optional: Slide animation here
                    }, 300);
                }
            }
        } else {
            if (confirmPin.length < 4) {
                const newConfirm = confirmPin + num;
                setConfirmPin(newConfirm);
                Haptics.selectionAsync();
                if (newConfirm.length === 4) {
                    handleFinalSubmit(newConfirm);
                }
            }
        }
    };

    const handleBackspace = () => {
        if (!isConfirming) {
            setPin(pin.slice(0, -1));
        } else {
            if (confirmPin === '') {
                setIsConfirming(false);
            } else {
                setConfirmPin(confirmPin.slice(0, -1));
            }
        }
        Haptics.selectionAsync();
    };

    const handleFinalSubmit = async (finalConfirm: string) => {
        if (pin !== finalConfirm) {
            showAlert({ title: 'Mismatch', message: 'PINs do not match. Please try again.', type: 'error' });
            setConfirmPin('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        try {
            setIsLoading(true);
            await rewardService.setTransactionPin(pin);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({ title: 'PIN Set', message: 'Your transaction PIN has been set successfully.', type: 'success' });
            navigation.goBack();
        } catch (error: any) {
            showAlert({ title: 'Failed', message: error.message || 'Could not set PIN', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const currentStatus = !isConfirming ? 'Create PIN' : 'Confirm PIN';
    const currentPin = !isConfirming ? pin : confirmPin;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Transaction PIN</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.iconCtx, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <MaterialIcons name="lock-outline" size={40} color={c.primary} />
                </View>

                <Text style={[styles.title, { color: c.text }]}>{currentStatus}</Text>
                <Text style={[styles.sub, { color: c.subtext }]}>
                    {!isConfirming
                        ? 'Set a 4-digit PIN to secure your Spark transfers and other sensitive actions.'
                        : 'Re-enter your 4-digit PIN to confirm it is correct.'}
                </Text>

                <View style={styles.pinDisplay}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.pinDot,
                                { borderColor: c.primary, backgroundColor: currentPin.length > i ? c.primary : 'transparent' }
                            ]}
                        />
                    ))}
                </View>

                {isLoading && <ActivityIndicator size="large" color={c.primary} style={{ marginVertical: 20 }} />}

                <View style={styles.pinPad}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((key, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.pinKey}
                            onPress={() => key === 'delete' ? handleBackspace() : key !== '' ? handlePinPress(key) : null}
                            disabled={isLoading}
                        >
                            {key === 'delete' ? (
                                <MaterialIcons name="backspace" size={24} color={c.text} />
                            ) : (
                                <Text style={[styles.pinKeyText, { color: c.text }]}>{key}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1, padding: 24, alignItems: 'center' },
    iconCtx: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 20 },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
    sub: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 20 },
    pinDisplay: { flexDirection: 'row', gap: 20, marginBottom: 40 },
    pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
    pinPad: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'center', marginTop: 'auto' },
    pinKey: { width: '33%', height: 80, alignItems: 'center', justifyContent: 'center' },
    pinKeyText: { fontSize: 28, fontWeight: '600' }
});

export default SetTransactionPinScreen;
