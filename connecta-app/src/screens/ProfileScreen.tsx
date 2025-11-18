import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { backgroundColor: c.card }]}> 
        <Text style={[styles.appBarTitle, { color: c.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: c.primary }]}> 
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Profile Header */}
        <View style={[styles.headerCard, { backgroundColor: c.card }]}> 
          <View style={styles.headerContent}> 
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHAtdQiUgt2BKEOZ74E88IdnTkPeT872UYB4CRTnNZVaX9Ceane9jsutA5LDIBHIUdm-5YaTJV4g5T-KHx51RbZz9GJtCHNjzvjKNgl4ROoSrxQ8wS8E9_EnRblUVQCBri1V-SVrGlF0fNJpV7iEUfgALZdUdSdEK4x4ZXjniKd-62zI6B_VrhpemzmR97eKrBJcyf4BR8vBgXnyRjJYOdIBjiU6bIA0jni9splDm26Qo2-6GEWsXBbCJoWJtxiNGW67rtsOuA-Wc' }}
              style={styles.avatar}
            />
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.name, { color: c.text }]}>Alexandre Dupont</Text>
              <Text style={[styles.role, { color: c.subtext }]}>UI/UX Designer</Text>
              <View style={styles.locationRow}> 
                <MaterialIcons name="location-on" size={16} color={c.subtext} />
                <Text style={[styles.location, { color: c.subtext }]}>Paris, France</Text>
              </View>
            </View>
            <View style={[styles.availability, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}> 
              <View style={[styles.dot, { backgroundColor: c.primary }]} />
              <Text style={[styles.availabilityText, { color: c.primary }]}>Available for hire</Text>
            </View>
          </View>
        </View>

        {/* Tabs (static visual) */}
        <View style={[styles.tabsBar, { backgroundColor: c.card, borderBottomColor: c.border }]}> 
          <View style={styles.tabsInner}> 
            <View style={[styles.tabItemActive, { borderBottomColor: c.primary }]}> 
              <Text style={[styles.tabTextActive, { color: c.primary }]}>About</Text>
            </View>
            <View style={styles.tabItem}> 
              <Text style={[styles.tabText, { color: c.subtext }]}>Portfolio</Text>
            </View>
            <View style={styles.tabItem}> 
              <Text style={[styles.tabText, { color: c.subtext }]}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* About Card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
          <Text style={[styles.cardTitle, { color: c.text }]}>About</Text>
          <Text style={[styles.paragraph, { color: c.text }]}>A passionate UI/UX designer with over 5 years of experience in creating intuitive and engaging digital products. I specialize in mobile app design and user-centered design methodologies.</Text>
        </View>

        {/* Skills */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
          <Text style={[styles.cardTitle, { color: c.text }]}>Skills</Text>
          <View style={styles.skillsRow}> 
            {['UI Design', 'UX Research', 'Prototyping', 'Figma', 'Design Systems'].map(s => (
              <Text key={s} style={[styles.skillChip, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>
                {s}
              </Text>
            ))}
          </View>
        </View>

        {/* Work Experience */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
          <Text style={[styles.cardTitle, { color: c.text }]}>Work Experience</Text>
          <View style={[styles.timeline, { borderLeftColor: c.border }]}> 
            <View style={styles.tlItem}> 
              <View style={[styles.tlDot, { backgroundColor: c.primary }]} />
              <Text style={[styles.tlTitle, { color: c.text }]}>Senior Product Designer</Text>
              <Text style={[styles.tlOrg, { color: c.subtext }]}>Innovatech Solutions</Text>
              <Text style={[styles.tlTime, { color: c.subtext }]}>2021 - Present</Text>
            </View>
            <View style={styles.tlItem}> 
              <View style={[styles.tlDot, { backgroundColor: c.border }]} />
              <Text style={[styles.tlTitle, { color: c.text }]}>UI/UX Designer</Text>
              <Text style={[styles.tlOrg, { color: c.subtext }]}>Creative Minds Agency</Text>
              <Text style={[styles.tlTime, { color: c.subtext }]}>2018 - 2021</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editBtn: {
    minWidth: 84,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerCard: {
    padding: 16,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
  },
  availability: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: 13, fontWeight: '700' },

  tabsBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabsInner: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabTextActive: { fontSize: 14, fontWeight: '800' },
  tabText: { fontSize: 14, fontWeight: '800' },

  card: {
    marginTop: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  paragraph: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '700',
  },
  timeline: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    gap: 12,
  },
  tlItem: { position: 'relative' },
  tlDot: {
    position: 'absolute',
    left: -14,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tlTitle: { fontSize: 14, fontWeight: '700' },
  tlOrg: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  tlTime: { fontSize: 11, marginTop: 2 },
});

export default ProfileScreen;
