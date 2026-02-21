import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Item {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

interface BottomNavProps {
  activeKey: string;
  onChange?: (key: string) => void;
}

const ITEMS: Item[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'jobs', label: 'Project', icon: 'work-outline' },
  { key: 'messages', label: 'Message', icon: 'chat-bubble-outline' },
  { key: 'profile', label: 'Profile', icon: 'account-circle' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeKey, onChange }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const padBottom = Math.min(insets.bottom, 6);
  return (
    <View style={[styles.wrap, { borderTopColor: c.border, backgroundColor: c.card, paddingBottom: padBottom }]}>
      {ITEMS.map(it => {
        const active = it.key === activeKey;
        return (
          <TouchableOpacity key={it.key} style={styles.item} onPress={() => onChange?.(it.key)}>
            <MaterialIcons name={active ? (it.icon === 'work-outline' ? 'work' : it.icon === 'chat-bubble-outline' ? 'chat-bubble' : it.icon) : it.icon} size={22} color={active ? c.primary : c.subtext} />
            <Text style={[styles.label, { color: active ? c.primary : c.subtext }]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default BottomNav;
