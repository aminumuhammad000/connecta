import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNotificationsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationsPress }) => {
  const c = useThemeColors();
  const { user } = useAuth();

  return (
    <View style={[styles.container]}>
      <View style={styles.leftRow}>
        <Avatar
          uri={user?.profileImage || user?.avatar}
          name={user?.firstName}
          size={40}
        />
        <View>
          <Text style={[styles.welcome, { color: c.subtext }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: c.text }]}>{user?.firstName || 'User'}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onNotificationsPress} style={styles.bell} accessibilityRole="button" accessibilityLabel="Notifications">
        <MaterialIcons name="notifications-none" size={24} color={c.subtext} />
        <View style={[styles.badge, { backgroundColor: c.primary }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    marginRight: 12,
  },
  welcome: {
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  bell: {
    position: 'relative',
    padding: 8,
    borderRadius: 999,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});

export default Header;
