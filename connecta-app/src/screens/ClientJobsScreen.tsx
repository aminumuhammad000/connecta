import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface ClientJob {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Closed';
  proposals: number;
}

const SEED: ClientJob[] = [
  { id: 'c1', title: 'UX/UI Designer for Mobile App', status: 'Open', proposals: 15 },
  { id: 'c2', title: 'Senior Frontend Developer', status: 'In Progress', proposals: 22 },
  { id: 'c3', title: 'Backend API Integration', status: 'Closed', proposals: 8 },
];

const ClientJobsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'All' | 'Open' | 'Closed'>('All');
  const jobs = SEED;

  const filtered = useMemo(() => {
    if (tab === 'All') return jobs;
    if (tab === 'Open') return jobs.filter(j => j.status === 'Open' || j.status === 'In Progress');
    return jobs.filter(j => j.status === 'Closed');
  }, [jobs, tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <View style={[styles.appBar, { borderBottomColor: c.border }]}> 
          <View style={{ width: 48 }} />
          <Text style={[styles.appBarTitle, { color: c.text }]}>My Jobs</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Search" style={styles.iconBtn}>
            <MaterialIcons name="search" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 84 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PostJob')}
              style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            >
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Post a New Job</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tabsWrap, { borderBottomColor: c.border, backgroundColor: c.background }]}> 
            <View style={styles.tabsRow}>
              <TabBtn label="All" active={tab === 'All'} onPress={() => setTab('All')} color={c} />
              <TabBtn label="Open" active={tab === 'Open'} onPress={() => setTab('Open')} color={c} />
              <TabBtn label="Closed" active={tab === 'Closed'} onPress={() => setTab('Closed')} color={c} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}>
            {filtered.map(j => (
              <View key={j.id} style={[styles.card, { backgroundColor: c.card }]}> 
                <View style={styles.cardHeader}>
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{j.title}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusBg(j.status), borderColor: statusFg(j.status) }]}> 
                      <Text style={[styles.statusText, { color: statusFg(j.status) }]}>{j.status === 'In Progress' ? 'In Progress' : j.status}</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="more-vert" size={22} color={c.subtext} />
                  </TouchableOpacity>
                </View>
                <View style={styles.metaRow}> 
                  <MaterialIcons name="content-copy" size={16} color={c.subtext} />
                  <Text style={{ color: c.subtext, fontSize: 12 }}>{j.proposals} Proposals</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <BottomNav
          activeKey="jobs"
          onChange={(key) => {
            if (key === 'home') navigation.replace('ClientDashboard');
            if (key === 'jobs') return;
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

function TabBtn({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color: ReturnType<typeof useThemeColors> }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, { borderBottomColor: active ? color.primary : 'transparent' }]}> 
      <Text style={[styles.tabText, { color: active ? color.primary : color.subtext, fontWeight: active ? '800' as const : '600' as const }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function statusBg(status: ClientJob['status']) {
  if (status === 'Open') return 'rgba(52,199,89,0.12)';
  if (status === 'In Progress') return 'rgba(0,122,255,0.12)';
  return 'rgba(138,138,142,0.12)';
}
function statusFg(status: ClientJob['status']) {
  if (status === 'Open') return '#34C759';
  if (status === 'In Progress') return '#007AFF';
  return '#8A8A8E';
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  appBarTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  primaryBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tabsWrap: { position: 'sticky' as any, top: 72, borderBottomWidth: StyleSheet.hairlineWidth },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between' },
  tabBtn: { paddingVertical: 12, flex: 1, alignItems: 'center', borderBottomWidth: 3 },
  tabText: { fontSize: 13, letterSpacing: 0.15 },
  card: { padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4, borderWidth: StyleSheet.hairlineWidth },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
});

export default ClientJobsScreen;
