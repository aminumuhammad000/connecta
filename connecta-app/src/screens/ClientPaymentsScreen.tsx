import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface TxnItem {
  id: string;
  who: string;
  purpose: string;
  date: string;
  amount: string;
  status: 'Completed' | 'Pending';
  avatar: string;
}

const TXNS: TxnItem[] = [
  {
    id: 't1',
    who: 'Paid to Jane Doe',
    purpose: 'For: Brand Logo Redesign',
    date: 'Dec 15, 2023',
    amount: '$500.00',
    status: 'Completed',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAon50pnLDMessEvF2R4tezauju0hZts7NlXMgPgbJgYunsaYOGR4uZM9UktYpQnVxxVJHBfPTeN2nkd_Fct1K8WKLPE0mdft6-VQ4MbZ_CDNpfBH1KORkX1QFj-iSPmnuJLXb6ItnvjClNCkrGWM1axUe1vhoNAR9qsEQ5lMrL7DNb3BGHZcD9FXia7s_7F_tLygu7_70L72vf0sLKPfQx5VtLT7tn7Qq1w-CyjV9e_xzbAW5xMRRbRgeKBrcocc2MWQny4eaaNa4',
  },
  {
    id: 't2',
    who: 'Paid to John Smith',
    purpose: 'For: Mobile App UI Kit',
    date: 'Dec 10, 2023',
    amount: '$1,300.00',
    status: 'Completed',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCu8g9n1Qa8CQW6d6bEUiY43dS9wmSTavBAowfiBU2Wrd39zqEOpF-fQpnWmEn-M9hZ1KhmgdnfV8oWlDWppn3mmoCYoLB6FN2iRG469cqqzLwpK_0av9pvmJ3liJICwpyCiSpxuw29AUzT4b74EY7z14S2MwcP_mhh0VhD59U6R02Et5_B2YXUdWwPPGzy3QINd-U666sNosENZTVmNOBoX5c_xXYeN4C5L5n05wMK6lliSLeEIhIJWds9JVJMEsD_plAbcLN_8Sg',
  },
  {
    id: 't3',
    who: 'To Emily White',
    purpose: 'For: Social Media Content',
    date: 'Due Dec 28, 2023',
    amount: '$750.00',
    status: 'Pending',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBON6YAD2-D4UqU-ZL2R4_vcJcL8aoRjpwN1kxzMEx5m1XM9WHZnQMp_Bjw6TM8rgtWCrTGFA54J77yl3ADyVmmPScJ0MptIJo0V3v0eWY_7ScPeTl_RzTmqI5jzeIYQ_fJQYBtk71ocmd5UNzp9F437qnzG_bEKQ430tuOj8TtS5clb57bWcyxzqVpD8xQ4q2Mb3FScXolQ7AKgw2Q84VVspeWLLK0StZOIwYy2yKXjYp_NfVj3wMwAGIY_kcwV_ra0l4FPsXywrM',
  },
];

const ClientPaymentsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [q, setQ] = useState('');
  const [range, setRange] = useState('Last 30 Days');
  const [filter, setFilter] = useState<'Completed' | 'Pending' | 'All'>('All');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return TXNS.filter(t => (filter === 'All' || t.status === filter) && (
      !s || t.who.toLowerCase().includes(s) || t.purpose.toLowerCase().includes(s)
    ));
  }, [q, filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top Bar */}
        <View style={styles.appBar}> 
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: c.text }]}>Payment History</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {/* Stats */}
          <View style={{ padding: 16, gap: 12 }}>
            <View style={[styles.statCard, { backgroundColor: c.card }]}>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Total Spent</Text>
              <Text style={[styles.statValue, { color: c.text }]}>$12,450.00</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.card }]}>
              <Text style={[styles.statLabel, { color: c.subtext }]}>This Month</Text>
              <Text style={[styles.statValue, { color: c.text }]}>$1,800.00</Text>
            </View>
            <View style={[styles.statCardWide, { backgroundColor: c.card }]}>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Pending Payments</Text>
              <Text style={[styles.statValue, { color: c.primary }]}>$750.00</Text>
            </View>
          </View>

          {/* Search */}
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            <View style={[styles.searchWrap, { backgroundColor: c.isDark ? '#111827' : '#F3F4F6' }]}> 
              <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search by freelancer or project"
                placeholderTextColor={c.subtext}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>
          </View>

          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 12 }}>
            <Chip label={range} active onPress={() => setRange(range)} />
            <Chip label="Completed" onPress={() => setFilter(filter === 'Completed' ? 'All' : 'Completed')} />
            <Chip label="Pending" onPress={() => setFilter(filter === 'Pending' ? 'All' : 'Pending')} />
          </ScrollView>

          {/* Section */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Transactions</Text>

          {/* List */}
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {filtered.map(t => (
              <View key={t.id} style={[styles.card, { backgroundColor: c.card }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image source={{ uri: t.avatar }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txnTitle, { color: c.text }]}>{t.who}</Text>
                    <Text style={{ color: c.subtext, fontSize: 12 }}>{t.purpose}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <View style={[styles.pill, pillStyle(t.status)]}>
                        <Text style={[styles.pillText, { color: pillStyle(t.status).color }]}>{t.status}</Text>
                      </View>
                      <Text style={{ color: c.subtext, fontSize: 12 }}>{t.date}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amount, { color: c.text }]}>{t.amount}</Text>
                    <TouchableOpacity>
                      <Text style={{ color: c.primary, fontSize: 12, fontWeight: '700' }}>View Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: c.isDark ? '#111827' : '#F3F4F6' }]}> 
              <MaterialIcons name="download" size={20} color={c.text} />
              <Text style={[styles.downloadText, { color: c.text }]}>Download Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNav
          activeKey="profile"
          onChange={(key) => {
            if (key === 'home') return navigation.replace('ClientDashboard');
            if (key === 'jobs') return navigation.navigate('ClientProjects');
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const c = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: active ? c.primary + '33' : (c.isDark ? '#111827' : '#F3F4F6') }]}> 
      <Text style={[styles.chipText, { color: active ? c.primary : c.subtext }]}>{label}</Text>
      <MaterialIcons name="expand-more" size={18} color={active ? c.primary : c.subtext} />
    </TouchableOpacity>
  );
}

function pillStyle(status: TxnItem['status']) {
  if (status === 'Completed') return { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' };
  return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#ca8a04' };
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  appBarTitle: { fontSize: 18, fontWeight: '800' },
  statCard: { borderRadius: 12, padding: 12 },
  statCardWide: { borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800' },
  searchWrap: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, fontSize: 18, fontWeight: '800' },
  card: { borderRadius: 12, padding: 12 },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#ddd' },
  txnTitle: { fontSize: 14, fontWeight: '800' },
  amount: { fontSize: 16, fontWeight: '800' },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  downloadBtn: { marginTop: 8, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  downloadText: { fontSize: 14, fontWeight: '700' },
  chip: { height: 40, borderRadius: 999, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },
});

export default ClientPaymentsScreen;
