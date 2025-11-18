import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  time: string;
  read: boolean;
  type: 'payment' | 'message' | 'like' | 'job' | 'welcome';
}

const NotificationsScreen: React.FC = () => {
  const c = useThemeColors();
  const [items, setItems] = useState<NotificationItem[]>(() => ([
    { id: 'n1', title: 'Payment of $1,250 has been released', subtitle: 'Project: Website Redesign', icon: 'payments' as any, time: '5m ago', read: false, type: 'payment' },
    { id: 'n2', title: 'New message from Alex Morgan', subtitle: "Sounds good, let's proceed with the...", icon: 'chat-bubble', time: '1h ago', read: false, type: 'message' },
    { id: 'n3', title: 'Your proposal was accepted!', subtitle: 'Job: Social Media Marketing Campaign', icon: 'thumb-up', time: 'Yesterday', read: true, type: 'like' },
    { id: 'n4', title: 'New job posted matching your skills', subtitle: 'UI/UX Designer for Mobile App', icon: 'work', time: '2 days ago', read: true, type: 'job' },
    { id: 'n5', title: 'Welcome to the platform!', subtitle: 'Complete your profile to get started.', icon: 'waving-hand', time: '3 days ago', read: true, type: 'welcome' },
  ]));

  const clearAll = () => setItems(prev => prev.map(i => ({ ...i, read: true })));

  const colorFor = (t: NotificationItem['type']) => {
    switch (t) {
      case 'payment': return c.primary;
      case 'message': return c.primary;
      default: return c.subtext;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* App Bar */}
      <View style={[styles.appBar]}> 
        <View style={{ width: 40 }} />
        <Text style={[styles.title, { color: c.text }]}>Notifications</Text>
        <Text onPress={clearAll} style={[styles.clearAll, { color: c.primary }]}>Clear All</Text>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 96, gap: 8 }}>
        {items.map(n => {
          const iconBg = n.read ? (c.isDark ? '#3f3f46' : '#F4F4F5') : (c.isDark ? 'rgba(253,103,48,0.12)' : 'rgba(253,103,48,0.12)');
          const iconColor = n.read ? (c.isDark ? '#a1a1aa' : '#6B7280') : c.primary;
          return (
            <View key={n.id} style={[styles.row, { backgroundColor: c.card, borderColor: c.isDark ? '#2a2a2e' : '#E5E7EB' }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg, position: 'relative' }}>
                  <MaterialIcons name={n.icon} size={22} color={iconColor} />
                  {!n.read && (
                    <View style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary, borderWidth: 2, borderColor: c.card }} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: c.text, fontWeight: n.read ? '600' as any : '700' }]}>{n.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: c.subtext }]} numberOfLines={1}>{n.subtitle}</Text>
                </View>
              </View>
              <Text style={[styles.time, { color: c.subtext }]}>{n.time}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: { fontSize: 18, fontWeight: '700' },
  clearAll: { fontSize: 13, fontWeight: '700' },

  row: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: { fontSize: 14 },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  time: { fontSize: 11, marginLeft: 8 },
});

export default NotificationsScreen;
