import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Dimensions, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import paymentService from '../services/paymentService';
import * as rewardService from '../services/rewardService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../utils/constants';
import { getToken } from '../utils/storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface WalletData {
    balance: number;
    availableBalance: number;
    escrowBalance: number;
    currency: string;
    isVerified: boolean;
    bankDetails?: any;
}

const ClientWalletScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation() as any;
    const { showAlert } = useInAppAlert();

    const [activeWallet, setActiveWallet] = useState<'naira' | 'spark'>('naira');
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [sparkBalance, setSparkBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Deposit modal
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);

    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);

    const mapTransactionType = (type: string, status: string) => {
        if (status === 'pending') return 'pending';
        if (type === 'withdrawal') return 'withdrawal';
        return 'income';
    };

    const loadData = useCallback(async () => {
        try {
            const [walletData, txnsData, sparks, sparkHist] = await Promise.all([
                paymentService.getWalletBalance().catch(() => null),
                paymentService.getTransactions().catch(() => []),
                rewardService.getRewardBalance().catch(() => 0),
                rewardService.getSparkHistory().catch(() => []),
            ]);

            if (walletData) setWallet(walletData);
            setSparkBalance(sparks);

            const mappedTxns = txnsData.map((t: any) => ({
                id: t._id,
                kind: 'naira',
                type: mapTransactionType(t.type, t.status),
                title: t.description,
                date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                amount: t.type === 'withdrawal' ? -t.amount : t.amount,
                status: t.status,
                rawDate: new Date(t.createdAt)
            }));

            const sparkHistData = Array.isArray(sparkHist) ? sparkHist : (sparkHist as any)?.data || [];
            const mappedSparks = sparkHistData.map((t: any) => {
                let title = t.description || 'Spark Transaction';
                let subtitle = '';
                if (t.type === 'transfer_send') {
                    const match = t.description?.match(/to (.+)$/) || [];
                    title = `Sent to ${match[1] || t.metadata?.recipientEmail || 'someone'}`;
                    subtitle = t.metadata?.recipientEmail || '';
                } else if (t.type === 'transfer_receive') {
                    const match = t.description?.match(/from (.+)$/) || [];
                    title = `Received from ${match[1] || t.metadata?.senderEmail || 'someone'}`;
                    subtitle = t.metadata?.senderEmail || '';
                } else if (t.type === 'daily_reward') {
                    title = '🌅 Daily Login Reward';
                }
                return {
                    id: t._id,
                    kind: 'spark',
                    type: t.amount > 0 ? 'income' : 'withdrawal',
                    txnType: t.type,
                    title,
                    subtitle,
                    date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    amount: t.amount,
                    status: 'completed',
                    rawDate: new Date(t.createdAt)
                };
            });

            const combined = [...mappedTxns, ...mappedSparks].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
            setTransactions(combined);
        } catch (error) {
            console.error('Error loading client wallet:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const handleRefresh = () => { setRefreshing(true); loadData(); };

    const filteredTransactions = useMemo(() => transactions.filter(t => t.kind === activeWallet), [activeWallet, transactions]);

    const switchWallet = (type: 'naira' | 'spark') => {
        const index = type === 'naira' ? 0 : 1;
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveWallet(type);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            showAlert({ title: 'Invalid Amount', message: 'Please enter a valid deposit amount', type: 'error' });
            return;
        }
        try {
            setIsDepositing(true);
            const data = await paymentService.initializeTopup({
                amount,
                description: 'Wallet Top-up'
            });

            if (data?.authorizationUrl) {
                navigation.navigate('Payment', { paymentUrl: data.authorizationUrl, amount });
                setShowDepositModal(false);
                setDepositAmount('');
            } else {
                showAlert({ title: 'Error', message: 'Failed to initialize deposit', type: 'error' });
            }
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Deposit failed', type: 'error' });
        } finally {
            setIsDepositing(false);
        }
    };

    const renderNairaCard = () => (
        <View style={styles.cardWrapper}>
            <LinearGradient
                colors={[c.primary, c.primary + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
            >
                <View style={{ position: 'relative', zIndex: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.cardLabel}>Available Balance</Text>
                            <Text style={styles.cardCurrency}>Nigerian Naira (NGN)</Text>
                        </View>
                        <View style={[styles.cardTypeBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <FontAwesome5 name="wallet" size={14} color="#fff" />
                            <Text style={styles.cardTypeText}>Funds</Text>
                        </View>
                    </View>

                    <Text style={styles.cardBalance}>
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.availableBalance || 0)}
                    </Text>

                    <View style={styles.cardMetrics}>
                        <View>
                            <Text style={styles.metricLabel}>Total Balance</Text>
                            <Text style={styles.metricValue}>
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.balance || 0)}
                            </Text>
                        </View>
                        <View style={styles.cardDivider} />
                        <View>
                            <Text style={styles.metricLabel}>In Escrow</Text>
                            <Text style={styles.metricValue}>
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.escrowBalance || 0)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Client: Deposit instead of Withdraw */}
                <TouchableOpacity
                    onPress={() => setShowDepositModal(true)}
                    style={[styles.cardActionBtn, { backgroundColor: '#fff' }]}
                >
                    <Text style={[styles.cardActionText, { color: '#1E1B4B' }]}>Deposit Funds</Text>
                    <MaterialIcons name="add" size={16} color="#1E1B4B" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const renderSparkCard = () => (
        <View style={styles.cardWrapper}>
            <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
            >
                <View style={{ position: 'relative', zIndex: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.cardLabel}>Spark Balance</Text>
                            <Text style={styles.cardCurrency}>Digital Currency (SPK)</Text>
                        </View>
                        <View style={[styles.cardTypeBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <MaterialIcons name="bolt" size={16} color="#FBBF24" />
                            <Text style={styles.cardTypeText}>Reward</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                        <Text style={[styles.cardBalance, { marginTop: 0 }]}>{sparkBalance.toLocaleString()}</Text>
                        <MaterialIcons name="bolt" size={32} color="#FBBF24" style={{ marginLeft: 6 }} />
                    </View>

                    <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                            style={styles.sparkAction}
                            onPress={async () => {
                                const hasPin = await rewardService.checkHasPin();
                                if (!hasPin) {
                                    Alert.alert('Set Transaction PIN', 'You need a 4-digit security PIN to transfer Sparks.', [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Set PIN Now', onPress: () => navigation.navigate('SetTransactionPin') }
                                    ]);
                                } else {
                                    navigation.navigate('SendSpark');
                                }
                            }}
                        >
                            <View style={styles.sparkActionIcon}><MaterialIcons name="send" size={20} color="#fff" /></View>
                            <Text style={styles.sparkActionText}>Send</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sparkAction} onPress={() => navigation.navigate('ReceiveSpark')}>
                            <View style={styles.sparkActionIcon}><MaterialIcons name="call-received" size={20} color="#fff" /></View>
                            <Text style={styles.sparkActionText}>Receive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sparkAction} onPress={() => showAlert({ title: 'Coming Soon', message: 'Buying Sparks directly will be available soon!', type: 'info' })}>
                            <View style={[styles.sparkActionIcon, { backgroundColor: 'rgba(251, 191, 36, 0.3)' }]}><MaterialIcons name="shopping-cart" size={20} color="#fff" /></View>
                            <Text style={styles.sparkActionText}>Buy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Header */}
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.screenTitle, { color: c.text }]}>My Wallet</Text>
                </View>
                <TouchableOpacity onPress={handleRefresh}>
                    <Ionicons name="refresh-outline" size={24} color={c.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} />}
            >
                {/* Wallet Switcher */}
                <View style={styles.switcherContainer}>
                    <View style={[styles.switcherBg, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TouchableOpacity
                            style={[styles.switcherBtn, activeWallet === 'naira' && { backgroundColor: c.isDark ? '#1E1B4B' : '#E0E7FF' }]}
                            onPress={() => switchWallet('naira')}
                        >
                            <Text style={[styles.switcherText, { color: activeWallet === 'naira' ? c.primary : c.subtext, fontWeight: activeWallet === 'naira' ? '800' : '600' }]}>Naira Wallet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.switcherBtn, activeWallet === 'spark' && { backgroundColor: c.isDark ? '#312E81' : '#E0E7FF' }]}
                            onPress={() => switchWallet('spark')}
                        >
                            <Text style={[styles.switcherText, { color: activeWallet === 'spark' ? c.primary : c.subtext, fontWeight: activeWallet === 'spark' ? '800' : '600' }]}>⚡ Spark Wallet</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Swipeable Cards */}
                <View style={styles.cardsContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={[0, 1]}
                        renderItem={({ item }) => item === 0 ? renderNairaCard() : renderSparkCard()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveWallet(index === 0 ? 'naira' : 'spark');
                        }}
                        keyExtractor={(item) => item.toString()}
                    />
                </View>

                {/* Dot Indicators */}
                <View style={styles.dotsRow}>
                    {[0, 1].map((i) => {
                        const active = (activeWallet === 'naira' && i === 0) || (activeWallet === 'spark' && i === 1);
                        return <View key={i} style={[styles.dot, { backgroundColor: active ? c.primary : c.border, width: active ? 20 : 8 }]} />;
                    })}
                </View>

                {/* Transactions Section */}
                <View style={styles.txnSection}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>
                        {activeWallet === 'naira' ? '💳 Naira Transactions' : '⚡ Spark Transactions'}
                    </Text>

                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.slice(0, 20).map((t, index) => {
                            const isIncome = t.type === 'income';
                            const isPending = t.status === 'pending';
                            const color = isPending ? '#F59E0B' : isIncome ? '#10B981' : '#EF4444';
                            return (
                                <View key={`${t.id}-${index}`} style={[styles.txnItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                    <View style={[styles.txnIconCtx, { backgroundColor: isPending ? 'rgba(245,158,11,0.1)' : isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                        {t.kind === 'spark' ? (
                                            <MaterialIcons name="bolt" size={24} color={color} />
                                        ) : (
                                            <MaterialIcons name={isPending ? 'access-time' : isIncome ? 'call-received' : 'call-made'} size={24} color={color} />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.txnTitle, { color: c.text }]} numberOfLines={1}>{t.title}</Text>
                                        <View style={styles.txnMeta}>
                                            <Text style={[styles.txnDate, { color: c.subtext }]}>{t.date}</Text>
                                            {t.subtitle ? (
                                                <Text style={[styles.txnStatusText, { color: c.subtext, marginLeft: 6 }]} numberOfLines={1}>{t.subtitle}</Text>
                                            ) : (
                                                <View style={[styles.txnStatusBadge, { backgroundColor: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                                    <Text style={[styles.txnStatusText, { color: isPending ? '#F59E0B' : c.subtext }]}>{t.status}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.txnAmount, { color, fontSize: 16 }]}>
                                            {isIncome ? '+' : ''}
                                            {t.kind === 'spark'
                                                ? `${t.amount}`
                                                : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(t.amount)
                                            }
                                        </Text>
                                        {t.kind === 'spark' && t.txnType === 'transfer_send' && (
                                            <MaterialIcons name="arrow-upward" size={12} color="#EF4444" />
                                        )}
                                        {t.kind === 'spark' && t.txnType === 'transfer_receive' && (
                                            <MaterialIcons name="arrow-downward" size={12} color="#10B981" />
                                        )}
                                        {t.kind === 'spark' && <Text style={{ fontSize: 10, color: c.subtext }}>Sparks</Text>}
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={c.subtext} />
                            <Text style={[styles.emptyTitle, { color: c.text }]}>No Transactions Yet</Text>
                            <Text style={[styles.emptySubtitle, { color: c.subtext }]}>
                                {activeWallet === 'naira' ? 'Deposit funds to get started.' : 'Send or receive Sparks to see history here.'}
                            </Text>
                            {activeWallet === 'naira' && (
                                <TouchableOpacity
                                    style={[styles.emptyBtn, { backgroundColor: c.primary }]}
                                    onPress={() => setShowDepositModal(true)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>Deposit Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Deposit Modal */}
            <Modal visible={showDepositModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: c.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>Deposit Funds</Text>
                            <TouchableOpacity onPress={() => { setShowDepositModal(false); setDepositAmount(''); }}>
                                <MaterialIcons name="close" size={24} color={c.subtext} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalSub, { color: c.subtext }]}>Enter the amount you want to deposit into your wallet.</Text>
                        <View style={[styles.modalInput, { borderColor: c.border, backgroundColor: c.background }]}>
                            <Text style={[{ color: c.subtext, fontSize: 16, marginRight: 8 }]}>₦</Text>
                            <TextInput
                                style={[{ flex: 1, color: c.text, fontSize: 20, fontWeight: '700' }]}
                                placeholder="0.00"
                                placeholderTextColor={c.subtext}
                                value={depositAmount}
                                onChangeText={setDepositAmount}
                                keyboardType="numeric"
                                autoFocus
                            />
                        </View>
                        {/* Quick amounts */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                            {['1000', '5000', '10000', '50000'].map(amt => (
                                <TouchableOpacity
                                    key={amt}
                                    style={[styles.quickAmt, { borderColor: c.primary }]}
                                    onPress={() => setDepositAmount(amt)}
                                >
                                    <Text style={{ color: c.primary, fontSize: 12, fontWeight: '700' }}>
                                        ₦{parseInt(amt).toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.depositBtn, { backgroundColor: c.primary, opacity: isDepositing ? 0.7 : 1 }]}
                            onPress={handleDeposit}
                            disabled={isDepositing}
                        >
                            {isDepositing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.depositBtnText}>Proceed to Payment</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
    screenTitle: { fontSize: 20, fontWeight: '900' },
    switcherContainer: { paddingHorizontal: 20, paddingVertical: 16 },
    switcherBg: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 4 },
    switcherBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    switcherText: { fontSize: 14 },
    cardsContainer: { height: 260 },
    cardWrapper: { width: CARD_WIDTH, marginHorizontal: 16 },
    balanceCard: { borderRadius: 28, padding: 28, height: 240, justifyContent: 'space-between' },
    cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
    cardCurrency: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
    cardTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    cardTypeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    cardBalance: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 12, letterSpacing: -1 },
    cardMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    metricLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
    metricValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
    cardDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
    cardActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 8 },
    cardActionText: { fontSize: 15, fontWeight: '800' },
    cardActionsRow: { flexDirection: 'row', gap: 20, marginTop: 20 },
    sparkAction: { alignItems: 'center', gap: 6 },
    sparkActionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    sparkActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
    dot: { height: 8, borderRadius: 4 },
    txnSection: { marginTop: 16, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 16 },
    txnItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
    txnIconCtx: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    txnTitle: { fontSize: 14, fontWeight: '700' },
    txnMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    txnDate: { fontSize: 12 },
    txnStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    txnStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    txnAmount: { fontWeight: '800' },
    emptyState: { paddingVertical: 60, alignItems: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    modalSub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
    modalInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 20, height: 64, marginBottom: 16 },
    quickAmt: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
    depositBtn: { height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    depositBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default ClientWalletScreen;
