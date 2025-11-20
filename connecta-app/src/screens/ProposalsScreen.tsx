import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';

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

  const data = useMemo<Proposal[]>(() => ([
    {
      id: 'p1',
      title: 'UI/UX Designer for Mobile App',
      name: 'Laura Williams',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQuTpi8W0GMXLNYIGw2ZoGXa07wgvbTBZNSK0mijj-45lyvzpyzjkfddIq7Fl0amYxo3MjGAbO_JDTxRidyV-EivrF42jj79Rdv21Nk7z8zdvbG9lYZpH6LB6McTPNXJDOT0nUBC8uXj3DrZ5757YV9cMe9_EPNa2ONasmmtCdXmRBbCW_qQu04cjzghMg7k_C-jAv-HRSzJBVb9fEFrDTjl9b7sCe0zptaj8_pi_FEkhiorrI0DU2DCi8W9nwlIuVp3-l5S8hyFk',
      price: '$3,500',
      time: '2 weeks',
      status: 'accepted',
    },
    {
      id: 'p2',
      title: 'Brand Identity & Logo Design',
      name: 'David Smith',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPCdC0xaEEADk64KZZPAOopPGj2wgIr_8Exme0NZncrR_rRKrNG0Xl8DElad8M8K9fKObYMH7yYxrfevjS3tva7ytNa0PYlkUCmK3lgVY0GUR4tfl9udwh-_pyQHKmUvcPyjqOsyYWi9sh4LAWK5uWbea-TvGNLIceBC8sPptXz1cIR83qPByMaJBRWhZv9oDxVdxzhoR8iv88ix0z5DuDLAkOPIL9Iw3_BsRXRSnUtxufSMEJUb6GHRxw6ht6r925gDxRKT0_Zmo',
      price: '$1,200',
      time: '1 week',
      status: 'pending',
    },
    {
      id: 'p3',
      title: 'Social Media Manager',
      name: 'Emily Carter',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqeOj4v5N5mTxSC4xgv1bKb-e6LCeIxctgtAajgEfE-n3qMy6JXL4snTK5K0rW08AbUkkbzoU27E1hG-KohtuX67mSH1H7iUe-R2EaCPAjhq3kfhJd-smsIVQHN2BVe8JRIQKAIu0Bpc9o3LQmrltI2CgYMtJxvthaxGkiMlrY1BHGdhvjOgMkw2HT-mNI17dvSayuQ-JjkdGfqUmROYX7RI-z7cMjTi40xf37PqUD9tYH4QsclH4zQ9FXv8kbeaxzJmQI8sGbTME',
      price: '$800',
      time: 'month',
      status: 'rejected',
    },
  ]), []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter(d =>
      (filter === 'all' || d.status === filter) &&
      (t.length === 0 || d.title.toLowerCase().includes(t) || d.name.toLowerCase().includes(t))
    );
  }, [q, filter, data]);

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
        {filtered.map(p => (
          <View key={p.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
            <View style={styles.cardHeader}> 
              <View style={styles.headerLeft}> 
                <Image source={{ uri: p.avatar }} style={styles.avatar} />
                <View>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: c.subtext }]}>{p.name}</Text>
                </View>
              </View>
              <View style={[styles.status, p.status === 'accepted' ? { backgroundColor: 'rgba(34,197,94,0.2)' } : p.status === 'pending' ? { backgroundColor: 'rgba(245,158,11,0.2)' } : { backgroundColor: 'rgba(239,68,68,0.2)' } ]}> 
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
              <TouchableOpacity style={[styles.cta, { backgroundColor: p.status === 'accepted' ? c.primary : c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}> 
                <Text style={[styles.ctaText, { color: p.status === 'accepted' ? '#fff' : c.text }]}>{p.status === 'accepted' ? 'Message' : 'View Details'}</Text>
                <MaterialIcons name={p.status === 'accepted' ? 'send' : 'arrow-forward'} size={18} color={p.status === 'accepted' ? '#fff' : c.text} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '800',
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
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, fontWeight: '500' },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 12 },
  price: { fontSize: 14, fontWeight: '700' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10 },
  ctaText: { fontSize: 13, fontWeight: '700' },
});

export default ProposalsScreen;
