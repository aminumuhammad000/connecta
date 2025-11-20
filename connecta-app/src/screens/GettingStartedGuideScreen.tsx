import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const STEPS = [
  {
    id: 's1',
    title: 'Create a Winning Profile',
    desc: 'Guide on filling out skills, bio, and portfolio.',
    status: 'completed' as const,
  },
  {
    id: 's2',
    title: 'How to Find Jobs',
    desc: 'Tutorial on searching, filtering, and saving job postings.',
    status: 'active' as const,
  },
  {
    id: 's3',
    title: 'Writing a Great Proposal',
    desc: 'Tips for crafting compelling bids.',
    status: 'pending' as const,
  },
  {
    id: 's4',
    title: 'Managing Your Projects',
    desc: 'Walkthrough of the project management dashboard.',
    status: 'pending' as const,
  },
  {
    id: 's5',
    title: 'Secure Payments Explained',
    desc: 'Information on how payments and withdrawals work.',
    status: 'pending' as const,
  },
];

const GettingStartedGuideScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const completed = STEPS.filter(s => s.status === 'completed').length;
  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: 48, height: 48 }} />
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Getting Started</Text>
          <View style={{ width: 48, height: 48 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}>
          {/* Headline */}
          <Text style={{ color: c.text, fontSize: 32, fontWeight: '800', paddingTop: 8 }}>Welcome! Let's get you set up.</Text>

          {/* Progress */}
          <View style={{ gap: 8, paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>Your Progress</Text>
              <Text style={{ color: c.subtext, fontSize: 13 }}>{completed} of {total} steps completed</Text>
            </View>
            <View style={{ height: 8, borderRadius: 999, backgroundColor: c.isDark ? '#374151' : '#E5E7EB' }}>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: c.primary, width: `${pct}%` }} />
            </View>
          </View>

          {/* Steps */}
          <View style={{ gap: 10, paddingTop: 8 }}>
            {STEPS.map(step => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              return (
                <TouchableOpacity key={step.id} style={[
                  styles.item,
                  { borderColor: c.border, backgroundColor: c.card },
                  isActive && { borderWidth: 2, borderColor: c.primary },
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={[styles.iconCircle, { backgroundColor: isCompleted ? (c.isDark ? 'rgba(16,185,129,0.15)' : '#D1FAE5') : (c.isDark ? '#374151' : '#F3F4F6') }]}> 
                      {isCompleted ? (
                        <MaterialIcons name="check-circle" size={22} color={c.isDark ? '#6EE7B7' : '#10B981'} />
                      ) : (
                        <MaterialIcons name="radio-button-unchecked" size={22} color={c.text} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{step.title}</Text>
                      <Text style={{ color: c.subtext, fontSize: 13 }} numberOfLines={2}>{step.desc}</Text>
                    </View>
                  </View>
                  <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="arrow-forward-ios" size={18} color={c.subtext} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNav
          activeKey="profile"
          onChange={(key) => {
            if (key === 'home') return navigation.navigate('Dashboard');
            if (key === 'jobs') return navigation.navigate('Dashboard');
            if (key === 'profile') return; // treat under help/profile path
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, minHeight: 72 },
  iconCircle: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

export default GettingStartedGuideScreen;
