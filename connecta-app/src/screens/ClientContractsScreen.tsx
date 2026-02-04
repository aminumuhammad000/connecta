import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import contractService from '../services/contractService';
import { Contract } from '../services/contractService';

interface ContractItem {
  id: string;
  title: string;
  party: string;
  start?: string;
  end?: string;
  sentDate?: string;
  expires?: string;
  status: 'Active' | 'Pending' | 'Completed';
}

const TABS: Array<'Active' | 'Pending' | 'Completed'> = ['Active', 'Pending', 'Completed'];

const ClientContractsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'Active' | 'Pending' | 'Completed'>('Active');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await contractService.getContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadContracts();
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const mapStatus = (status: string): 'Active' | 'Pending' | 'Completed' => {
    if (status === 'active') return 'Active';
    if (status === 'pending') return 'Pending';
    return 'Completed';
  };

  const filtered = useMemo(() => {
    if (tab === 'Completed') return contracts.filter((x: any) => x.status === 'completed');
    if (tab === 'Pending') return contracts.filter((x: any) => x.status === 'pending');
    return contracts.filter((x: any) => x.status === 'active');
  }, [contracts, tab]);

  const activeCount = contracts.filter((x: any) => x.status === 'active').length;
  const pendingCount = contracts.filter((x: any) => x.status === 'pending').length;

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
        <View style={[styles.appBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <MaterialIcons name="arrow-back-ios-new" size={20} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: c.text }]}>Contracts</Text>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Search">
            <MaterialIcons name="search" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          <View style={[styles.tabsRow, { borderBottomColor: c.border }]}>
            {TABS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
                <Text style={[styles.tabText, { color: tab === t ? c.primary : c.subtext, fontWeight: tab === t ? '800' : '600', borderBottomColor: tab === t ? c.primary : 'transparent', borderBottomWidth: 2, paddingBottom: 10 }]}>
                  {t}{t === 'Active' ? ` (${activeCount})` : t === 'Pending' ? ` (${pendingCount})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: 16, gap: 12 }}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <MaterialIcons name="description" size={64} color={c.subtext} />
                <Text style={{ color: c.text, fontSize: 18, marginTop: 16 }}>No contracts found</Text>
                <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8 }}>Your {tab.toLowerCase()} contracts will appear here</Text>
              </View>
            ) : (
              filtered.map((item: any) => (
                <View key={item._id} style={[styles.card, { backgroundColor: c.isDark ? '#1E1E1E' : '#F3F4F6', borderColor: c.border }]}>
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
                      <Text style={{ color: c.subtext, fontSize: 12 }}>Client: {item.client?.firstName || 'N/A'} {item.client?.lastName || ''}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.pill, pillStyle(mapStatus(item.status))]}>
                        <Text style={[styles.pillText, { color: pillStyle(mapStatus(item.status)).color }]}>{mapStatus(item.status)}</Text>
                      </View>
                    </View>
                  </View>

                  {item.status === 'pending' ? (
                    <View style={styles.metaRow}>
                      <View>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>Sent Date</Text>
                        <Text style={[styles.metaValue, { color: c.text }]}>{formatDate(item.sentDate)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>Expires</Text>
                        <Text style={[styles.metaValue, { color: c.text }]}>{formatDate(item.expiresDate)}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.metaRow}>
                      <View>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>Start Date</Text>
                        <Text style={[styles.metaValue, { color: c.text }]}>{formatDate(item.startDate)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>End Date</Text>
                        <Text style={[styles.metaValue, { color: c.text }]}>{formatDate(item.endDate)}</Text>
                      </View>
                    </View>
                  )}

                  {item.status === 'Pending' ? (
                    <TouchableOpacity style={[styles.signBtn, { backgroundColor: '#FD6730' }]}>
                      <Text style={styles.signText}>Sign Contract</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => navigation.navigate('JobDetail')}>
                        <Text style={[styles.secondaryText, { color: c.text }]}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.terminateBtn}>
                        <Text style={styles.terminateText}>Terminate</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

function pillStyle(status: ContractItem['status']) {
  if (status === 'Active') return { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' };
  if (status === 'Pending') return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#ca8a04' };
  return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb' };
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  appBarTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14 },
  card: { borderRadius: 16, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 },
  metaValue: { fontSize: 13, fontWeight: '700' },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  secondaryBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  secondaryText: { fontSize: 13, fontWeight: '700' },
  terminateBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  terminateText: { fontSize: 13, fontWeight: '700', color: '#ef4444' },
  signBtn: { marginTop: 8, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  signText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

export default ClientContractsScreen;
