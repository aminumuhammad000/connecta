import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const route = useRoute<any>();
  const { jobId } = route.params || {};

  useEffect(() => {
    loadProposals();
  }, [jobId]);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      let data = [];

      if (jobId) {
        data = await proposalService.getProposalsByJobId(jobId).catch(() => []);
      } else {
        data = await proposalService.getAllProposals().catch(() => []);
      }

      // Map API data to UI format
      const mapped = data.filter((p: any) => p !== null).map((p: any) => {
        const freelancer = p.freelancerId;
        
        return {
          id: p._id,
          title: p.jobId?.title || p.title || 'Untitled Job',
          name: freelancer && typeof freelancer === 'object' && freelancer.firstName ? `${freelancer.firstName} ${freelancer.lastName}` : 'Unknown Freelancer',
          avatar: freelancer && typeof freelancer === 'object' ? freelancer?.profileImage : 'https://via.placeholder.com/150',
          price: `₦${p.price || p.proposedRate || 0}`,
          time: p.deliveryTime || p.estimatedDuration || 'No time set',
          status: p.status,
        };
      });
      setProposals(mapped);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return proposals.filter(d => filter === 'all' || d.status === filter);
  }, [filter, proposals]);

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
        <TouchableOpacity style={{ width: 48, height: 40, alignItems: 'flex-start', justifyContent: 'center' }} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: c.text, flex: 1, textAlign: 'center' }]}>Received Proposals</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 12, paddingBottom: 12 }}
        style={{ flexGrow: 0 }}
      >
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip, 
                { 
                  backgroundColor: active ? c.primary : c.card,
                  borderColor: active ? c.primary : c.border,
                  borderWidth: 1
                }
              ]}
            >
              <Text style={[styles.filterChipText, { color: active ? '#fff' : c.text }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 + Math.max(insets.bottom, 0), gap: 16, flexDirection: width > 768 ? 'row' : 'column', flexWrap: 'wrap' }}>
        {filtered.length > 0 ? (
          filtered.map(p => (
            <TouchableOpacity 
              key={p.id} 
              onPress={() => (navigation as any).navigate('ProposalDetail', { id: p.id })}
              activeOpacity={0.7}
              style={[
                styles.card, 
                { backgroundColor: c.card, borderColor: c.border },
                width > 768 ? { width: '48.5%' } : { width: '100%' }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.headerLeft, { flex: 1, marginRight: 8 }]}>
                  <Image source={{ uri: p.avatar }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: c.subtext }]}>{p.name}</Text>
                  </View>
                </View>
                <View style={[styles.status, { flexShrink: 0 }, p.status === 'accepted' ? { backgroundColor: 'rgba(34,197,94,0.15)' } : p.status === 'pending' ? { backgroundColor: 'rgba(253,103,48,0.15)' } : { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                  <Text style={[styles.statusText, p.status === 'accepted' ? { color: '#22C55E' } : p.status === 'pending' ? { color: c.primary } : { color: '#EF4444' }]}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={{ height: 1.5, backgroundColor: c.border, marginVertical: 12, opacity: 0.5 }} />
              <View style={styles.cardFooter}>
                <View>
                  <Text style={[styles.meta, { color: c.subtext }]}>Proposed Rate</Text>
                  <Text style={[styles.price, { color: c.text }]}>{p.price} <Text style={{ color: c.subtext, fontWeight: '400', fontSize: 12 }}>({p.time})</Text></Text>
                </View>
                <View style={[styles.cta, { backgroundColor: c.primary }]}>
                  <Text style={[styles.ctaText, { color: '#fff' }]}>View Details</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
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
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 12 },
  price: { fontSize: 13, fontWeight: '600' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10 },
  ctaText: { fontSize: 12, fontWeight: '600' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProposalsScreen;
