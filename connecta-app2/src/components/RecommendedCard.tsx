import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useThemeColors, palette } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface RecommendedCardProps {
  title: string;
  subtitle: string;
  logoUri: string;
  saved?: boolean;
  onToggleSave?: () => void;
}

export const RecommendedCard: React.FC<RecommendedCardProps> = ({ title, subtitle, logoUri, saved, onToggleSave }) => {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card }]}> 
      <View style={[styles.logoWrap, { backgroundColor: `${palette.primary}1A` }]}> 
        <Image source={{ uri: logoUri }} style={{ width: 24, height: 24 }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>{subtitle}</Text>
      </View>
      <TouchableOpacity onPress={onToggleSave} accessibilityRole="button" accessibilityLabel={saved ? 'Unsave' : 'Save'}>
        <MaterialIcons name={saved ? 'bookmark' : 'bookmark-border'} size={24} color={saved ? c.primary : c.subtext} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
  },
  logoWrap: {
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default RecommendedCard;
