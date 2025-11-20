import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

type AppStatus = 'All' | 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';

interface ApplicationItem {
  id: string;
  title: string;
  company: string;
  appliedOn: string;
  status: Exclude<AppStatus, 'All'>;
}

const APPS: ApplicationItem[] = [
  { id: 'a1', title: 'UX/UI Designer for E-commerce App', company: 'Innovate Inc.', appliedOn: 'Oct 26, 2023', status: 'Accepted' },
  { id: 'a2', title: 'Social Media Manager', company: 'Creative Solutions', appliedOn: 'Oct 24, 2023', status: 'Pending' },
  { id: 'a3', title: 'Brand Identity Designer', company: 'Marketing Pro', appliedOn: 'Oct 22, 2023', status: 'Rejected' },
  { id: 'a4', title: 'Frontend Developer (React)', company: 'Tech Forward', appliedOn: 'Oct 20, 2023', status: 'Reviewed' },
];

const statusStyle = (
  c: ReturnType<typeof useThemeColors>,
  s: Exclude<AppStatus, 'All'>
) => {
  switch (s) {
    case 'Accepted':
      return { bg: c.isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5', fg: c.isDark ? '#6EE7B7' : '#047857' };
    case 'Pending':
      return { bg: c.isDark ? 'rgba(253,103,48,0.25)' : c.primary + '33', fg: c.isDark ? '#FDBA74' : c.primary };
    case 'Reviewed':
      return { bg: c.isDark ? 'rgba(253,103,48,0.25)' : c.primary + '33', fg: c.isDark ? '#FDBA74' : c.primary };
    case 'Rejected':
      return { bg: c.isDark ? '#374151' : '#E5E7EB', fg: c.isDark ? '#D1D5DB' : '#4B5563' };
  }
};

const FILTERS: AppStatus[] = ['All', 'Pending', 'Reviewed', 'Accepted', 'Rejected'];

const FreelancerApplicationsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [filter, setFilter] = useState<AppStatus>('All');

  const list = useMemo(
    () => (filter === 'All' ? APPS : APPS.filter(a => a.status === filter)),
    [filter]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={[styles.appBar]}> 
          <Text style={[styles.h1, { color: c.text }]}>My Applications</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="search" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: f === filter ? c.primary : (c.isDark ? '#1F2937' : '#F3F4F6'),
                },
              ]}
            >
              <Text
                style={{
                  color: f === filter ? '#fff' : (c.isDark ? '#E5E7EB' : '#374151'),
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Applications List */}
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}>
          {list.map(item => {
            const st = statusStyle(c, item.status);
            return (
              <View key={item.id} style={[styles.card, { borderColor: c.border, backgroundColor: c.card }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 16, fontWeight: '800' }}>{item.title}</Text>
                    <Text style={{ color: c.subtext, fontSize: 13 }}>{item.company}</Text>
                    <Text style={{ color: c.subtext, fontSize: 13 }}>Applied on {item.appliedOn}</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="more-vert" size={20} color={c.subtext} />
                  </TouchableOpacity>
                </View>
                <View style={{ marginTop: 6 }}>
                  <View style={{ alignSelf: 'flex-start', backgroundColor: st.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: st.fg, fontSize: 12, fontWeight: '700' }}>{item.status}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNav
          activeKey="jobs"
          onChange={(key) => {
            if (key === 'home') return navigation.replace('FreelancerDashboard');
            if (key === 'jobs') return; // already here
            if (key === 'profile') return navigation.navigate('Dashboard');
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  h1: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  filterChip: { height: 32, borderRadius: 8, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});

export default FreelancerApplicationsScreen;
