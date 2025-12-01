import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import * as subscriptionService from '../services/subscriptionService';
import { SubscriptionData } from '../services/subscriptionService';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ManageSubscriptionScreen({ navigation }: any) {
    const c = useThemeColors();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            setIsLoading(true);
            const data = await subscriptionService.getMySubscription();
            setSubscription(data);
        } catch (error) {
            console.error('Error loading subscription:', error);
            Alert.alert('Error', 'Failed to load subscription details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async (tier: 'premium' | 'enterprise') => {
        try {
            setIsUpgrading(true);
            await subscriptionService.upgradeSubscription(tier, 1);
            Alert.alert('Success', `Upgraded to ${tier} successfully!`);
            loadSubscription();
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            Alert.alert('Error', 'Failed to upgrade subscription');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleCancel = async () => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure you want to cancel your subscription? You will retain access until the expiry date.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await subscriptionService.cancelSubscription();
                            Alert.alert('Cancelled', 'Your subscription has been cancelled');
                            loadSubscription();
                        } catch (error) {
                            console.error('Error cancelling subscription:', error);
                            Alert.alert('Error', 'Failed to cancel subscription');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'premium':
                return '#F59E0B';
            case 'enterprise':
                return '#8B5CF6';
            default:
                return c.subtext;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Manage Subscription</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Current Plan Card */}
                <Card variant="elevated" padding={20} style={{ marginBottom: 16 }}>
                    <View style={styles.planHeader}>
                        <MaterialIcons
                            name={subscription?.isPremium ? 'workspace-premium' : 'person'}
                            size={48}
                            color={getTierColor(subscription?.subscriptionTier || 'free')}
                        />
                        <Text style={[styles.planTitle, { color: c.text }]}>
                            {subscription?.subscriptionTier?.toUpperCase() || 'FREE'} PLAN
                        </Text>
                        {subscription?.isPremium && (
                            <Text style={[styles.planPrice, { color: c.primary }]}>₦5,000/month</Text>
                        )}
                    </View>

                    {subscription?.isPremium && (
                        <>
                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Status</Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                subscription.subscriptionStatus === 'active'
                                                    ? '#10B98122'
                                                    : '#EF444422',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    subscription.subscriptionStatus === 'active'
                                                        ? '#10B981'
                                                        : '#EF4444',
                                            },
                                        ]}
                                    >
                                        {subscription.subscriptionStatus?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Next Billing Date</Text>
                                <Text style={[styles.infoValue, { color: c.text }]}>
                                    {formatDate(subscription.expiryDate)}
                                </Text>
                            </View>

                            {subscription.isExpiringSoon && (
                                <View style={[styles.warningBanner, { backgroundColor: '#F59E0B22', borderColor: '#F59E0B' }]}>
                                    <MaterialIcons name="warning" size={20} color="#F59E0B" />
                                    <Text style={[styles.warningText, { color: '#F59E0B' }]}>
                                        Expires in {subscription.daysUntilExpiry} days
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </Card>

                {/* Premium Management Options */}
                {subscription?.isPremium ? (
                    <>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Payment & Billing</Text>

                        <Card variant="outlined" padding={16} style={{ marginBottom: 16 }}>
                            <View style={styles.cardRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[styles.iconBox, { backgroundColor: c.primary + '20' }]}>
                                        <MaterialIcons name="credit-card" size={24} color={c.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.cardLabel, { color: c.text }]}>Payment Method</Text>
                                        <Text style={[styles.cardSub, { color: c.subtext }]}>Visa ending in 4242</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => Alert.alert('Manage Payment', 'Redirecting to payment provider...')}>
                                    <Text style={[styles.linkText, { color: c.primary }]}>Manage</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>

                        <Card variant="outlined" padding={16} style={{ marginBottom: 24 }}>
                            <Text style={[styles.cardLabel, { color: c.text, marginBottom: 12 }]}>Billing History</Text>
                            {[1, 2, 3].map((_, i) => (
                                <View key={i} style={[styles.historyRow, i !== 2 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                                    <View>
                                        <Text style={[styles.historyDate, { color: c.text }]}>
                                            {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                        </Text>
                                        <Text style={[styles.historyDesc, { color: c.subtext }]}>Premium Subscription</Text>
                                    </View>
                                    <Text style={[styles.historyAmount, { color: c.text }]}>₦5,000</Text>
                                </View>
                            ))}
                        </Card>

                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: '#EF4444' }]}
                            onPress={handleCancel}
                        >
                            <Text style={[styles.cancelText, { color: '#EF4444' }]}>Cancel Subscription</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    /* Upgrade Options for Free Users */
                    <>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Upgrade Your Plan</Text>

                        <Card variant="elevated" padding={16} style={{ marginBottom: 12 }}>
                            <View style={styles.tierHeader}>
                                <MaterialIcons name="workspace-premium" size={32} color="#F59E0B" />
                                <Text style={[styles.tierName, { color: c.text }]}>Premium</Text>
                            </View>
                            <Text style={[styles.tierPrice, { color: c.text }]}>₦5,000/month</Text>
                            <View style={styles.featuresList}>
                                <FeatureItem text="Priority support" />
                                <FeatureItem text="Advanced analytics" />
                                <FeatureItem text="Unlimited projects" />
                                <FeatureItem text="Premium badge" />
                                <FeatureItem text="Verified Payment Status" />
                            </View>
                            <Button
                                title="Upgrade to Premium"
                                onPress={() => handleUpgrade('premium')}
                                variant="primary"
                                disabled={isUpgrading}
                            />
                        </Card>
                    </>
                )}
            </ScrollView>
        </SafeAreaView >
    );
}

function FeatureItem({ text }: { text: string }) {
    const c = useThemeColors();
    return (
        <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
            <Text style={[styles.featureText, { color: c.text }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    planHeader: { alignItems: 'center', marginBottom: 16 },
    planTitle: { fontSize: 24, fontWeight: '800', marginTop: 8 },
    planPrice: { fontSize: 18, fontWeight: '700', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginBottom: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoLabel: { fontSize: 14, fontWeight: '600' },
    infoValue: { fontSize: 14, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '700' },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 12,
    },
    warningText: { fontSize: 13, fontWeight: '600', flex: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
    tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    tierName: { fontSize: 20, fontWeight: '700' },
    tierPrice: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    featuresList: { marginBottom: 16 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    featureText: { fontSize: 14 },
    cancelButton: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        marginBottom: 32,
    },
    cancelText: { fontSize: 16, fontWeight: '700' },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardLabel: { fontSize: 16, fontWeight: '700' },
    cardSub: { fontSize: 13 },
    linkText: { fontSize: 14, fontWeight: '700' },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    historyDate: { fontSize: 14, fontWeight: '600' },
    historyDesc: { fontSize: 12 },
    historyAmount: { fontSize: 14, fontWeight: '700' },
});
