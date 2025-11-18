import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  name: string;
  onNotificationsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ name, onNotificationsPress }) => {
  const c = useThemeColors();
  return (
    <View style={[styles.container]}> 
      <View style={styles.leftRow}>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnwAthF1Kz5qMghW3pBO4wBoSQTPILgusvMdPP_6dw67g_3UpcARft_5eN0_DOcArus6K4sVNl73y84IPFkb_VwS3rYpKuyxbXpI-_vBUAR5yd6_gZSeo-sQZ-AWoQLaNer3mp-BwWR9k2ZCUGm76CnYQDsZ3fIAy6Nz0Pm_sn2J2wTVgEVYQc-eOmUkYvPJICexImTjQKVIMsngjD83I2UvC6sxUqf8bVcc4-EoAskhXPLI65cN9a3GJI0ryTU91f5k1taCdc0RA' }}
          style={styles.avatar}
        />
        <View>
          <Text style={[styles.welcome, { color: c.subtext }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: c.text }]}>{name}</Text>
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
