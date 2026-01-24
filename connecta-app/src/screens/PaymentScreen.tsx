import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function PaymentScreen({ navigation, route }: any) {
    const c = useThemeColors();
    const {
        projectId,
        jobId,
        projectTitle,
        amount,
        freelancerId,
        freelancerName,
        milestoneId,
        paymentType = 'project_payment'
    } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [useMockPayment, setUseMockPayment] = useState(false);

    const platformFee = paymentType === 'job_verification' ? 0 : (amount * 10) / 100;
    const totalAmount = amount;
    const freelancerReceives = amount - platformFee;

    const handlePayment = async () => {
        if (useMockPayment) {
            handleMockPayment();
            return;
        }

        try {
            setLoading(true);
            // Simulate API call to get authorization URL
            // const response = await fetch(...)

            // Mock response for now
            setTimeout(async () => {
                setLoading(false);
                // In a real app, we'd open the Paystack URL
                // await WebBrowser.openBrowserAsync(data.authorizationUrl);

                // For now, just simulate success via mock
                Alert.alert("Payment", "Redirecting to payment gateway...");
                handleMockPayment();
            }, 1500);
        } catch (error) {
            console.error(error);
            setLoading(false);
            Alert.alert("Error", "Failed to initiate payment");
        }
    };

    const handleMockPayment = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                "Success",
                "Payment successful! Funds added to escrow.",
                [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]
            );
        }, 2000);
    };

    if (!amount) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: c.text }}>Invalid Payment Request</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                    <Text style={{ color: c.primary }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Payment Confirmation</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.projectInfo}>
                        <View style={[styles.iconContainer, { backgroundColor: c.background }]}>
                            <Ionicons
                                name={paymentType === 'job_verification' ? "briefcase" : "document-text"}
                                size={32}
                                color={c.primary}
                            />
                        </View>
                        <View style={styles.projectDetails}>
                            <Text style={[styles.projectTitle, { color: c.text }]}>{projectTitle}</Text>
                            {freelancerName && (
                                <Text style={[styles.freelancerName, { color: c.subtext }]}>
                                    Payment to: <Text style={{ fontWeight: 'bold', color: c.text }}>{freelancerName}</Text>
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: c.border }]} />

                    <Text style={[styles.sectionTitle, { color: c.text }]}>Payment Summary</Text>

                    <View style={styles.row}>
                        <Text style={[styles.label, { color: c.subtext }]}>
                            {paymentType === 'job_verification' ? 'Verification Fee' : 'Project Amount'}
                        </Text>
                        <Text style={[styles.value, { color: c.text }]}>₦{amount.toLocaleString()}</Text>
                    </View>

                    {paymentType !== 'job_verification' && (
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: c.subtext }]}>Platform Fee (10%)</Text>
                            <Text style={[styles.value, { color: c.text }]}>₦{platformFee.toLocaleString()}</Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: c.border }]} />

                    <View style={styles.row}>
                        <Text style={[styles.totalLabel, { color: c.text }]}>Total Payment</Text>
                        <Text style={[styles.totalValue, { color: c.primary }]}>₦{totalAmount.toLocaleString()}</Text>
                    </View>

                    {paymentType !== 'job_verification' && (
                        <View style={styles.freelancerRow}>
                            <Text style={[styles.smallLabel, { color: c.subtext }]}>Freelancer Receives</Text>
                            <Text style={[styles.smallValue, { color: c.text }]}>₦{freelancerReceives.toLocaleString()}</Text>
                        </View>
                    )}

                    {paymentType !== 'job_verification' && (
                        <View style={[styles.escrowBox, { backgroundColor: c.background }]}>
                            <Ionicons name="shield-checkmark" size={24} color={c.primary} />
                            <View style={styles.escrowTextContainer}>
                                <Text style={[styles.escrowTitle, { color: c.text }]}>Escrow Protection</Text>
                                <Text style={[styles.escrowDesc, { color: c.subtext }]}>
                                    Your payment is held securely until you approve the work.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.mockToggle}>
                        <Text style={{ color: c.text }}>Use Mock Payment (Testing)</Text>
                        <Switch value={useMockPayment} onValueChange={setUseMockPayment} />
                    </View>

                    <TouchableOpacity
                        style={[styles.payButton, { backgroundColor: c.primary }]}
                        onPress={handlePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.payButtonText}>Pay Securely</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.securityBadges}>
                        <View style={styles.badge}>
                            <Ionicons name="shield-checkmark-outline" size={16} color={c.subtext} />
                            <Text style={[styles.badgeText, { color: c.subtext }]}>SSL Encrypted</Text>
                        </View>
                        <View style={styles.badge}>
                            <Ionicons name="card-outline" size={16} color={c.subtext} />
                            <Text style={[styles.badgeText, { color: c.subtext }]}>Paystack Secured</Text>
                        </View>
                    </View>
                </View>
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
    card: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    projectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    projectDetails: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    freelancerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    smallLabel: {
        fontSize: 12,
    },
    smallValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    escrowBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'flex-start',
    },
    escrowTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    escrowTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    escrowDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    mockToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    payButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    payButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    securityBadges: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
    },
});
