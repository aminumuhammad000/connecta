import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';

const SignupScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}> 
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.center}> 
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.logoWrap, { backgroundColor: c.card }]}> 
          <Logo size={40} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>Join Connecta to find projects and talent.</Text>

        <View style={styles.form}> 
          <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}> 
            <MaterialIcons name="person-outline" size={20} color={c.subtext} style={styles.inputIcon} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
            />
          </View>
          <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}> 
            <MaterialIcons name="mail-outline" size={20} color={c.subtext} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
            />
          </View>
          <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}> 
            <MaterialIcons name="lock-outline" size={20} color={c.subtext} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={c.subtext}
              secureTextEntry
              style={[styles.input, { color: c.text }]}
            />
          </View>

          <TouchableOpacity activeOpacity={0.9} style={[styles.primaryBtn, { backgroundColor: c.primary }]}> 
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: c.subtext }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Login')} accessibilityRole="button" accessibilityLabel="Go to Login">
            <Text style={[styles.footerLink, { color: c.primary }]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoWrap: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  backRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    maxWidth: 360,
    marginTop: 24,
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SignupScreen;
