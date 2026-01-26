import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRole } from '../context/RoleContext';

const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const { role } = useRole();

  const [open, setOpen] = useState<{ [k: string]: boolean }>({ account: true });
  const toggle = (k: string) => setOpen(s => ({ ...s, [k]: !s[k] }));

  const handleContact = async (type: 'whatsapp' | 'email' | 'call') => {
    try {
      switch (type) {
        case 'whatsapp':
          await Linking.openURL('whatsapp://send?phone=2348128655555');
          break;
        case 'email':
          await Linking.openURL('mailto:support@myconnecta.ng');
          break;
        case 'call':
          await Linking.openURL('tel:08128655555');
          break;
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={{ width: 48, height: 48, alignItems: 'flex-start', justifyContent: 'center' }}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '600' }}>Help & Support</Text>
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
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12 }}>Frequently Asked Questions</Text>

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

          {/* Contact Options */}
          <View style={{ paddingHorizontal: 16, paddingTop: 24, gap: 12 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>Contact Us</Text>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('whatsapp')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#25D36620' }]}>
                <MaterialIcons name="chat" size={24} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>WhatsApp</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>Chat with our support team</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.iconBox, { backgroundColor: c.primary + '20' }]}>
                <MaterialIcons name="email" size={24} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>Email</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>support@myconnecta.ng</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('call')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#3B82F620' }]}>
                <MaterialIcons name="call" size={24} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>Call Us</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>08128655555</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchWrap: { height: 56, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  accordionHeader: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accTitle: { fontSize: 14, fontWeight: '600' },
  accBody: { fontSize: 13, lineHeight: 20, paddingBottom: 8 },
  linkRow: { paddingVertical: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
});

export default HelpSupportScreen;
