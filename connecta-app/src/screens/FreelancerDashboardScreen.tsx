import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface JobRec {
  id: string;
  title: string;
  company: string;
  budget: string;
  status: 'New' | 'Hot' | 'Featured';
}

const JOBS: JobRec[] = [
  { id: 'j1', title: 'Mobile App UI/UX', company: 'Innovate Inc.', budget: '$3,500', status: 'Featured' },
  { id: 'j2', title: 'Brand Identity Package', company: 'Fintech Hub', budget: '$1,800', status: 'Hot' },
  { id: 'j3', title: 'Marketing Website Redesign', company: 'Growth Labs', budget: '$4,200', status: 'New' },
];

const FreelancerDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 72 }}>
          <View style={styles.appBarWrap}>
            <View style={styles.appBar}> 
              <View style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="account-circle" size={32} color={c.text} />
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.appBarBtn}>
                <MaterialIcons name="notifications" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.greeting, { color: c.text }]}>Welcome back!</Text>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.statsRow}>
              <StatCard label="Active Proposals" value="4" />
              <StatCard label="Invites" value="2" />
              <StatCard label="New Messages" value="1" valueColor={c.primary} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Dashboard')}
              style={[styles.primaryBtn, { backgroundColor: c.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Find Jobs"
            >
              <Text style={styles.primaryBtnText}>Find Jobs</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended Jobs</Text>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {JOBS.map(job => (
              <View key={job.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{job.title}</Text>
                  <Text style={[styles.cardSub, { color: c.subtext }]}>{job.company}</Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.meta, { color: c.subtext }]}>Budget: {job.budget}</Text>
                    <Text style={[styles.dot, { color: c.subtext }]}>·</Text>
                    <Text style={[styles.badge, { color: c.primary, borderColor: c.primary }]}>{job.status}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('JobDetail')} style={[styles.viewBtn, { backgroundColor: c.primary + '22' }]}> 
                  <Text style={[styles.viewBtnText, { color: c.primary }]}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <BottomNav
          activeKey="home"
          onChange={(key) => {
            if (key === 'home') return;
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}> 
      <Text style={[styles.statLabel, { color: c.subtext }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor || c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appBarWrap: { paddingHorizontal: 16, paddingTop: 12 },
  appBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appBarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  greeting: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800' },
  primaryBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12, fontSize: 20, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 13, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  meta: { fontSize: 12 },
  dot: { marginHorizontal: 6 },
  badge: { fontSize: 12, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderWidth: StyleSheet.hairlineWidth, borderRadius: 999 },
  viewBtn: { height: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontSize: 12, fontWeight: '800' },
});

export default FreelancerDashboardScreen;
