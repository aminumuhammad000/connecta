import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ReviewItem {
  id: string;
  author: string;
  date: string;
  title: string;
  body: string;
  rating: number;
  avatar?: string;
  initials?: string;
  type: 'received' | 'given';
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    author: 'Jane Doe',
    date: 'Oct 26, 2023',
    title: 'Brand Identity Design',
    body: '“Working with them was a pleasure. Exceptionally professional and delivered outstanding results ahead of schedule...”',
    rating: 5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTElD-sofcpQmy2YDitxra3WHlyQ4VZDNGSxbVAAZG_wmN_EI6GqLzrd9buojwoN8H5J5Uu9sjHG17yt2oCbC8kY6U37VahqIUnIKaWBZjaynGYkBpzApUL3q4subxZGtXdICVLRfuf7JFg2Vx0XlMXmkWETb1H4EM1vMJwGiPI4A03PR9B0csmedcNkK2qO7GqvZTaovBIJ4Rxxnt_eG-oADkCR49W0BLJZtkqiJ6G9lk4nJ7qEMB5o-rtbgQ2t25OpdEMih1598',
    type: 'received',
  },
  {
    id: 'r2',
    author: 'John Smith',
    date: 'Sep 15, 2023',
    title: 'Mobile App UI/UX',
    body: '“Great communication and very skilled. The project took a bit longer than expected but the final product was worth it.”',
    rating: 4,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT-zd2pbGU8IGUQr5NntT2AvFneEnwF9Tn899c1_PKHJbxEj3K9TK0WGO-Qs3FTpTc1dKsV6u05_6doHddILDVoyohy9yLXYr0SqCucc6IOtbTIYniGxqwd98xQkCXQkvTqHmOQFNo-Iud_ePWKdqMcWDA--4ugUWeBAZMKPJCLMYBBtEee6OSB_W26qpEpXz0ZyxHZE1DW3TAOfSkeR1LeVu0QfJbXVmBiEvB4rhEqbpxE3ussCy8RdqHIUO-AVGIj2wf29F_Oo4',
    type: 'received',
  },
  {
    id: 'r3',
    author: 'Creative Solutions Inc.',
    date: 'Aug 02, 2023',
    title: 'Website Redesign',
    body: '“An absolute professional. We are thrilled with the new website and will definitely hire them again for future projects. Highly recommend!”',
    rating: 5,
    initials: 'CS',
    type: 'received',
  },
];

const ClientMyReviewsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'received' | 'given'>('received');

  const list = useMemo(() => REVIEWS.filter(r => r.type === tab), [tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={[styles.appBar, { borderBottomColor: c.border }]}> 
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.text }]}>My Reviews</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={[styles.tabsWrap, { borderBottomColor: c.border }]}> 
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setTab('received')} style={styles.tabBtn}>
              <Text style={[styles.tabText, { color: tab === 'received' ? c.primary : c.subtext, borderBottomColor: tab === 'received' ? c.primary : 'transparent', borderBottomWidth: 3 }]}>Received</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('given')} style={styles.tabBtn}>
              <Text style={[styles.tabText, { color: tab === 'given' ? c.primary : c.subtext, borderBottomColor: tab === 'given' ? c.primary : 'transparent', borderBottomWidth: 3 }]}>Given</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {list.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: c.background, borderColor: c.border }]}> 
              <View style={styles.row}> 
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.initialsCircle, { backgroundColor: c.isDark ? '#374151' : '#E5E7EB' }]}> 
                    <Text style={{ color: c.subtext, fontWeight: '800' }}>{item.initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.headerRow}> 
                    <Text style={[styles.name, { color: c.text }]}>{item.author}</Text>
                    <Text style={{ color: c.subtext, fontSize: 12 }}>{item.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MaterialIcons key={i} name={i < item.rating ? 'star' : 'star-border'} size={16} color={i < item.rating ? c.primary : c.subtext} />
                    ))}
                    <Text style={{ color: c.subtext, fontSize: 12, marginLeft: 6 }}>{item.title}</Text>
                  </View>
                  <Text style={{ color: c.subtext, fontSize: 13, lineHeight: 18 }}>{item.body}</Text>
                  <TouchableOpacity style={[styles.respondBtn, { backgroundColor: c.primary + '1A' }]} onPress={() => navigation.navigate('ClientReviewDetails')}> 
                    <Text style={[styles.respondText, { color: c.primary }]}>View & Respond</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Nav */}
</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  title: { fontSize: 18, fontWeight: '800' },
  tabsWrap: { position: 'relative' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tabText: { fontSize: 13, fontWeight: '800' },
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#ddd' },
  initialsCircle: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '800' },
  respondBtn: { marginTop: 8, alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  respondText: { fontSize: 12, fontWeight: '800' },
});

export default ClientMyReviewsScreen;
