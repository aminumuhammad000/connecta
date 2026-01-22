import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import paymentService from '../services/paymentService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useInAppAlert } from '../components/InAppAlert';

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
  };
}

const WalletScreen = () => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as any;
  const { showAlert } = useInAppAlert();

  const [filter, setFilter] = useState<'all' | 'income' | 'withdrawal' | 'pending'>('all');
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
          setShowSetupModal(true);
        }
      }

      const mappedTxns = txnsData.map((t: any) => ({
        id: t._id,
        type: mapTransactionType(t.type, t.status),
        title: t.description,
        date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: t.type === 'withdrawal' ? -t.amount : t.amount,
        status: t.status
      }));
      setTransactions(mappedTxns);
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

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [filter, transactions]);

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
        bankCode: wallet?.bankDetails?.bankCode || '', // Should exist if verified
        accountNumber: wallet?.bankDetails?.accountNumber || '',
      });

      showAlert({ title: 'Success', message: 'Withdrawal request submitted', type: 'success' });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadData(); // Refresh balance
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      showAlert({ title: 'Error', message: error.message || 'Withdrawal failed', type: 'error' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* App Bar */}
      {/* App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: c.text }]}>Wallet</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('WithdrawalSetup')}>
          <MaterialIcons name="add" size={28} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} />}
      >
        {/* Available Balance Card */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View style={[styles.balanceCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/gradient-technological-background_23-2148884155.jpg' }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={10}
            />
            <View style={styles.cardOverlay} />

            <View style={{ position: 'relative', zIndex: 2 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, userSelect: 'auto' as any }}>Available for Withdrawal</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 8 }}>
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: wallet?.currency || 'NGN' }).format(wallet?.availableBalance || 0)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
                Total Balance: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: wallet?.currency || 'NGN' }).format(wallet?.balance || 0)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleWithdrawPress}
              style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                zIndex: 2
              }}
            >
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escrow/Pending Card */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={[styles.escrowCard, { backgroundColor: c.isDark ? '#2C2C2E' : '#E0E7FF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.isDark ? '#3A3A3C' : '#C7D2FE', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="hourglass-top" size={20} color={c.primary} />
              </View>
              <View>
                <Text style={{ color: c.subtext, fontSize: 12 }}>Pending in Escrow</Text>
                <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: wallet?.currency || 'NGN' }).format(wallet?.escrowBalance || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Transaction History</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
          {(['all', 'income', 'withdrawal', 'pending'] as const).map(k => {
            const active = filter === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setFilter(k)}
                style={[
                  styles.filterChip,
                  active ? { backgroundColor: c.primary } : { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? 'white' : c.text }]}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 20 }} />
          ) : filtered.length > 0 ? (
            filtered.map((t, index) => {
              const isIncome = t.type === 'income';
              const isPending = t.status === 'pending';
              const color = isPending ? '#F59E0B' : isIncome ? '#10B981' : '#EF4444';

              return (
                <View key={`${t.id}-${index}`} style={[styles.txnItem, { backgroundColor: c.card, borderColor: c.border }]}>
                  <View style={[styles.txnIconCtx, { backgroundColor: isPending ? 'rgba(245,158,11,0.1)' : isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                    <MaterialIcons
                      name={isPending ? "access-time" : isIncome ? "arrow-downward" : "arrow-upward"}
                      size={20}
                      color={color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txnTitle, { color: c.text }]}>{t.title}</Text>
                    <Text style={[styles.txnDate, { color: c.subtext }]}>{t.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txnAmount, { color }]}>
                      {isIncome ? '+' : ''}{new Intl.NumberFormat('en-NG', { style: 'currency', currency: wallet?.currency || 'NGN' }).format(t.amount)}
                    </Text>
                    <Text style={[styles.txnStatus, { color: c.subtext }]}>{t.status}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <MaterialIcons name="receipt-long" size={48} color={c.subtext} />
              <Text style={{ color: c.subtext, marginTop: 12 }}>No transactions found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Setup Required Modal */}
      <Modal visible={showSetupModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <MaterialIcons name="account-balance" size={32} color="#D97706" />
            </View>
            <Text style={[styles.modalTitle, { color: c.text }]}>Setup Withdrawal</Text>
            <Text style={[styles.modalBody, { color: c.subtext }]}>
              You need to set up your bank details before you can withdraw funds. It only takes a minute!
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: c.primary }]}
              onPress={() => {
                setShowSetupModal(false);
                navigation.navigate('WithdrawalSetup');
              }}
            >
              <Text style={styles.modalBtnText}>Set Up Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={() => setShowSetupModal(false)}
            >
              <Text style={{ color: c.subtext }}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.card, width: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: c.text, marginBottom: 0 }]}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <MaterialIcons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: c.subtext, marginBottom: 8, alignSelf: 'flex-start' }}>Amount</Text>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.text, width: '100%' }]}
              placeholder="0.00"
              placeholderTextColor={c.subtext}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              autoFocus
            />

            <Text style={{ color: c.subtext, fontSize: 12, marginTop: 8, alignSelf: 'flex-start' }}>
              Available: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: wallet?.currency || 'NGN' }).format(wallet?.availableBalance || 0)}
            </Text>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: c.primary, width: '100%', marginTop: 24 }]}
              onPress={submitWithdrawal}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalBtnText}>Submit Request</Text>
              )}
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: { fontSize: 20, fontWeight: '700' },
  balanceCard: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  escrowCard: {
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  txnIconCtx: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnTitle: { fontSize: 15, fontWeight: '600' },
  txnDate: { fontSize: 12 },
  txnAmount: { fontSize: 15, fontWeight: '700' },
  txnStatus: { fontSize: 11, textTransform: 'capitalize' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalBody: { textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  modalBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  }
});

export default WalletScreen;
