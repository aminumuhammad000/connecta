import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

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
        // Simulate verification
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success chance
                setStatus('success');
            } else {
                setStatus('failed');
            }
        }, 2000);
    };

    const handleContinue = () => {
        // Navigate to dashboard or projects
        navigation.navigate('ClientDashboard');
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
