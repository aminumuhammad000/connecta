import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface JobItem {
  id: string;
  title: string;
  company: string;
  logoUri: string;
  saved: boolean;
  rate: string;
  posted: string;
  description: string;
}

const JobsScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<JobItem[]>([{
    id: '1',
    title: 'Senior UI/UX Designer',
    company: 'Creative Agency',
    logoUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJIMlIq800eN0jF3n3Nluyw5ztKoCBl9plrKA0vrtI4m7V3JS5pupYBBE81f-nGba5f58bufibV6lziVpzzIgOTu-3_fRNhmgORZW5CUfBoLzANnk1U3bGac-hrPY70Pg_xHDyqa4Oey1-7qc7WKCIibWiuCGBkESw0zxycXZx-o_lHPoyGV692MPsRydjxKq1iTz9uZ417emWxqZUIbgWNgi3ZvRrBzikfxFEmjk0jdpMO3mZoD1QnuLZhLvy9j5bhHjLeXZyykU',
    saved: false,
    rate: '$80 - $120/hr',
    posted: 'Posted 2h ago',
    description: "We're looking for a talented UI/UX designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design...",
  }, {
    id: '2',
    title: 'Mobile App Developer',
    company: 'Tech Solutions Inc.',
    logoUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1K-vEzA5LXpt_JPYj96lcyemkbm_sQEYqMq4lXTHAM47IGofRCOX8qFtdCPX80KQz30swwFYcGo9gza320-EYC4drdiCui-m2PPROsb6m8fyw-AXCcJFLrlZUfhSV-5e1dn9OUSu-6x4E_QCy82Qe63bWTnL-gj8Li1abdIOCtRcxCc4cWHj_PpnzA9aX3jsM1KGGO5jPXy8_aFGa-E6DsH1Bbk-ykb5fMmc2jgLnDFZJtHjgxxSV7C0Kn9l-KRRsAouOfwP118',
    saved: true,
    rate: '$95 - $150/hr',
    posted: 'Posted 5h ago',
    description: 'Seeking an experienced mobile developer proficient in React Native to build a cross-platform application. Join our innovative team.',
  }, {
    id: '3',
    title: 'Content Writer',
    company: 'Marketing Gurus',
    logoUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhIuAZQLCFctWXvLTsRSrK15EEix9gaWGTrs9CcmOFhvLrcyFkljAfOt3CGHn_VK64_MdwQWAggejy_35fLxwjCto_2SZ8xKFhvH_z4LNV1e_ejLLB0XlPCzFmFPiCQL5S0mDxEwU4UpzkC3j1R-Qrhl6WbG4szzpIDH4ftsyjIIH1mu1aYrVYYVeZKi1ocsk698AWhXGwhKQ9uEY7RFu0PONTGjlVbUo9i8NKP0hYl-9IFfnTD1ge16z01mFXeAeH1m8aSD9UA8U',
    saved: false,
    rate: '$50 - $70/hr',
    posted: 'Posted 1d ago',
    description: 'We need a creative content writer to produce high-quality articles, blog posts, and social media content for our clients.',
  }]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s));
  }, [q, items]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.background }]}> 
        <View style={styles.headerRow}> 
          <Text style={[styles.title, { color: c.text }]}>Find Jobs</Text>
          <View style={{ position: 'relative' }}> 
            <MaterialIcons name="notifications" size={26} color={c.text} />
            <View style={[styles.badge, { backgroundColor: c.primary, borderColor: c.background }]} />
          </View>
        </View>

        <View style={styles.searchRow}> 
          <View style={[styles.searchWrap, { backgroundColor: c.isDark ? '#1F2937' : '#F3F4F6' }]}> 
            <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginLeft: 12, marginRight: 6 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search for jobs..."
              placeholderTextColor={c.subtext}
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: c.primary }]}> 
            <MaterialIcons name="tune" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 + insets.bottom, gap: 12 }}>
        {filtered.map(j => (
          <View key={j.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
            <View style={styles.cardHeader}> 
              <View style={styles.companyRow}> 
                <Image source={{ uri: j.logoUri }} style={styles.logo} />
                <View>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{j.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: c.subtext }]}>{j.company}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setItems(prev => prev.map(x => x.id === j.id ? { ...x, saved: !x.saved } : x))}>
                <MaterialIcons name="bookmark" size={24} color={j.saved ? c.primary : c.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.desc, { color: c.text }]}>{j.description}</Text>

            <View style={styles.metaRow}> 
              <Text style={[styles.rate, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>{j.rate}</Text>
              <Text style={[styles.posted, { color: c.subtext }]}>{j.posted}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Post Job Button */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('PostJob')}
        style={[styles.fab, { backgroundColor: c.primary, bottom: 24 + insets.bottom }]} activeOpacity={0.9}
      >
        <MaterialIcons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchWrap: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rate: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
  },
  posted: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default JobsScreen;
