import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface FreelancerRec {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews: number;
}

const FREELANCERS: FreelancerRec[] = [
  {
    id: 'f1',
    name: 'Jenny Wilson',
    role: 'UX/UI Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEjA1qkTeGlFqHIJJxs96X8h7SWh3pp4bJJze9IaLG4bgFtH9cYiYYLxc0afI6nhNNop2i5SQHGPzAU4_ieX1ifB_e8FqV07caEx8PbLyRk0cHS40qYV4pfwXn4LD-vakHid3us0-5UBeGpuBqZmg59j9g1w1_pdtkEX2bK0HXc6zq9J8DXn5sNqbeVlcWbIzhGzmV_dupJuae8ajdKUAhQGKkQUiYaAlJcGUzurUc1gQJoef6_ngZB5caZqdX2UJgTQeuf36FJVo',
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 'f2',
    name: 'Robert Fox',
    role: 'Webflow Developer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBku_SBx_jdljBMvRoNSlxAzHNgYe99IoIDbg0INB9dxG-qJGw0tTm-KPPZJlh7Tfphorgu06whI0cCoq8ce0NiWTkibZc0aBbVUElMbcmwVdjWgRILxZH8CFe2Uq5NX3L72sYb6JqbirS0oqrMcPA__RsAkNB5QwDIX9zP8FJH5A00q9GFyqfUcZDAIQURju2Ozi6UZDHAPv01VWNXnGBh7srCZjxd1D5JshH8wMxWdjYWDFIQQDf7KuyQHCDrUyWlxCdbbPbTIXI',
    rating: 5.0,
    reviews: 88,
  },
  {
    id: 'f3',
    name: 'Kristin Watson',
    role: 'SEO Specialist',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqJb1ZVN5TOym2QLLAlJyKR-mD8e7K8lFJWk_ZU9s4NkneWDBv4u_xI6-8a4hf3RSgxzAtP73XPbfKpIAjTIL87fUqJLNQkiMZYdJ0QrPUwBpiucHjo8rswE2IJwM-NAb1WdUQnANOgc5ufOVDelQqW6BRR1e8vUQ6PDIl37pQrnG9EyTVXEgPm19zQrIRD-wnanutFxDYFtxSteNIClSrMVIOJcureFllPmTa4k36YWbciBF--3JwPjJ_b839en9a7WyCF6i4BT4',
    rating: 4.8,
    reviews: 210,
  },
];

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKz_jM9IRQFZZag2PHtqGxtKYySTvATiq59ZeSw3q0IjvryLIjfeFr8Z5z_OHxi7agn1E0SBPBWf6JF59iMb49ekD1Ggst6xJEudlcFW6shMFmbXbO-CeOaTu8dNd_0SzjyhB5Gp-360xTzb5j3E3-8V6jQYLRhaZuu96bp-FkIKRESqEkPfQUPmzg1okhvSqw2jjcYMYuCkeGn8NGOYifjRo7Fmb_MkN-vDEoX-gfZSV2VobQ_zOJKew0eG8Z-_l6DKTis8EEgRE';

const ClientDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 72 }}>
          <View style={styles.appBarWrap}>
            <View style={styles.appBar}> 
              <Image source={{ uri: AVATAR }} style={styles.appBarAvatar} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.appBarBtn}>
                <MaterialIcons name="notifications" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.greeting, { color: c.text }]}>Good morning, David!</Text>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.statsRow}>
              <StatCard label="Active Projects" value="5" />
              <StatCard label="Payments Due" value="3" />
              <StatCard label="New Messages" value="2" valueColor={c.primary} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PostJob')}
              style={[styles.postJobBtn, { backgroundColor: c.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Post a New Job"
            >
              <Text style={styles.postJobText}>Post a New Job</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended for You</Text>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {FREELANCERS.map(f => (
              <View key={f.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
                <Image source={{ uri: f.avatar }} style={styles.cardAvatar} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardName, { color: c.text }]}>{f.name}</Text>
                  <Text style={[styles.cardRole, { color: c.subtext }]}>{f.role}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="star" size={16} color="#f59e0b" />
                    <Text style={[styles.cardRating, { color: c.subtext }]}>{f.rating.toFixed(1)} ({f.reviews})</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.viewBtn, { backgroundColor: c.primary + '22' }]} onPress={() => navigation.navigate('ClientProfile')}>
                  <Text style={[styles.viewBtnText, { color: c.primary }]}>View Profile</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <BottomNav
          activeKey="home"
          onChange={(key) => {
            if (key === 'home') return;
            if (key === 'jobs') return navigation.navigate('ClientProjects');
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
  appBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarAvatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#ddd' },
  appBarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  greeting: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800' },
  postJobBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#FD6730', shadowOpacity: 0.2, shadowRadius: 12, elevation: 2 },
  postJobText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12, fontSize: 22, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  cardAvatar: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#ddd' },
  cardName: { fontSize: 16, fontWeight: '800' },
  cardRole: { fontSize: 13, fontWeight: '500' },
  cardRating: { fontSize: 12, fontWeight: '600' },
  viewBtn: { height: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontSize: 12, fontWeight: '800' },
});

export default ClientDashboardScreen;
