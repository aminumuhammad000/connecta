import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as paymentService from '../services/paymentService';
import { Payment, WalletBalance } from '../types';

interface TxnItem {
  id: string;
  who: string;
  purpose: string;
  date: string;
  amount: string;
  rawAmount: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  avatar: string;
  projectId?: string;
  payeeId?: string;
  payeeFirstName?: string;
  projectTitle?: string;
}

const ClientPaymentsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [q, setQ] = useState('');
  const [range, setRange] = useState('Last 30 Days');
  const [filter, setFilter] = useState<'Completed' | 'Pending' | 'All'>('All');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [paymentsData, walletData] = await Promise.all([
        paymentService.getPaymentHistory(),
        paymentService.getWalletBalance()
      ]);
      setPayments(paymentsData);
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const mappedTransactions: TxnItem[] = useMemo(() => {
    return payments.map(p => {
      const payee = p.freelancerId as any; // Populated
      const project = p.projectId as any; // Populated
      return {
        id: p._id,
        who: payee ? `Paid to ${payee.firstName} ${payee.lastName}` : 'Payment',
        purpose: project ? `For: ${project.title}` : 'Project Payment',
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: `$${p.amount.toLocaleString()}`,
        rawAmount: p.amount,
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1) as any,
        avatar: payee?.profileImage || `https://ui-avatars.com/api/?name=${payee?.firstName}+${payee?.lastName}&background=random`,
        // Pass through IDs needed for PaymentScreen
        projectId: (project?._id || p.projectId) as string,
        payeeId: (payee?._id || p.freelancerId) as string,
        payeeFirstName: payee ? `${payee.firstName} ${payee.lastName || ''}`.trim() : undefined,
        projectTitle: project?.title,
      };
    });
  }, [payments]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return mappedTransactions.filter(t => (filter === 'All' || t.status === filter) && (
      !s || t.who.toLowerCase().includes(s) || t.purpose.toLowerCase().includes(s)
    ));
  }, [mappedTransactions, q, filter]);

  const handleTransactionClick = (t: TxnItem) => {
    if (t.status === 'Pending') {
      if (!t.projectId || !t.payeeId) {
        // Fallback: can't resume payment without required fields — show info
        alert('This payment cannot be resumed. Please contact support.');
        return;
      }
      navigation.navigate('Payment', {
        amount: t.rawAmount,
        projectId: t.projectId,
        payeeId: t.payeeId,
        projectTitle: t.projectTitle || t.purpose,
        freelancerId: t.payeeId,
        freelancerName: t.payeeFirstName || 'Freelancer',
        paymentType: 'project_payment'
      });
    } else {
      // For completed/other, maybe show details or invoice
      // navigation.navigate('PaymentDetails', { id: t.id });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: c.text }]}>Payment History</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {/* Search & Filter Section */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
            <View style={[styles.searchWrap, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginBottom: 12 }]}>
              <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search transactions..."
                placeholderTextColor={c.subtext}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label={range} active onPress={() => setRange(range)} />
              <Chip label="Completed" active={filter === 'Completed'} onPress={() => setFilter(filter === 'Completed' ? 'All' : 'Completed')} />
              <Chip label="Pending" active={filter === 'Pending'} onPress={() => setFilter(filter === 'Pending' ? 'All' : 'Pending')} />
            </ScrollView>
          </View>

          {/* Stats Section */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.statCard, { backgroundColor: c.card, flex: 1, borderColor: c.border, borderWidth: 1 }]}>
                <View style={[styles.iconBox, { backgroundColor: c.primary + '15' }]}>
                  <MaterialIcons name="account-balance-wallet" size={20} color={c.primary} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: c.text }]}>
                    ${wallet?.totalSpent?.toLocaleString() || '0.00'}
                  </Text>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Total Spent</Text>
                </View>
              </View>
              <View style={[styles.statCard, { backgroundColor: c.card, flex: 1, borderColor: c.border, borderWidth: 1 }]}>
                <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                  <MaterialIcons name="savings" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: c.text }]}>
                    ${wallet?.availableBalance?.toLocaleString() || '0.00'}
                  </Text>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Balance</Text>
                </View>
              </View>
            </View>

            <View style={[styles.statCardWide, { backgroundColor: c.card, marginTop: 12, borderColor: c.border, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
                  <MaterialIcons name="pending" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Escrow (Pending)</Text>
                  <Text style={[styles.statValue, { color: c.text, fontSize: 18 }]}>
                    ${wallet?.escrowBalance?.toLocaleString() || '0.00'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={c.subtext} />
            </View>
          </View>

          {/* Transactions List */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 12 }]}>Recent Transactions</Text>

            <View style={{ gap: 12 }}>
              {filtered.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <MaterialIcons name="receipt-long" size={48} color={c.border} />
                  <Text style={{ textAlign: 'center', color: c.subtext, marginTop: 12 }}>No transactions found</Text>
                </View>
              ) : (
                filtered.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}
                    onPress={() => handleTransactionClick(t)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Image source={{ uri: t.avatar }} style={styles.avatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.txnTitle, { color: c.text }]} numberOfLines={1}>{t.who}</Text>
                        <Text style={{ color: c.subtext, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{t.purpose}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.amount, { color: t.status === 'Completed' ? c.text : c.subtext }]}>{t.amount}</Text>
                        <Text style={{ fontSize: 11, color: pillStyle(t.status).color, fontWeight: '600', marginTop: 2 }}>{t.status}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
                      <Text style={{ fontSize: 12, color: c.subtext }}>{t.date}</Text>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        onPress={() => handleTransactionClick(t)}
                      >
                        <Text style={{ color: c.primary, fontSize: 12, fontWeight: '600' }}>
                          {t.status === 'Pending' ? 'Pay Now' : 'Invoice'}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={14} color={c.primary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1, marginTop: 24 }]}>
              <MaterialIcons name="download" size={20} color={c.text} />
              <Text style={[styles.downloadText, { color: c.text }]}>Download Full Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
      </View>
    </SafeAreaView>
  );
};

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const c = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: active ? c.primary + '33' : (c.isDark ? '#111827' : '#F3F4F6') }]}>
      <Text style={[styles.chipText, { color: active ? c.primary : c.subtext }]}>{label}</Text>
      <MaterialIcons name="expand-more" size={18} color={active ? c.primary : c.subtext} />
    </TouchableOpacity>
  );
}

function pillStyle(status: string) {
  if (status === 'Completed') return { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' };
  if (status === 'Pending') return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#ca8a04' };
  if (status === 'Failed') return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' };
  return { backgroundColor: 'rgba(107,114,128,0.12)', color: '#6b7280' };
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  appBarTitle: { fontSize: 18, fontWeight: '800' },
  statCard: { borderRadius: 12, padding: 12 },
  statCardWide: { borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800' },
  searchWrap: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, fontSize: 18, fontWeight: '800' },
  card: { borderRadius: 12, padding: 12 },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#ddd' },
  txnTitle: { fontSize: 14, fontWeight: '800' },
  amount: { fontSize: 16, fontWeight: '800' },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  downloadBtn: { marginTop: 8, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  downloadText: { fontSize: 14, fontWeight: '700' },
  chip: { height: 40, borderRadius: 999, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});

export default ClientPaymentsScreen;
