import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

const RoleSelectScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [selected, setSelected] = useState<'client' | 'freelancer' | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <Text style={[styles.title, { color: c.text }]}>Select your role</Text>
          <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: c.card, borderColor: selected === 'client' ? c.primary : c.border }]}
            onPress={() => { setSelected('client'); navigation.navigate('Signup'); }}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconWrap, { backgroundColor: selected === 'client' ? c.primary + '22' : c.background, borderColor: c.border }]}>
                <MaterialIcons name="work-outline" size={22} color={selected === 'client' ? c.primary : c.subtext} />
              </View>
              <Text style={[styles.optionLabel, { color: c.text }]}>Client</Text>
            </View>
            <MaterialIcons
              name={selected === 'client' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selected === 'client' ? c.primary : c.subtext}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: c.card, borderColor: selected === 'freelancer' ? c.primary : c.border }]}
            onPress={() => { setSelected('freelancer'); navigation.navigate('Signup'); }}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconWrap, { backgroundColor: selected === 'freelancer' ? c.primary + '22' : c.background, borderColor: c.border }]}>
                <MaterialIcons name="person-outline" size={22} color={selected === 'freelancer' ? c.primary : c.subtext} />
              </View>
              <Text style={[styles.optionLabel, { color: c.text }]}>Freelancer</Text>
            </View>
            <MaterialIcons
              name={selected === 'freelancer' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selected === 'freelancer' ? c.primary : c.subtext}
            />
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  options: {
    gap: 12,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoleSelectScreen;

