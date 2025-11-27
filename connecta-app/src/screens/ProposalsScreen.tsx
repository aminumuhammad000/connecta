import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import proposalService from '../services/proposalService';

interface Proposal {
  id: string;
  title: string;
  name: string;
  avatar: string;
  price: string;
  time: string;
  status: 'accepted' | 'pending' | 'rejected';
}

interface ProposalsScreenProps { onOpenNotifications?: () => void }

const ProposalsScreen: React.FC<ProposalsScreenProps> = ({ onOpenNotifications }) => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [tab, setTab] = useState<'mine' | 'received'>('mine');
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, [tab]);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      let data = [];
      if (tab === 'mine') {
        // Assuming current user is freelancer for 'mine' tab, or client viewing their sent proposals (if applicable)
        // For now, let's use getAllProposals as a placeholder or specific endpoint if available
        data = await proposalService.getAllProposals().catch(() => []);
      } else {
        // 'received' tab - likely for clients viewing proposals on their jobs
        data = await proposalService.getAcceptedProposals().catch(() => []); // This might need a different endpoint for all received
      }

      // Map API data to UI format
      const mapped = data.map((p: any) => ({
        id: p._id,
        title: p.jobTitle || 'Untitled Job',
        name: p.freelancerName || 'Unknown Freelancer',
        avatar: p.freelancerAvatar || 'https://via.placeholder.com/150',
        price: `$${p.proposedRate}`,
        time: p.estimatedDuration,
        status: p.status,
      }));
      setProposals(mapped);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return proposals.filter(d =>
      (filter === 'all' || d.status === filter) &&
      (t.length === 0 || d.title.toLowerCase().includes(t) || d.name.toLowerCase().includes(t))
    );
  }, [q, filter, proposals]);

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
      <View style={[styles.appBar, { backgroundColor: c.background, borderBottomColor: c.border }]}>
        <View style={{ width: 48, height: 40, alignItems: 'flex-start', justifyContent: 'center' }}>
          <MaterialIcons name="menu" size={24} color={c.text} />
        </View>
        <Text style={[styles.appBarTitle, { color: c.text }]}>Proposals</Text>
        <View style={{ width: 72, height: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('MyProposals')} accessibilityRole="button" accessibilityLabel="Open My Proposals" style={{ padding: 6 }}>
            <MaterialIcons name="tune" size={22} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel="Open notifications" style={{ padding: 6 }}>
            <MaterialIcons name="notifications" size={22} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={[styles.searchWrap, { backgroundColor: c.isDark ? '#1F2937' : '#FFFFFF' }]}>
          <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginLeft: 12, marginRight: 6 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by job or name"
            placeholderTextColor={c.subtext}
            style={[styles.searchInput, { color: c.text }]}
          />
        </View>
      </View>

      {/* Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} style={{ flexGrow: 0 }}>
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(key => {
          const active = filter === key;
          return (
            <TouchableOpacity key={key} onPress={() => setFilter(key)} style={[styles.chip, active ? { backgroundColor: c.isDark ? 'rgba(253,103,48,0.3)' : 'rgba(253,103,48,0.2)' } : { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }]}>
              <Text style={[styles.chipLabel, { color: active ? c.primary : c.text }]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tabs */}
      <View style={{ paddingTop: 12 }}>
        <View style={[styles.tabsBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => setTab('mine')} style={[styles.tabItem, tab === 'mine' ? { borderBottomColor: c.primary } : { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.tabText, { color: tab === 'mine' ? c.primary : c.subtext }]}>My Proposals</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('received')} style={[styles.tabItem, tab === 'received' ? { borderBottomColor: c.primary } : { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.tabText, { color: tab === 'received' ? c.primary : c.subtext }]}>Received Proposals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 + Math.max(insets.bottom, 0), gap: 12 }}>
        {filtered.length > 0 ? (
          filtered.map(p => (
            <View key={p.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Image source={{ uri: p.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: c.subtext }]}>{p.name}</Text>
                  </View>
                </View>
                <View style={[styles.status, p.status === 'accepted' ? { backgroundColor: 'rgba(34,197,94,0.2)' } : p.status === 'pending' ? { backgroundColor: 'rgba(245,158,11,0.2)' } : { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
                  <Text style={[styles.statusText, p.status === 'accepted' ? { color: '#22C55E' } : p.status === 'pending' ? { color: '#F59E0B' } : { color: '#EF4444' }]}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 8 }} />
              <View style={styles.cardFooter}>
                <View>
                  <Text style={[styles.meta, { color: c.subtext }]}>Submitted: Oct 26</Text>
                  <Text style={[styles.price, { color: c.text }]}>{p.price} <Text style={{ color: c.subtext }}>/ {p.time}</Text></Text>
                </View>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('ProposalDetail', { id: p.id })}
                  style={[styles.cta, { backgroundColor: p.status === 'accepted' ? c.primary : c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}
                >
                  <Text style={[styles.ctaText, { color: p.status === 'accepted' ? '#fff' : c.text }]}>{p.status === 'accepted' ? 'Message' : 'View Details'}</Text>
                  <MaterialIcons name={p.status === 'accepted' ? 'send' : 'arrow-forward'} size={18} color={p.status === 'accepted' ? '#fff' : c.text} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: c.subtext, marginTop: 20 }}>No proposals found</Text>
        )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  chip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 11, fontWeight: '400' },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 12 },
  price: { fontSize: 13, fontWeight: '600' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10 },
  ctaText: { fontSize: 12, fontWeight: '600' },
});

export default ProposalsScreen;
