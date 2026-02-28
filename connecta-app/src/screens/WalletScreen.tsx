import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Dimensions, FlatList, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import paymentService from '../services/paymentService';
import * as rewardService from '../services/rewardService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface WalletData {
  balance: number;
  availableBalance: number;
  escrowBalance: number;
  currency: string;
  isVerified: boolean;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  };
}

const WalletScreen = () => {
  const c = useThemeColors();
  const navigation = useNavigation() as any;
  const { showAlert } = useInAppAlert();

  const [activeWallet, setActiveWallet] = useState<'naira' | 'spark'>('naira');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [sparkBalance, setSparkBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const loadData = useCallback(async () => {
    try {
      const [walletData, txnsData, sparks, sparkHist] = await Promise.all([
        paymentService.getWalletBalance().catch(() => null),
        paymentService.getTransactions().catch(() => []),
        rewardService.getRewardBalance().catch(() => 0),
        rewardService.getSparkHistory().catch(() => ({ data: [] })),
      ]);

      if (walletData) {
        setWallet(walletData);
        if (!walletData.isVerified && !walletData.bankDetails) {
          // Only show setup if they have balance but no bank details
          if (walletData.balance > 0) setShowSetupModal(true);
        }
      }

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

      const sparkHistData = Array.isArray(sparkHist) ? sparkHist : (sparkHist as any)?.data || (sparkHist as any)?.transactions || [];
      const mappedSparks = sparkHistData.map((t: any) => {
        // Build a context-aware title based on transaction type
        let title = t.description || 'Spark Transaction';
        let subtitle = '';
        if (t.type === 'transfer_send') {
          // Extract name from description: "Sent Sparks to John Doe"
          const match = t.description?.match(/to (.+)$/) || [];
          title = `Sent to ${match[1] || (t.metadata?.recipientEmail || 'someone')}`;
          subtitle = t.metadata?.recipientEmail || '';
        } else if (t.type === 'transfer_receive') {
          const match = t.description?.match(/from (.+)$/) || [];
          title = `Received from ${match[1] || (t.metadata?.senderEmail || 'someone')}`;
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

      // Combine and Sort
      const combined = [...mappedTxns, ...mappedSparks].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setTransactions(combined);

    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const mapTransactionType = (type: string, status: string) => {
    if (status === 'pending') return 'pending';
    if (type === 'withdrawal') return 'withdrawal';
    return 'income';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.kind === activeWallet);
  }, [activeWallet, transactions]);

  const handleWithdrawPress = () => {
    if (!wallet?.isVerified) {
      setShowSetupModal(true);
    } else {
      setShowWithdrawModal(true);
    }
  };

  const submitWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert({ title: 'Invalid Amount', message: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (amount > (wallet?.availableBalance || 0)) {
      showAlert({ title: 'Insufficient Funds', message: 'Amount exceeds available balance', type: 'error' });
      return;
    }

    try {
      setIsWithdrawing(true);
      await paymentService.requestWithdrawal({
        amount,
        bankCode: wallet?.bankDetails?.bankCode || '',
        accountNumber: wallet?.bankDetails?.accountNumber || '',
      });

      showAlert({ title: 'Success', message: 'Withdrawal request submitted', type: 'success' });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadData();
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'Withdrawal failed', type: 'error' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const switchWallet = (type: 'naira' | 'spark') => {
    const index = type === 'naira' ? 0 : 1;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveWallet(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderNairaCard = () => (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[c.primary, c.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Image
          source={{ uri: 'https://www.transparenttextures.com/patterns/carbon-fibre.png' }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.1, tintColor: '#fff' }]}
        />

        <View style={{ position: 'relative', zIndex: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.cardLabel}>Available Balance</Text>
              <Text style={styles.cardCurrency}>Nigerian Naira (NGN)</Text>
            </View>
            <View style={[styles.cardTypeBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <FontAwesome5 name="wallet" size={14} color="#fff" />
              <Text style={styles.cardTypeText}>Cash</Text>
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

        <TouchableOpacity onPress={handleWithdrawPress} style={[styles.cardActionBtn, { backgroundColor: '#fff' }]}>
          <Text style={[styles.cardActionText, { color: '#1E1B4B' }]}>Withdraw Cash</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#1E1B4B" />
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
        <Image
          source={{ uri: 'https://www.transparenttextures.com/patterns/cubes.png' }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.1, tintColor: '#fff' }]}
        />

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
            <Text style={[styles.cardBalance, { marginTop: 0 }]}>
              {sparkBalance.toLocaleString()}
            </Text>
            <MaterialIcons name="bolt" size={32} color="#FBBF24" style={{ marginLeft: 6 }} />
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.sparkAction}
              onPress={async () => {
                const hasPin = await rewardService.checkHasPin();
                if (!hasPin) {
                  Alert.alert(
                    "Set Transaction PIN",
                    "You need to set a 4-digit security PIN before you can transfer Sparks.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Set PIN Now", onPress: () => navigation.navigate('SetTransactionPin') }
                    ]
                  );
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
        <TouchableOpacity onPress={() => navigation.navigate('WithdrawalSetup')}>
          <Ionicons name="settings-outline" size={24} color={c.text} />
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
              <Text style={[styles.switcherText, { color: activeWallet === 'spark' ? c.primary : c.subtext, fontWeight: activeWallet === 'spark' ? '800' : '600' }]}>Spark Wallet</Text>
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
              Haptics.selectionAsync();
            }}
            keyExtractor={(i) => i.toString()}
          />

          {/* Pagination Indicators */}
          <View style={styles.dotsRow}>
            {[0, 1].map((i) => {
              const scale = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [1, 1.5, 1],
                extrapolate: 'clamp'
              });
              const opacity = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp'
              });
              return <Animated.View key={i} style={[styles.dot, { opacity, transform: [{ scale }], backgroundColor: c.primary }]} />;
            })}
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {activeWallet === 'naira' ? 'Recent Activity' : 'Spark History'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SparkHistory')}>
            <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700' }}>See Detailed History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {isLoading ? (
            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 20 }} />
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.slice(0, 10).map((t, index) => {
              const isIncome = t.type === 'income';
              const isPending = t.status === 'pending';
              const color = isPending ? '#F59E0B' : isIncome ? '#10B981' : '#EF4444';

              return (
                <View key={`${t.id}-${index}`} style={[styles.txnItem, { backgroundColor: c.card, borderColor: c.border }]}>
                  <View style={[styles.txnIconCtx, { backgroundColor: isPending ? 'rgba(245,158,11,0.1)' : isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                    {t.kind === 'spark' ? (
                      <MaterialIcons name="bolt" size={24} color={color} />
                    ) : (
                      <MaterialIcons name={isPending ? "access-time" : isIncome ? "call-received" : "call-made"} size={24} color={color} />
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
                      <MaterialIcons name="arrow-upward" size={12} color="#EF4444" style={{ marginRight: 2 }} />
                    )}
                    {t.kind === 'spark' && t.txnType === 'transfer_receive' && (
                      <MaterialIcons name="arrow-downward" size={12} color="#10B981" style={{ marginRight: 2 }} />
                    )}
                    {t.kind === 'spark' && <Text style={{ fontSize: 10, color: c.subtext }}>Sparks</Text>}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCtx, { backgroundColor: c.card }]}>
                <Ionicons name="receipt-outline" size={32} color={c.subtext} />
              </View>
              <Text style={{ color: c.subtext, marginTop: 16, fontWeight: '600' }}>No transactions recorded yet</Text>
              <Text style={{ color: c.subtext, fontSize: 12, marginTop: 4 }}>Your history will appear here once you make a move.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Setup Required Modal */}
      <Modal visible={showSetupModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <MaterialIcons name="account-balance" size={32} color={c.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: c.text }]}>Withdrawal Setup</Text>
            <Text style={[styles.modalBody, { color: c.subtext }]}>
              You have {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.balance || 0)} ready for withdrawal. Please set up your bank details to claim it.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: c.primary }]}
              onPress={() => { setShowSetupModal(false); navigation.navigate('WithdrawalSetup'); }}
            >
              <Text style={styles.modalBtnText}>Set Up My Bank</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setShowSetupModal(false)}>
              <Text style={{ color: c.subtext, fontWeight: '600' }}>I'll do this later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card, width: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text, marginBottom: 0 }]}>Withdraw Cash</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.amountInputCtx, { borderColor: c.border }]}>
              <Text style={[styles.currencySymbol, { color: c.text }]}>₦</Text>
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="0"
                placeholderTextColor={c.subtext}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                autoFocus
              />
            </View>

            <View style={styles.availableCtx}>
              <Text style={{ color: c.subtext, fontSize: 13 }}>Available for withdrawal:</Text>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}> {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.availableBalance || 0)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: c.primary, width: '100%', marginTop: 24 }]}
              onPress={submitWithdrawal}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>Confirm Withdrawal</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: { fontSize: 20, fontWeight: '800' },
  switcherContainer: { paddingHorizontal: 20, marginTop: 20 },
  switcherBg: { flexDirection: 'row', borderRadius: 16, padding: 4, borderWidth: 1 },
  switcherBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  switcherText: { fontSize: 13 },
  cardsContainer: { marginTop: 16, marginBottom: 24 },
  cardWrapper: { width: width, paddingHorizontal: 20 },
  balanceCard: {
    height: 220,
    borderRadius: 32,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  cardCurrency: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  cardTypeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  cardTypeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBalance: { color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 12, letterSpacing: -1 },
  cardMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 16 },
  cardDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' },
  metricValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardActionBtn: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
  },
  cardActionText: { fontWeight: '800', fontSize: 13 },
  cardActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  sparkAction: { flex: 1, alignItems: 'center', gap: 6 },
  sparkActionIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  sparkActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  transactionsList: { paddingHorizontal: 20, gap: 12 },
  txnItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, gap: 16 },
  txnIconCtx: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 15, fontWeight: '700' },
  txnMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  txnDate: { fontSize: 12 },
  txnStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  txnStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  txnAmount: { fontWeight: '900' },
  txnStatus: { fontSize: 11, textTransform: 'capitalize', marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconCtx: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { padding: 28, borderRadius: 36, alignItems: 'center', width: '100%', maxWidth: 380, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 24 },
  closeBtn: { padding: 4 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  modalBody: { textAlign: 'center', marginBottom: 28, lineHeight: 24, fontSize: 16 },
  modalBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  modalBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  amountInputCtx: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 20, paddingHorizontal: 20, width: '100%', height: 70 },
  currencySymbol: { fontSize: 28, fontWeight: '900', marginRight: 10 },
  input: { flex: 1, fontSize: 32, fontWeight: '900' },
  availableCtx: { flexDirection: 'row', marginTop: 12, alignSelf: 'flex-start' }
});

export default WalletScreen;
