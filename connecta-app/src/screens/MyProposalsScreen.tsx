import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions, Image } from 'react-native';
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
  const navigation = useNavigation<any>();
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
      const mapped = data.filter((p: any) => p).map((p: any) => {
        const client = p.clientId || p.jobId?.clientId;
        const clientName = (client && typeof client === 'object' && client.firstName) 
          ? `${client.firstName} ${client.lastName}` 
          : 'Unknown Client';
        const clientAvatar = (client && typeof client === 'object') ? client.profileImage : null;
          
        return {
          id: p._id,
          title: p.jobId?.title || p.title || 'Untitled Job',
          company: p.jobId?.company || clientName,
          avatar: clientAvatar,
          status: p.status,
          submitted: new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          price: p.price || p.budget?.amount || 0,
          duration: p.deliveryTime || 0,
          isExternal: p.jobId?.isExternal || false,
          source: p.jobId?.source || null,
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
        <View style={styles.appIcon} />
      </View>

      <View style={{ height: 16 }} />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
        {(['all', 'pending', 'accepted'] as const).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 2,
                borderBottomColor: active ? c.primary : 'transparent',
                marginRight: 8
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: active ? '700' : '500', 
                color: active ? c.primary : c.subtext,
                textTransform: 'capitalize'
              }}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
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
                  activeOpacity={0.7}
                  style={[
                    styles.card,
                    { backgroundColor: c.card, borderColor: c.border },
                    isDesktop ? { width: '31%', marginBottom: 16 } : { width: '100%', marginBottom: 12 }
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text numberOfLines={1} style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                        {p.isExternal && (
                          <Badge label={p.source || "External"} variant="neutral" size="small" />
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {p.avatar ? (
                          <Image source={{ uri: p.avatar }} style={{ width: 22, height: 22, borderRadius: 11 }} />
                        ) : (
                          <MaterialIcons name="account-circle" size={22} color={c.subtext} />
                        )}
                        <Text style={{ color: c.subtext, fontSize: 13, fontWeight: '500' }}>{p.company}</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={c.subtext} />
                  </View>

                  <View style={{ height: 1, backgroundColor: c.border, marginVertical: 12, opacity: 0.5 }} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View style={{ gap: 4 }}>
                      <Text style={{ color: c.subtext, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>Proposed Rate</Text>
                      <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>₦{p.price.toLocaleString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                        <Text style={[styles.pillText, { color: pill.text }]}>{pill.label}</Text>
                      </View>
                      <Text style={{ color: c.subtext, fontSize: 11 }}>{p.submitted}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60, width: '100%' }}>
              <MaterialIcons name="assignment-late" size={64} color={c.subtext} />
              <Text style={{ color: c.text, fontSize: 18, marginTop: 16, fontWeight: '700' }}>
                No Proposals Yet
              </Text>
              <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                You haven't submitted any proposals yet.{'\n'}Start applying to jobs to see them here.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MatchingJobs' as any)}
                style={{
                  marginTop: 24,
                  backgroundColor: c.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <MaterialIcons name="search" size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>
                  Find Jobs
                </Text>
              </TouchableOpacity>
            </View>
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

  card: { 
    borderWidth: 1.5, 
    borderRadius: 20, 
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  cardFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
});

export default MyProposalsScreen;
