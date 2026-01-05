import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import * as paymentService from '../services/paymentService';
import { CommonActions } from '@react-navigation/native';

export default function PaymentCallbackScreen({ navigation, route }: any) {
    const c = useThemeColors();
    const { status: initialStatus, reference } = route.params || {};
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>(initialStatus || 'verifying');

    useEffect(() => {
        if (status === 'verifying') {
            verifyPayment();
        }
    }, []);

    const verifyPayment = async () => {
        // transaction_id might come as transaction_id or transactionId depending on the provider/redirect
        const txId = (route.params as any)?.transaction_id || (route.params as any)?.transactionId || reference;

        if (!reference) {
            setStatus('failed');
            return;
        }

        try {
            // Call the real backend verification
            // If txId is missing, we might use reference as fallback if allowed, but backend said it's required.
            // Using reference as fallback for txId just in case
            await paymentService.verifyPayment(reference, txId);
            setStatus('success');
        } catch (error) {
            console.error('Payment verification failed:', error);
            setStatus('failed');
        }
    };

    const handleContinue = () => {
        // Navigate to dashboard or jobs
        navigation.reset({
            index: 0,
            routes: [{ name: 'ClientDashboard' }],
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                {status === 'verifying' && (
                    <>
                        <ActivityIndicator size="large" color={c.primary} style={styles.icon} />
                        <Text style={[styles.title, { color: c.text }]}>Verifying Payment</Text>
                        <Text style={[styles.message, { color: c.subtext }]}>Please wait while we confirm your transaction...</Text>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={styles.icon} />
                        <Text style={[styles.title, { color: c.text }]}>Payment Successful!</Text>
                        <Text style={[styles.message, { color: c.subtext }]}>
                            Your payment has been processed and funds are now in escrow.
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: c.primary }]}
                            onPress={handleContinue}
                        >
                            <Text style={styles.buttonText}>Continue to Dashboard</Text>
                        </TouchableOpacity>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <Ionicons name="alert-circle" size={80} color="#F44336" style={styles.icon} />
                        <Text style={[styles.title, { color: c.text }]}>Payment Failed</Text>
                        <Text style={[styles.message, { color: c.subtext }]}>
                            We couldn't process your payment. Please try again.
                        </Text>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: c.primary }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.buttonText}>Try Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.outlineButton, { borderColor: c.border }]}
                                onPress={handleContinue}
                            >
                                <Text style={[styles.outlineButtonText, { color: c.text }]}>Back to Dashboard</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actions: {
        width: '100%',
    },
    outlineButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
