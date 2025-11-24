import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';

const JobDetailScreen: React.FC = () => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const fullDescription = "We are looking for a talented and experienced Senior UX/UI Designer to lead the design of our new flagship mobile application. You will be responsible for the entire design process, from user research and wireframing to creating high-fidelity mockups and interactive prototypes. The ideal candidate will have a strong portfolio showcasing mobile app designs, excellent communication skills, and the ability to work collaboratively with cross-functional teams.";
  const shortDescription = "We are looking for a talented and experienced Senior UX/UI Designer to lead the design of our new flagship mobile application. You will be responsible for the entire design process, from user research and wireframing to creating high-fidelity mockups and interactive prototypes...";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: c.text }]}>Job Details</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Save"
          onPress={() => setIsSaved(!isSaved)}
        >
          <MaterialIcons
            name={isSaved ? "bookmark" : "bookmark-border"}
            size={22}
            color={isSaved ? c.primary : c.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <Text style={[styles.title, { color: c.text }]}>Senior UX/UI Designer for Mobile App</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            <Text style={{ color: c.subtext, fontSize: 12 }}>Posted by WebFlow ★ 4.8</Text>
            <Text style={{ color: c.subtext, fontSize: 12 }}>Posted 2 hours ago</Text>
          </View>

          {/* Key Info */}
          <View style={[styles.keyInfoWrap, { borderTopColor: c.border, borderBottomColor: c.border }]}>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Budget</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>$5,000</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Duration</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>1-3 Months</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Experience</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>Expert</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Location</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>Remote (US)</Text>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Job Description</Text>
            <Text style={{ color: c.subtext, lineHeight: 18, fontSize: 13 }}>
              {isExpanded ? fullDescription : shortDescription}
              {!isExpanded && (
                <Text
                  style={{ color: c.primary, fontWeight: '600' }}
                  onPress={() => setIsExpanded(true)}
                >
                  {' '}Read More
                </Text>
              )}
            </Text>
          </View>

          {/* Skills */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Required Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['UX Design', 'UI Design', 'Figma', 'Prototyping', 'Mobile App Design'].map(s => (
                <Text key={s} style={[styles.skill, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.15)' : 'rgba(253,103,48,0.08)' }]}>{s}</Text>
              ))}
            </View>
          </View>

          {/* Client */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>About the Client</Text>
            <View style={[styles.clientCard, { borderColor: c.border, backgroundColor: c.card }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNttYGpLWFCHyqSkmyj2QMKiPcO-haGRcyAY9WKxoOJO1axYFTrgC_u2_qZ-tlP_coX-Zv5V69Rf_HE8htwMGyXGnepVy6KffYfx4F5UXj06VGZm4qae6NArCEoIKRk8tS-9yAbR_IL74gQjtVj5lAdEBt44fWX1R_X77uUeg9FRICz6FjysLffUrBFeZIObcNgSnfS0H5O9Qv4OeV2lzMm62dLkHxGFfi7ZGTtX-EZeSmZlBU-x7yKdHIRHwWffdcf2h15iFteE' }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: c.text }]}>Eleanor Vance</Text>
                <Text style={{ color: c.subtext, fontSize: 11 }}>San Francisco, CA</Text>
                <Text style={{ color: c.subtext, fontSize: 10, marginTop: 4 }}>15 Jobs Posted • Member Since 2022</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </View>
          </View>

          {/* Attachments */}
          <View style={{ marginTop: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Attachments</Text>
            <View style={{ gap: 8 }}>
              <View style={[styles.attachment, { borderColor: c.border }]}>
                <MaterialIcons name="description" size={20} color={c.primary} />
                <Text style={[styles.attachmentLabel, { color: c.text }]}>Project_Brief_v2.pdf</Text>
                <MaterialIcons name="download" size={20} color={c.subtext} />
              </View>
              <View style={[styles.attachment, { borderColor: c.border }]}>
                <MaterialIcons name="image" size={20} color={c.primary} />
                <Text style={[styles.attachmentLabel, { color: c.text }]}>Brand_Guidelines.png</Text>
                <MaterialIcons name="download" size={20} color={c.subtext} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
        <TouchableOpacity style={[styles.applyBtn, { backgroundColor: c.primary }]}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  appBarTitle: { fontSize: 16, fontWeight: '600' },

  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

  keyInfoWrap: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyInfoItem: { width: '50%', paddingVertical: 14 },
  keyLabel: { fontSize: 11, fontWeight: '500' },
  keyValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  skill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 11, fontWeight: '500' },

  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  clientName: { fontSize: 14, fontWeight: '600' },

  attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  attachmentLabel: { flex: 1, fontSize: 13, fontWeight: '500' },

  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 8 },
  applyBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default JobDetailScreen;
