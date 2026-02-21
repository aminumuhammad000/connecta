import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface ActiveJobCardProps {
  title: string;
  due: string;
  price: string;
  progress: number; // 0..1
}

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({ title, due, price, progress }) => {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, shadowColor: c.text }]}> 
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>{title}</Text>
          <Text style={[styles.due, { color: c.subtext }]}>Due in {due}</Text>
        </View>
        <Text style={[styles.price, { color: c.primary }]}>{price}</Text>
      </View>
      <View style={styles.progressWrap}>
        <Text style={[styles.progressLabel, { color: c.subtext }]}>Progress</Text>
        <View style={[styles.track, { backgroundColor: c.border }]}> 
          <View style={[styles.fill, { backgroundColor: c.primary, width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  due: {
    marginTop: 4,
    fontSize: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressWrap: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 999,
  },
});

export default ActiveJobCard;
