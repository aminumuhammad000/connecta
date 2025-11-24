import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface FreelancerItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews: number;
  skills: string[];
}

const SEED: FreelancerItem[] = [
  {
    id: 'u1',
    name: 'Jane Doe',
    role: 'Senior UI/UX Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCefw5KA5z8woiPz0TmF-ukETj6bQgV2WqB6II5z-Sz1BvSW-GyIcEglyed7qdmF6btvEwXDmYq9w_4v4sH60mZGExdzPEA6TsII1kBLMxozFkKWFUwOEqyFMolNTKfPJaeRvONFBsJ8KiB9vEO6kOaMP-uBgCQlGU060gsVYtB4t76MY2P7IGDPL2JrMmKhrc09ZG0hHRfpwEqUutnkgknzXsTX9jo4R4NsHzKDp1jQFvs58MIkSL7cnzYBTi_0sIvEqw_tazA1Mw',
    rating: 4.9,
    reviews: 128,
    skills: ['Figma', 'Webflow', 'Prototyping', 'User Research'],
  },
  {
    id: 'u2',
    name: 'John Smith',
    role: 'Lead Backend Developer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAP5OtbKmIv4Lpsl7zYc0No1QDA9PSt6DlYXeJlrj3fq_2764E8yCKgJUMNEQ_tGpI2Fu9P5vZ9rK3opSfz65OWfcl97mRanouM91Oab7komrL5RPR4-yKveSBN5fCYK2gXr1sAep_b8WN9Axb5E8O5qHD3GuYoneXDxn443-ttjKD93dugC5l26hIN3FYYyL_VxRSXRVHqDJsu34D-q94re4_q4mv0xYOV2TogpyoC_jLjFX0IgcynKTv9QkrSti9h-ZG6wnfgECM',
    rating: 4.8,
    reviews: 97,
    skills: ['Python', 'AWS', 'Docker', 'SQL'],
  },
  {
    id: 'u3',
    name: 'Sarah Lee',
    role: 'Brand & Identity Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4TghlFFlGWh92eyBKWXLM5YCO0rm31J4ZXOfJHktHL6eqguYVgc3gBw4ZkryZceFWZYkU8I_WUMZAXWfb2yiiKUS3aKEiNfSaBTwBTCxn8y_udDqPz7MWoRtZXSOVXALzKQLYG2Wl7tZXAxd4SIxfLULVFLmnHxOlHCi8zqypSZRGP2l3a5BGK2xqO3wpvRevC4FoCP8x9Ymyo2Jyv2NLgFHmOn1w_rENkF-F5SU1-fHgxjrwJ3mkKJieWGiBrpz-Px_CjqHO07c',
    rating: 5.0,
    reviews: 210,
    skills: ['Illustrator', 'Logo Design', 'Brand Strategy'],
  },
];

const ClientRecommendedFreelancersScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SEED;
    return SEED.filter(f =>
      f.name.toLowerCase().includes(s) ||
      f.role.toLowerCase().includes(s) ||
      f.skills.some(sk => sk.toLowerCase().includes(s))
    );
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={[styles.appBarWrap, { borderBottomColor: c.border }]}> 
          <View style={styles.appBar}>
            <TouchableOpacity onPress={() => navigation.goBack?.()} accessibilityLabel="Go back" style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={22} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: c.text }]}>Recommended For You</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search & Filter */}
          <View style={styles.searchRow}>
            <View style={[styles.searchWrap, { backgroundColor: c.card }]}> 
              <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginLeft: 12, marginRight: 6 }} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search by skill or name..."
                placeholderTextColor={c.subtext}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: c.card }]}>
              <MaterialIcons name="tune" size={22} color={c.text} />
            </TouchableOpacity>
          </View>

          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}> 
            <Chip active label="Sort By" leftIcon="expand-more" />
            <Chip label="Hourly Rate" leftIcon="expand-more" />
            <Chip label="Location" leftIcon="expand-more" />
            <Chip label="Rating" leftIcon="expand-more" />
          </ScrollView>
        </View>

        <Text style={[styles.meta, { color: c.subtext }]}>Based on your 'Senior UI/UX Designer' job post</Text>

        {/* List */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, gap: 12 }}>
          {filtered.map(f => (
            <View key={f.id} style={[styles.card, { backgroundColor: c.card }]}> 
              <View style={styles.cardHdr}> 
                <Image source={{ uri: f.avatar }} style={styles.avatar} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.name, { color: c.text }]}>{f.name}</Text>
                  <Text style={{ color: c.subtext, fontSize: 13 }}>{f.role}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="star" size={16} color="#f59e0b" />
                    <Text style={{ color: c.subtext, fontSize: 12 }}>{f.rating.toFixed(1)} ({f.reviews} reviews)</Text>
                  </View>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}> 
                {f.skills.map(s => (
                  <View key={s} style={[styles.skillPill, { backgroundColor: c.isDark ? '#3f3f46' : '#f4f4f5' }]}> 
                    <Text style={[styles.skillText, { color: c.subtext }]}>{s}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: c.isDark ? '#3f3f46' : '#f4f4f5' }]} onPress={() => navigation.navigate('ClientProfile')}> 
                  <Text style={[styles.btnText, { color: c.text }]}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={() => navigation.navigate('PostJob')}> 
                  <Text style={[styles.btnText, { color: '#fff' }]}>Invite to Job</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* BottomNav */}
</View>
    </SafeAreaView>
  );
};

function Chip({ label, leftIcon, active }: { label: string; leftIcon?: keyof typeof MaterialIcons.glyphMap; active?: boolean }) {
  const c = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: active ? c.primary + '33' : c.card }]}> 
      <Text style={[styles.chipText, { color: active ? c.primary : c.text }]}>{label}</Text>
      {leftIcon ? <MaterialIcons name={leftIcon} size={18} color={active ? c.primary : c.text} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  title: { fontSize: 18, fontWeight: '800' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  searchWrap: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  filterBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 16, paddingTop: 8, fontSize: 12 },
  card: { padding: 12, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardHdr: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#ddd' },
  name: { fontSize: 16, fontWeight: '800' },
  skillPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  skillText: { fontSize: 12, fontWeight: '600' },
  btn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 13, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 32, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
});

export default ClientRecommendedFreelancersScreen;
