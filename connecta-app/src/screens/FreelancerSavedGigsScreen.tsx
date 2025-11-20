import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface SavedGigItem {
  id: string;
  company: string;
  title: string;
  summary: string;
  chips: string[]; // e.g. ['Fixed-Price: $500', 'Remote', 'Design']
  savedAgo: string;
}

const SAVED: SavedGigItem[] = [
  {
    id: 's1',
    company: 'Innovatech Solutions',
    title: 'UI/UX Designer for Mobile App',
    summary:
      'We are looking for a skilled designer to create a modern and intuitive user interface for our upcoming fintech application...',
    chips: ['Fixed-Price: $500', 'Remote', 'Design'],
    savedAgo: 'Saved 2 days ago',
  },
  {
    id: 's2',
    company: 'QuantumLeap Corp',
    title: 'Senior Frontend Developer (React)',
    summary:
      'Join our dynamic team to build next-generation web applications. Expertise in React, TypeScript, and modern CSS is a must.',
    chips: ['Hourly: $60-$80', 'Remote (US)', 'Development'],
    savedAgo: 'Saved yesterday',
  },
];

const FreelancerSavedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ width: 48, height: 48 }} />
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Saved Gigs</Text>
            <TouchableOpacity accessibilityRole="button">
              <Text style={{ color: c.primary, fontSize: 16, fontWeight: '800' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          {/* Search */}
          <View style={{ marginTop: 12 }}>
            <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}> 
              <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginHorizontal: 12 }} />
              <TextInput
                placeholder="Search by keyword, skill, etc."
                placeholderTextColor={c.subtext}
                style={{ flex: 1, color: c.text, paddingRight: 12 }}
              />
            </View>
          </View>
          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 10 }}>
            <View style={[styles.chip, { borderColor: c.border, backgroundColor: c.isDark ? 'rgba(0,0,0,0.2)' : '#fff' }]}> 
              <MaterialIcons name="swap-vert" size={16} color={c.subtext} />
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>Sort By</Text>
              <MaterialIcons name="expand-more" size={16} color={c.subtext} />
            </View>
            <View style={[styles.chip, { borderColor: c.border, backgroundColor: c.isDark ? 'rgba(0,0,0,0.2)' : '#fff' }]}> 
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>Category</Text>
              <MaterialIcons name="expand-more" size={16} color={c.subtext} />
            </View>
            <View style={[styles.chip, { borderColor: c.border, backgroundColor: c.isDark ? 'rgba(0,0,0,0.2)' : '#fff' }]}> 
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>Pay Type</Text>
              <MaterialIcons name="expand-more" size={16} color={c.subtext} />
            </View>
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}>
          {SAVED.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: c.card, shadowColor: '#000' }]}> 
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: c.subtext, fontSize: 13 }}>{item.company}</Text>
                    <Text style={{ color: c.text, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{item.title}</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="bookmark" size={22} color={c.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: c.subtext, fontSize: 13 }} numberOfLines={3}>{item.summary}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {item.chips.map(ch => (
                  <View key={ch} style={[styles.pill, { backgroundColor: ch.startsWith('Fixed-Price') || ch.startsWith('Hourly') ? c.primary + '1A' : (c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6') }]}> 
                    <Text style={{ color: ch.startsWith('Fixed-Price') || ch.startsWith('Hourly') ? c.primary : c.subtext, fontSize: 12, fontWeight: '700' }}>{ch}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: c.isDark ? '#6B7280' : '#9CA3AF', fontSize: 12 }}>{item.savedAgo}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('JobDetail')} style={[styles.btn, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}> 
                    <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('JobDetail')} style={[styles.btn, { backgroundColor: c.primary }]}> 
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Apply Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

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
  searchWrap: { height: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  chip: { height: 32, borderRadius: 999, paddingHorizontal: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { borderRadius: 12, padding: 16, gap: 10, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btn: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
});

export default FreelancerSavedGigsScreen;
