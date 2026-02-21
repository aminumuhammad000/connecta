import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated, Easing, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import * as subscriptionService from '../services/subscriptionService';
import { SubscriptionData } from '../services/subscriptionService';
import Card from '../components/Card';
import { useInAppAlert } from '../components/InAppAlert';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import PaymentWebView from '../components/PaymentWebView';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ManageSubscriptionScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    // Payment state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [paymentReference, setPaymentReference] = useState('');

    useEffect(() => {
        loadSubscription();
        startEntranceAnimation();
    }, []);

    const startEntranceAnimation = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    };

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(btnScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(btnScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const loadSubscription = async () => {
        try {
            setIsLoading(true);
            const data = await subscriptionService.getMySubscription();
            setSubscription(data);
        } catch (error) {
            console.error('Error loading subscription:', error);
            showAlert({ title: 'Error', message: 'Failed to load subscription details', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async (tier: 'premium' | 'enterprise') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        animateButtonPress();

        // Temporarily disabled flow
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showAlert({
            title: 'Coming Soon',
            message: 'Premium upgrades are continually being improved and will be available shortly. Stay tuned!',
            type: 'info'
        });
    };

    const handlePaymentSuccess = async (transactionId: string) => {
        try {
            setShowPaymentModal(false);
            setIsLoading(true);
            await subscriptionService.verifyUpgradePayment(transactionId, paymentReference);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({ title: 'Success', message: 'Welcome to Premium!', type: 'success' });
            loadSubscription();
        } catch (error: any) {
            console.error('Payment verification error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showAlert({ title: 'Error', message: 'Payment verification failed. Please contact support.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showAlert({ title: 'Cancelled', message: 'Upgrade cancelled.', type: 'info' });
    };

    const handleCancel = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Cancel Subscription',
            'Are you sure? You will lose access to premium features at the end of your billing cycle.',
            [
                { text: 'Keep Plan', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await subscriptionService.cancelSubscription();
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            showAlert({ title: 'Cancelled', message: 'Your subscription has been cancelled', type: 'success' });
                            loadSubscription();
                        } catch (error) {
                            console.error('Error cancelling subscription:', error);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            showAlert({ title: 'Error', message: 'Failed to cancel subscription', type: 'error' });
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading && !subscription) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={{ marginTop: 16, color: c.subtext, fontWeight: '500' }}>Loading plan details...</Text>
            </View>
        );
    }

    const isPremium = subscription?.isPremium;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                    style={[styles.iconBtn, { backgroundColor: c.card }]}
                >
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Manage Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Visual Header / Current Status */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
                    <Text style={[styles.pageTitle, { color: c.text }]}>
                        {isPremium ? 'Your Membership' : 'Upgrade your experience'}
                    </Text>
                    <Text style={[styles.pageSubtitle, { color: c.subtext }]}>
                        {isPremium
                            ? 'You are enjoying the full power of Connecta Premium.'
                            : (user?.userType === 'client'
                                ? 'Access powerful hiring tools and premium support.'
                                : 'Unlock exclusive tools and stand out from the crowd.')
                        }
                    </Text>

                    {/* Plan Card */}
                    <View style={[styles.planCardContainer, {
                        shadowColor: isPremium ? '#F59E0B' : '#000',
                        shadowOpacity: isPremium ? 0.3 : 0.1,
                    }]}>
                        <LinearGradient
                            colors={isPremium ? ['#F59E0B', '#D97706'] : [c.card, c.card]}
                            style={[
                                styles.planCard,
                                !isPremium && { borderWidth: 1, borderColor: c.border }
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.planCardHeader}>
                                <View style={[
                                    styles.planIconCircle,
                                    { backgroundColor: isPremium ? 'rgba(255,255,255,0.2)' : c.background }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={isPremium ? "crown" : "account-outline"}
                                        size={28}
                                        color={isPremium ? '#FFF' : c.subtext}
                                    />
                                </View>
                                {isPremium && (
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                    </View>
                                )}
                            </View>

                            <View style={{ marginTop: 20 }}>
                                <Text style={[styles.planName, { color: isPremium ? '#FFF' : c.text }]}>
                                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                                </Text>
                                <Text style={[styles.planPrice, { color: isPremium ? 'rgba(255,255,255,0.9)' : c.primary, fontSize: 20 }]}>
                                    {isPremium ? 'Full Access' : 'Basic Access'}
                                </Text>
                            </View>

                            {isPremium && (
                                <View style={styles.premiumDecor}>
                                    <Ionicons name="sparkles" size={120} color="rgba(255,255,255,0.1)" />
                                </View>
                            )}
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Content based on Tier */}
                {isPremium ? (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Status Details */}
                        <Card variant="outlined" style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailItem}>
                                    <Text style={[styles.detailLabel, { color: c.subtext }]}>Status</Text>
                                    <Text style={[styles.detailValue, { color: '#10B981' }]}>Active</Text>
                                </View>
                                <View style={[styles.divider, { backgroundColor: c.border }]} />
                                <View style={styles.detailItem}>
                                    <Text style={[styles.detailLabel, { color: c.subtext }]}>Next Bill</Text>
                                    <Text style={[styles.detailValue, { color: c.text }]}>{formatDate(subscription?.expiryDate)}</Text>
                                </View>
                            </View>

                            {subscription?.isExpiringSoon && (
                                <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                                    <MaterialIcons name="warning" size={20} color="#D97706" />
                                    <Text style={[styles.warningText, { color: '#B45309' }]}>
                                        Expires in {subscription.daysUntilExpiry} days
                                    </Text>
                                </View>
                            )}
                        </Card>

                        <Text style={[styles.sectionHeader, { color: c.text }]}>Quick Actions</Text>

                        <View style={styles.actionGrid}>
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: c.card, borderColor: c.border }]}
                                onPress={() => Alert.alert('Billing History', 'No invoices found.')}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                                    <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
                                </View>
                                <Text style={[styles.actionText, { color: c.text }]}>Invoices</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: c.card, borderColor: c.border }]}
                                onPress={() => handleCancel()}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                                </View>
                                <Text style={[styles.actionText, { color: c.text }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.infoCard, { backgroundColor: c.card }]}>
                            <Ionicons name="shield-checkmark" size={24} color={c.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoCardTitle, { color: c.text }]}>Secure Payment</Text>
                                <Text style={[styles.infoCardDesc, { color: c.subtext }]}>Your payment method is secure and encrypted.</Text>
                            </View>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Benefits List */}
                        <Text style={[styles.sectionHeader, { color: c.text, marginTop: 24 }]}>
                            {user?.userType === 'client' ? 'Why Hire Premium?' : 'Why Upgrade?'}
                        </Text>
                        <View style={styles.featuresContainer}>
                            {user?.userType === 'client' ? (
                                <>
                                    <FeatureItem
                                        icon="flash-outline"
                                        title="Featured Job Posts"
                                        desc="Your jobs appear at the top. Get talent 3x faster."
                                        color="#F59E0B"
                                    />
                                    <FeatureItem
                                        icon="shield-checkmark-outline"
                                        title="Verified Badge"
                                        desc="Attract top-tier freelancers with a verified badge."
                                        color="#10B981"
                                    />
                                    <FeatureItem
                                        icon="headset-outline"
                                        title="Premium Support"
                                        desc="24/7 dedicated support for your hiring needs."
                                        color="#3B82F6"
                                    />
                                    <FeatureItem
                                        icon="bulb-outline"
                                        title="Smart Matching"
                                        desc="AI-powered freelancer recommendations."
                                        color="#8B5CF6"
                                    />
                                </>
                            ) : (
                                <>
                                    <FeatureItem
                                        icon="rocket-outline"
                                        title="Boosted Visibility"
                                        desc="Get seen by 3x more clients in search results."
                                        color="#8B5CF6"
                                    />
                                    <FeatureItem
                                        icon="ribbon-outline"
                                        title="Premium Badge"
                                        desc="Stand out with a verified premium badge."
                                        color="#F59E0B"
                                    />
                                    <FeatureItem
                                        icon="infinite-outline"
                                        title="Unlimited Proposals"
                                        desc="Apply to as many jobs as you want. No limits."
                                        color="#10B981"
                                    />
                                    <FeatureItem
                                        icon="analytics-outline"
                                        title="Advanced Analytics"
                                        desc="See who viewed your profile and detailed stats."
                                        color="#3B82F6"
                                    />
                                </>
                            )}
                        </View>

                        {/* Upgrade Button */}
                        <View style={{ marginTop: 24, marginBottom: 40 }}>
                            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => handleUpgrade('premium')}
                                    disabled={isUpgrading}
                                >
                                    <LinearGradient
                                        colors={['#F59E0B', '#D97706']}
                                        style={styles.upgradeBtn}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {isUpgrading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
                                                {/* <Text style={styles.upgradeBtnSub}>₦5,000 / month</Text> */}
                                                <View style={styles.shine} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                            <Text style={[styles.disclaimer, { color: c.subtext }]}>
                                Cancel anytime. Secure payment via Paystack.
                            </Text>
                        </View>
                    </Animated.View>
                )}

            </ScrollView>

            <PaymentWebView
                visible={showPaymentModal}
                paymentUrl={paymentUrl}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
            />
        </SafeAreaView>
    );
}

const FeatureItem = ({ icon, title, desc, color }: any) => {
    const c = useThemeColors();
    return (
        <View style={[styles.featureRow, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.featureIconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: c.text }]}>{title}</Text>
                <Text style={[styles.featureDesc, { color: c.subtext }]}>{desc}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    pageTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
    planCardContainer: {
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
        borderRadius: 24,
    },
    planCard: {
        borderRadius: 24,
        padding: 24,
        height: 200,
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
    },
    planCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    planIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    activeBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    planName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    planPrice: { fontSize: 28, fontWeight: '800' },
    premiumDecor: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        opacity: 0.5,
    },
    sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    featuresContainer: { gap: 12 },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    featureIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    featureDesc: { fontSize: 13, lineHeight: 18 },
    upgradeBtn: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
        position: 'relative',
        overflow: 'hidden',
    },
    upgradeBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    upgradeBtnSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    shine: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        transform: [{ rotate: '12deg' }],
    },
    disclaimer: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 16,
    },
    detailsCard: { marginTop: 24, padding: 20, marginBottom: 24 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailItem: { flex: 1, alignItems: 'center' },
    detailLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    detailValue: { fontSize: 16, fontWeight: '700' },
    divider: { width: 1, height: 30 },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 20,
    },
    warningText: { fontSize: 13, fontWeight: '600', flex: 1 },
    actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    actionCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: { fontSize: 14, fontWeight: '600' },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderRadius: 16,
    },
    infoCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    infoCardDesc: { fontSize: 12, lineHeight: 18 },
});
