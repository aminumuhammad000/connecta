import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import paymentService from '../services/paymentService';

interface Txn {
  id: string;
  type: 'income' | 'withdrawal' | 'pending';
  title: string;
  date: string;
  amount: number; // positive for income, negative for withdrawal, positive pending
}

interface WalletScreenProps { onOpenNotifications?: () => void }

const WalletScreen: React.FC<WalletScreenProps> = ({ onOpenNotifications }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'income' | 'withdrawal' | 'pending'>('all');
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, txnsData] = await Promise.all([
        paymentService.getWalletBalance().catch(() => ({ balance: 0, currency: 'USD' })),
        paymentService.getTransactions().catch(() => []),
      ]);
      setBalance(balanceData.balance);

      // Map API transactions to UI format
      const mappedTxns = txnsData.map(t => ({
        id: t._id,
        type: mapTransactionType(t.type, t.status),
        title: t.description,
        date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: t.type === 'withdrawal' ? -t.amount : t.amount,
        status: t.status
      }));

      setTransactions(mappedTxns);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: c.background }]}>
        <View style={{ width: 48, height: 40 }} />
        <Text style={[styles.title, { color: c.text }]}>Wallet</Text>
        <View style={{ width: 48, height: 40, alignItems: 'flex-end', justifyContent: 'center' }}>
          <TouchableOpacity onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel="Notifications" style={styles.iconBtn}>
            <MaterialIcons name="notifications" size={22} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 + insets.bottom }} refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadWalletData} colors={[c.primary]} />
      }>
        {/* Balance Card */}
        <View style={{ padding: 16 }}>
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ_2zDOQ-YaBz2w09YQ1FseC2TjNrKGrVlPo-93sA1kdurmJcwQMBW03Rqi4eYGb7euLKfeCg9oUwqDCbQaZws_HIKzmxkUygGSnxq_jDauo7Qyfij7xRmCr4ZIYlArs-SMgabqG7Tu4k488zW2H09FlIb-VlkQMn9CtVsMthICTen43vP04kxPngeNQMLC8BCPC2dsrw1gXZtWgA7SXuN05OZQTpUe0ug2H3q0lWjpp4Su4sSjtjyYNgM-9ddBnN4CHRdl2OrxFI' }}
              style={styles.banner}
              resizeMode="cover"
            />
            <View style={{ padding: 16 }}>
              <Text style={{ color: c.subtext, fontSize: 13 }}>Available Balance</Text>
              <Text style={{ color: c.text, fontSize: 28, fontWeight: '800', marginTop: 2 }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: c.primary }]}>
            <Text style={styles.primaryBtnText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.3)' : 'rgba(253,103,48,0.2)' }]}>
            <Text style={[styles.secondaryBtnText, { color: c.primary }]}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Transactions</Text>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {(['all', 'income', 'withdrawal', 'pending'] as const).map(k => {
            const active = filter === k;
            const baseStyle = [styles.filterChip, active ? { backgroundColor: c.isDark ? 'rgba(253,103,48,0.3)' : 'rgba(253,103,48,0.2)' } : { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }];
            return (
              <TouchableOpacity key={k} onPress={() => setFilter(k)} style={baseStyle}>
                <Text style={[styles.filterChipText, { color: active ? c.primary : c.text }]}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Transactions */}
        <View style={{ padding: 16, gap: 8 }}>
          {filtered.length > 0 ? (
            filtered.map(t => {
              const color = t.type === 'income' ? '#22C55E' : t.type === 'withdrawal' ? '#EF4444' : '#F59E0B';
              const bg = t.type === 'income' ? 'rgba(34,197,94,0.12)' : t.type === 'withdrawal' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
              const iconName = t.type === 'income' ? 'arrow-downward' : t.type === 'withdrawal' ? 'arrow-upward' : 'hourglass-top';
              return (
                <View key={t.id} style={[styles.txnRow, { backgroundColor: c.card, borderColor: c.isDark ? '#27272a' : '#E5E7EB' }]}>
                  <View style={[styles.txnIconWrap, { backgroundColor: bg }]}>
                    <MaterialIcons name={iconName as any} size={22} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txnTitle, { color: c.text }]}>{t.title}</Text>
                    <Text style={[styles.txnDate, { color: c.subtext }]}>{t.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txnAmount, { color }]}>{t.amount > 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}</Text>
                    <Text style={[styles.txnStatus, { color: c.subtext }]}>{t.status === 'pending' ? 'Pending' : 'Completed'}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', color: c.subtext, marginTop: 20 }}>No transactions found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: { fontSize: 18, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  banner: { width: '100%', aspectRatio: 2, backgroundColor: '#ddd' },

  primaryBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterChip: { height: 32, borderRadius: 999, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  filterChipText: { fontSize: 13, fontWeight: '600' },

  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  txnIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 14, fontWeight: '700' },
  txnDate: { fontSize: 12 },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  txnStatus: { fontSize: 11, marginTop: 2 },
});

export default WalletScreen;
