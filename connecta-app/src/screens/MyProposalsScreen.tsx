import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import proposalService from '../services/proposalService';

interface ProposalCard {
  id: string;
  title: string;
  company: string;
  status: 'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'viewed';
  submitted: string;
}

const MyProposalsScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tab, setTab] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'>('all');
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      if (!user?._id) return;

      // Fetch proposals for the current user (freelancer)
      const data = await proposalService.getFreelancerProposals(user._id).catch(() => []);

      // Map API data to UI format
      const mapped = data.filter((p: any) => p).map((p: any) => ({
        id: p._id,
        title: p.jobId?.title || p.title || 'Untitled Job',
        company: p.jobId?.company || (p.clientId ? (p.clientId.firstName + ' ' + p.clientId.lastName) : 'Unknown Client'),
        status: p.status,
        submitted: `Submitted ${new Date(p.createdAt).toLocaleDateString()}`,
        isExternal: p.jobId?.isExternal || false,
        source: p.jobId?.source || null,
      }));
      setProposals(mapped);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (tab === 'all') return proposals;
    return proposals.filter(d => d.status === tab);
  }, [tab, proposals]);



  const statusPill = (s: ProposalCard['status']) => {
    switch (s) {
      case 'accepted':
        return { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Accepted' };
      case 'pending':
        return { bg: c.isDark ? 'rgba(253,103,48,0.25)' : 'rgba(253,103,48,0.2)', text: c.primary, label: 'Pending' };
      case 'rejected':
        return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Rejected' };
      case 'withdrawn':
        return { bg: 'rgba(107,114,128,0.15)', text: '#6B7280', label: 'Withdrawn' };
      case 'viewed':
        return { bg: c.isDark ? 'rgba(253,103,48,0.25)' : 'rgba(253,103,48,0.2)', text: c.primary, label: 'Client Viewed' };
      default:
        return { bg: 'transparent', text: c.subtext, label: '' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.appIcon} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: c.text }]}>My Proposals</Text>
        <TouchableOpacity style={styles.appIcon} accessibilityRole="button" accessibilityLabel="Filters">
          <MaterialIcons name="tune" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {(['all', 'pending', 'accepted', 'rejected', 'withdrawn'] as const).map(k => {
            const isActive = tab === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setTab(k)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: isActive ? c.primary : c.border,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isActive ? '#FFF' : c.text,
                  textTransform: 'capitalize'
                }}>
                  {k}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <View style={{ flex: 1, maxWidth: isDesktop ? '100%' : 800, alignSelf: 'center', width: '100%' }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12, flexDirection: isDesktop ? 'row' : 'column', flexWrap: isDesktop ? 'wrap' : 'nowrap' }}>
          {filtered.length > 0 ? (
            filtered.map(p => {
              const pill = statusPill(p.status);
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => (navigation as any).navigate('ProposalDetail', { id: p.id })}
                  style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, isDesktop && { width: '48%' }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                        {p.isExternal ? (
                          <Badge label={p.source || "External"} variant="info" size="small" />
                        ) : (
                          <Badge label="Connecta" variant="success" size="small" />
                        )}
                      </View>
                      <Text style={{ color: c.subtext, fontSize: 12 }}>{p.company}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                      <Text style={[styles.pillText, { color: pill.text }]}>{pill.label}</Text>
                    </View>
                    <Text style={{ color: c.subtext, fontSize: 11 }}>{p.submitted}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', color: c.subtext, marginTop: 20 }}>No proposals found</Text>
          )}
        )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appIcon: { width: 48, height: 40, alignItems: 'center', justifyContent: 'center' },
  appTitle: { fontSize: 18, fontWeight: '700' },

  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardFooter: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
});

export default MyProposalsScreen;
