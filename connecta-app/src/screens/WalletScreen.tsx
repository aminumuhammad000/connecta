import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import paymentService from '../services/paymentService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useInAppAlert } from '../components/InAppAlert';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [walletData, txnsData] = await Promise.all([
        paymentService.getWalletBalance().catch(() => null),
        paymentService.getTransactions().catch(() => []),
      ]);

      if (walletData) {
        setWallet(walletData);
        if (!walletData.isVerified && !walletData.bankDetails) {
          if (walletData.balance > 0) setShowSetupModal(true);
        }
      }

      const mappedTxns = txnsData.map((t: any) => ({
        id: t._id,
        type: mapTransactionType(t.type, t.status),
        title: t.description,
        date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: t.type === 'withdrawal' ? -t.amount : t.amount,
        status: t.status,
        rawDate: new Date(t.createdAt)
      }));

      setTransactions(mappedTxns.sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime()));

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
    if (status === 'pending' && type === 'payment_received') return 'escrow';
    if (status === 'pending') return 'pending';
    if (type === 'withdrawal') return 'withdrawal';
    if (type === 'payment_sent') return 'withdrawal';
    return 'income';
  };

  const handleWithdrawPress = () => {
    if (!wallet?.bankDetails?.accountNumber) {
      // No bank saved — send to setup screen
      setShowSetupModal(true);
    } else if ((wallet?.availableBalance || 0) <= 0) {
      showAlert({ title: 'No Available Balance', message: 'You have no funds available to withdraw.', type: 'error' });
    } else {
      setShowWithdrawModal(true);
    }
  };

  const submitWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert({ title: 'Invalid Amount', message: 'Please enter a valid amount.', type: 'error' });
      return;
    }
    if (amount < 100) {
      showAlert({ title: 'Too Low', message: 'Minimum payout is ₦100.', type: 'error' });
      return;
    }
    if (amount > (wallet?.availableBalance || 0)) {
      showAlert({ title: 'Insufficient Funds', message: 'Amount exceeds your available balance.', type: 'error' });
      return;
    }

    try {
      setIsWithdrawing(true);
      await paymentService.requestVTStackPayout(amount);
      showAlert({ title: '✅ Payout Initiated', message: 'Your funds are on the way to your bank account.', type: 'success' });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadData();
    } catch (error: any) {
      showAlert({ title: 'Payout Failed', message: error.message || 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const renderNairaCard = () => (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[c.primary, c.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={{ position: 'relative', zIndex: 2, flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.cardLabel}>Available Balance</Text>
              <Text style={styles.cardCurrency}>Nigerian Naira (NGN)</Text>
            </View>
            <TouchableOpacity 
              onPress={handleWithdrawPress}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
            >
              <MaterialIcons name="south-west" size={14} color={c.primary} />
              <Text style={{ color: c.primary, fontSize: 11, fontWeight: '800' }}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardBalance}>
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.availableBalance || 0)}
          </Text>

          <View style={styles.cardMetrics}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricLabel}>Total Balance</Text>
              <Text style={styles.metricValue}>
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(wallet?.balance || 0)}
              </Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={{ flex: 1 }}>
              <Text style={styles.metricLabel}>In Escrow</Text>
              <Text style={styles.metricValue}>
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(wallet?.escrowBalance || 0)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: c.text }]}>My Wallet</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('WithdrawalSetup')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
        >
          <MaterialIcons name="account-balance" size={18} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>Bank</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} />}
      >
        <View style={[styles.cardsContainer, { marginTop: 24 }]}>
           {renderNairaCard()}
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Activity</Text>
        </View>

        <View style={styles.transactionsList}>
          {isLoading ? (
            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 20 }} />
          ) : transactions.length > 0 ? (
            transactions.slice(0, 20).map((t, index) => {
              const isIncome  = t.type === 'income';
              const isEscrow  = t.type === 'escrow';
              const isPending = t.status === 'pending' && !isEscrow;
              const isOut     = t.type === 'withdrawal';
              const color = isEscrow ? '#F59E0B' : isPending ? '#94A3B8' : isIncome ? '#10B981' : '#EF4444';
              const iconName  = isEscrow ? 'lock' : isPending ? 'access-time' : isIncome ? 'call-received' : 'call-made';
              const bgColor   = isEscrow
                ? 'rgba(245,158,11,0.1)'
                : isPending ? 'rgba(148,163,184,0.1)'
                : isIncome ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)';
              const label     = isEscrow ? 'In Escrow' : t.status;

              return (
                <View key={`${t.id}-${index}`} style={[styles.txnItem, { backgroundColor: c.card, borderColor: c.border }]}>
                  <View style={[styles.txnIconCtx, { backgroundColor: bgColor }]}>
                    <MaterialIcons name={iconName as any} size={24} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txnTitle, { color: c.text }]} numberOfLines={1}>{t.title}</Text>
                    <View style={styles.txnMeta}>
                      <Text style={[styles.txnDate, { color: c.subtext }]}>{t.date}</Text>
                      <View style={[styles.txnStatusBadge, { backgroundColor: isEscrow ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text style={[styles.txnStatusText, { color: isEscrow ? '#F59E0B' : c.subtext }]}>{label}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txnAmount, { color, fontSize: 16 }]}>
                      {isIncome ? '+' : isOut ? '-' : isEscrow ? '🔒' : ''}
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(Math.abs(t.amount))}
                    </Text>
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
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showSetupModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <MaterialIcons name="account-balance" size={32} color={c.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: c.text }]}>Withdrawal Setup</Text>
            <Text style={[styles.modalBody, { color: c.subtext }]}>
              Please set up your bank details to enable withdrawals.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#FD6730', width: '100%' }]}
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

      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card, width: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <MaterialIcons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            {/* Amount input */}
            <View style={[styles.amountInputCtx, { borderColor: c.border }]}>
              <Text style={[styles.currencySymbol, { color: c.text }]}>₦</Text>
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="0"
                placeholderTextColor={c.subtext}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            {/* Available balance hint */}
            <Text style={{ color: c.subtext, fontSize: 12, marginTop: 8, alignSelf: 'flex-end' }}>
              Available: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(wallet?.availableBalance || 0)}
            </Text>

            {/* Fee breakdown */}
            {parseFloat(withdrawAmount) > 0 && !isNaN(parseFloat(withdrawAmount)) && (
              <View style={{ width: '100%', backgroundColor: c.isDark ? '#1F2937' : '#F3F4F6', padding: 14, borderRadius: 14, marginTop: 14, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.subtext, fontSize: 13 }}>Processing Fee</Text>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}>
                    ₦{(parseFloat(withdrawAmount) < 5000 ? 10 : 50).toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.subtext, fontSize: 13 }}>You'll receive</Text>
                  <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 14 }}>
                    ₦{Math.max(0, parseFloat(withdrawAmount) - (parseFloat(withdrawAmount) < 5000 ? 10 : 50)).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Bank destination */}
            {wallet?.bankDetails && (
              <View style={{ width: '100%', backgroundColor: c.isDark ? '#1F2937' : '#F3F4F6', padding: 16, borderRadius: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: c.primary + '20', padding: 8, borderRadius: 10 }}>
                  <MaterialIcons name="account-balance" size={20} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sending to</Text>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>{wallet.bankDetails.bankName}</Text>
                  <Text style={{ color: c.subtext, fontSize: 12 }}>{wallet.bankDetails.accountNumber} • {wallet.bankDetails.accountName}</Text>
                </View>
              </View>
            )}

            {/* VTStack badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, opacity: 0.6 }}>
              <MaterialIcons name="lock" size={12} color={c.subtext} />
              <Text style={{ color: c.subtext, fontSize: 11 }}>Secured by VTStack · HMAC-SHA256</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: c.primary, width: '100%', marginTop: 16,
                  opacity: isWithdrawing || !parseFloat(withdrawAmount) ? 0.6 : 1 }
              ]}
              onPress={submitWithdrawal}
              disabled={isWithdrawing || !parseFloat(withdrawAmount)}
            >
              {isWithdrawing
                ? <ActivityIndicator color="white" />
                : <Text style={styles.modalBtnText}>Confirm Payout</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  screenTitle: { fontSize: 20, fontWeight: '800' },
  cardsContainer: { marginTop: 16, marginBottom: 24 },
  cardWrapper: { width: width, paddingHorizontal: 20 },
  balanceCard: { height: 220, borderRadius: 32, overflow: 'hidden', padding: 24, justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 15 },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  cardCurrency: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  cardTypeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  cardTypeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBalance: { color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 12, letterSpacing: -1 },
  cardMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 16 },
  cardDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' },
  metricValue: { color: '#fff', fontSize: 15, fontWeight: '700' },

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
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconCtx: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { padding: 28, borderRadius: 36, alignItems: 'center', width: '100%', maxWidth: 380, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  modalBody: { textAlign: 'center', marginBottom: 28, lineHeight: 24, fontSize: 16 },
  modalBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  modalBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  amountInputCtx: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 20, paddingHorizontal: 20, width: '100%', height: 70 },
  currencySymbol: { fontSize: 28, fontWeight: '900', marginRight: 10 },
  input: { flex: 1, fontSize: 32, fontWeight: '900' },
});

export default WalletScreen;
