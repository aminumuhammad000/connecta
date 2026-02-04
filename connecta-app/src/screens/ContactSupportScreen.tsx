import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ContactSupportScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

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

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Contact Options */}
          <View style={{ gap: 12 }}>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  h1: { fontSize: 18, fontWeight: '600' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
});

export default ContactSupportScreen;
