import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  const [open, setOpen] = useState<{ [k: string]: boolean }>({ account: true });
  const toggle = (k: string) => setOpen(s => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={{ width: 48, height: 48, alignItems: 'flex-start', justifyContent: 'center' }}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Help & Support</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}> 
            <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginHorizontal: 12 }} />
            <TextInput
              placeholder="What can we help you with?"
              placeholderTextColor={c.subtext}
              style={{ flex: 1, color: c.text }}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {/* FAQ Headline */}
          <Text style={{ color: c.text, fontSize: 28, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12 }}>Frequently Asked Questions</Text>

          {/* Accordions */}
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            {/* Getting Started */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
              <TouchableOpacity onPress={() => toggle('getting')} style={styles.accordionHeader}>
                <Text style={[styles.accTitle, { color: c.text }]}>Getting Started</Text>
                <MaterialIcons name="expand-more" size={22} color={c.text} style={{ transform: [{ rotate: open['getting'] ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {open['getting'] && (
                <Text style={[styles.accBody, { color: c.subtext }]}>Here you'll find answers to common questions about setting up your freelancer profile, browsing jobs, and submitting your first proposal.</Text>
              )}
            </View>

            {/* Account & Profile (open by default) */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
              <TouchableOpacity onPress={() => toggle('account')} style={styles.accordionHeader}>
                <Text style={[styles.accTitle, { color: open['account'] ? c.primary : c.text }]}>
                  Account & Profile
                </Text>
                <MaterialIcons name="expand-more" size={22} color={open['account'] ? c.primary : c.text} style={{ transform: [{ rotate: open['account'] ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {open['account'] && (
                <View style={{ paddingBottom: 8 }}>
                  {['How do I verify my identity?', 'How can I reset my password?', 'Can I change my username?'].map(link => (
                    <TouchableOpacity key={link} style={styles.linkRow}>
                      <Text style={{ color: c.text }}>{link}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Finding Work */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
              <TouchableOpacity onPress={() => toggle('work')} style={styles.accordionHeader}>
                <Text style={[styles.accTitle, { color: c.text }]}>Finding Work</Text>
                <MaterialIcons name="expand-more" size={22} color={c.text} style={{ transform: [{ rotate: open['work'] ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {open['work'] && (
                <Text style={[styles.accBody, { color: c.subtext }]}>Discover how to effectively search for jobs, write winning proposals, and understand the client interview process.</Text>
              )}
            </View>

            {/* Managing Projects */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
              <TouchableOpacity onPress={() => toggle('projects')} style={styles.accordionHeader}>
                <Text style={[styles.accTitle, { color: c.text }]}>Managing Projects</Text>
                <MaterialIcons name="expand-more" size={22} color={c.text} style={{ transform: [{ rotate: open['projects'] ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {open['projects'] && (
                <Text style={[styles.accBody, { color: c.subtext }]}>Learn about project milestones, communication with clients, submitting deliverables, and handling project disputes.</Text>
              )}
            </View>

            {/* Payments & Billing */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }}>
              <TouchableOpacity onPress={() => toggle('payments')} style={styles.accordionHeader}>
                <Text style={[styles.accTitle, { color: c.text }]}>Payments & Billing</Text>
                <MaterialIcons name="expand-more" size={22} color={c.text} style={{ transform: [{ rotate: open['payments'] ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {open['payments'] && (
                <View style={{ paddingBottom: 8 }}>
                  {['What are the service fees?', 'How do I withdraw my earnings?'].map(link => (
                    <TouchableOpacity key={link} style={styles.linkRow}>
                      <Text style={{ color: c.text }}>{link}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Contact Button */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: c.primary }]} onPress={() => navigation.navigate('ContactSupport')}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Still need help? Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNav
          activeKey="profile"
          onChange={(key) => {
            if (key === 'home') return navigation.navigate('Dashboard');
            if (key === 'jobs') return navigation.navigate('Dashboard');
            if (key === 'profile') return; // already here as support entry under profile
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchWrap: { height: 56, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  accordionHeader: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accTitle: { fontSize: 14, fontWeight: '700' },
  accBody: { fontSize: 13, lineHeight: 20, paddingBottom: 8 },
  linkRow: { paddingVertical: 6 },
  contactBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

export default HelpSupportScreen;
