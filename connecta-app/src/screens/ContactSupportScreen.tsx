import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ContactSupportScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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
        <View style={[styles.appBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: c.text }]}>Contact Support</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Contact Options */}
          <View style={{ marginBottom: 24, gap: 12 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>Get in Touch</Text>

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

          <Text style={{ color: c.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Send a Message</Text>

          {/* Subject */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: c.text }]}>Subject</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Issue with my payment"
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
            />
          </View>

          {/* Category (simple select) */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: c.text }]}>Category</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                // simple cycle through for demo without external picker
                const options = [null, 'Technical Issue', 'Billing', 'General Feedback'];
                const idx = options.indexOf(category);
                const next = options[(idx + 1) % options.length];
                setCategory(next);
              }}
              style={[styles.input, { borderColor: c.border, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            >
              <Text style={{ color: category ? c.text : c.subtext }}>
                {category || 'Select a category'}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: c.text }]}>Message</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor={c.subtext}
              style={[styles.textarea, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
              multiline
            />
          </View>

          {/* Attachments */}
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.label, { color: c.text }]}>Attachments</Text>
            <View style={[styles.attachRow, { borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>Add files (screenshots, documents, etc.)</Text>
                <Text style={{ color: c.subtext, fontSize: 11 }}>Max file size: 5MB</Text>
              </View>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: c.primary + '33' }]}>
                <MaterialIcons name="attach-file" size={16} color={c.primary} />
                <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Example attached file */}
            <View style={[styles.fileRow, { backgroundColor: c.primary + '1A' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <MaterialIcons name="description" size={20} color={c.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>billing_statement_dec.pdf</Text>
                  <Text style={{ color: c.subtext, fontSize: 11 }}>128 KB</Text>
                </View>
              </View>
              <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="close" size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Note */}
          <View style={{ marginTop: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <MaterialIcons name="lock" size={16} color={c.isDark ? '#34D399' : '#059669'} />
            <Text style={{ color: c.subtext, fontSize: 12 }}>Your information is securely transmitted.</Text>
          </View>

          {/* Submit */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: c.primary }]}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  h1: { fontSize: 18, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 56, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 12 },
  textarea: { minHeight: 140, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 12, paddingTop: 12, textAlignVertical: 'top' },
  attachRow: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, flexDirection: 'row', gap: 6 },
  fileRow: { marginTop: 10, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  submitBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
});

export default ContactSupportScreen;
