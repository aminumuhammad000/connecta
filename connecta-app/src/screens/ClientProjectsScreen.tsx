import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface ProjectItem {
  id: string;
  title: string;
  price: string;
  freelancer: string;
  avatar: string;
  status: 'In Progress' | 'Completed' | 'Pending Approval';
}

const SEED: ProjectItem[] = [
  {
    id: 'p1',
    title: 'Redesign of E-commerce Website',
    price: '$2,500',
    freelancer: 'Jane Doe',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAM3FfVA23LbdasyDkpgbk88avK34sH2E8BSWhZS3nm-YM9ob4NEdCyXWqHSCYNMBLCyJLEjSb3uXF8lDCGdE-0Nrabk9iS-tU_5ySp-yRJTlZwLxduI5-NL-ucdM-r0R0hKZYY8l_JhlbDUot4VISidpmRs6gjD1G_Ujy3g-lag13YPzNtNeEfWAMac3dmJU9VuAA8IAgI-6_RAv2ldlAK6J8q6TYOFz2hETOiSIX0e54Fi7FCQNzJeINRL6vte_AdCcgA2QOcXSc',
    status: 'In Progress',
  },
  {
    id: 'p2',
    title: 'Mobile App Development',
    price: '$5,000',
    freelancer: 'John Smith',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDchTnQcabTPw_U1c7heTmFSBqCMmtQLviInTfv0BeSjO5BxQFcYnw5QwVxBEbJcGnjGNkLg4RP1jljNdk_SLgQMPgFGLv8lsHw6AoQAOV2FjWqUEc0IGyHggd3DlvqYGKQPH_4Wl-YkfnegoEL5iGLeDGp98KJ-6yGR82QXMbGUWztQTO75UVm3wv0vUsawto-vcrX9exQdhqOz8B_qiy6IWv9LCs_wJeQKlQw0zHy1rhxVJbdmiLbA2NxLzNGnQZa7ZCObi9k-5A',
    status: 'Completed',
  },
  {
    id: 'p3',
    title: 'Social Media Marketing Campaign',
    price: '$1,200',
    freelancer: 'Sarah Lee',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCB5Nri-yYB34CuXp2J-PtCnzbV6tGq6UauTUL8UBn0BzbnltUFzUgMbJWCleKsIqt53OlA3V3FHYrggz97SF2nmR7Y07Lo6dwYla-zuWCZIF2vHxuKtjUv4mqaiwq_Eltf6HrgjCOCR-Rz5pbbRBYXcOPdKGWyvidvCkOPkcmIC7zFpRfunlkhFrfXHEg7347mhYMLxlYrH0iXEkQWMKWEQJMl6W5TED2h1DMNAFUQcnaKeGP05y9Yz8FRMRMKnGCuI-fsjlb30Ro',
    status: 'Pending Approval',
  },
];

const chips: Array<{ key: 'All' | 'Active' | 'Completed' | 'Pending'; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'Active', label: 'Active' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Pending', label: 'Pending' },
];

const ClientProjectsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Pending'>('All');

  const filtered = useMemo(() => {
    const base = SEED.filter(p =>
      p.title.toLowerCase().includes(q.trim().toLowerCase()) ||
      p.freelancer.toLowerCase().includes(q.trim().toLowerCase())
    );
    if (filter === 'All') return base;
    if (filter === 'Active') return base.filter(p => p.status === 'In Progress');
    if (filter === 'Completed') return base.filter(p => p.status === 'Completed');
    return base.filter(p => p.status === 'Pending Approval');
  }, [q, filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={styles.appBar}> 
          <Text style={[styles.h1, { color: c.text }]}>My Projects</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.iconBtn}>
            <MaterialIcons name="notifications" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={[styles.searchWrap, { backgroundColor: c.card }]}> 
            <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search projects..."
              placeholderTextColor={c.subtext}
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>
        </View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 12 }}
        >
          {chips.map(ch => {
            const active = filter === ch.key;
            return (
              <TouchableOpacity
                key={ch.key}
                onPress={() => setFilter(ch.key)}
                style={[styles.chip, { backgroundColor: active ? c.primary : c.card }]}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : c.text }]}>{ch.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 + insets.bottom, gap: 12 }}>
          {filtered.map(p => (
            <TouchableOpacity key={p.id} activeOpacity={0.85} style={[styles.card, { backgroundColor: c.card }]}> 
              <View style={styles.cardTop}> 
                <Text style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                <Text style={[styles.cardPrice, { color: c.primary }]}>{p.price}</Text>
              </View>
              <View style={styles.cardMiddle}> 
                <Image source={{ uri: p.avatar }} style={styles.avatar} />
                <Text style={{ color: c.subtext, fontSize: 13 }}>{p.freelancer}</Text>
              </View>
              <View style={styles.cardBottom}> 
                <View style={[styles.pill, pillStyle(p.status)]}> 
                  <Text style={[styles.pillText, { color: pillStyle(p.status).color }]}>
                    {p.status}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={c.subtext} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => navigation.navigate('PostJob')}
          style={[styles.fab, { backgroundColor: c.primary, bottom: 24 + insets.bottom }]}
          accessibilityRole="button"
          accessibilityLabel="Add project"
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Bottom Nav */}
        <BottomNav
          activeKey="jobs"
          onChange={(key) => {
            if (key === 'home') return navigation.replace('ClientDashboard');
            if (key === 'jobs') return;
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

function pillStyle(status: ProjectItem['status']) {
  if (status === 'In Progress') return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb' };
  if (status === 'Completed') return { backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' };
  return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#a16207' };
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  h1: { fontSize: 22, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  searchWrap: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  chip: { height: 40, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '700' },
  card: { padding: 12, borderRadius: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardPrice: { fontSize: 16, fontWeight: '800' },
  cardMiddle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  avatar: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#ddd' },
  cardBottom: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', right: 20, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
});

export default ClientProjectsScreen;
