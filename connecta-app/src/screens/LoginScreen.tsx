import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';

interface LoginScreenProps {
  onSignedIn?: () => void;
  onSignup?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, onSignup }) => {
  const c = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}> 
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.center}> 
        <View style={[styles.logoWrap, { backgroundColor: c.card }]}> 
          <Logo size={40} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Welcome back!</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>Sign in to continue your journey.</Text>

        <View style={styles.form}> 
          <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}> 
            <MaterialIcons name="mail-outline" size={20} color={c.subtext} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}> 
            <MaterialIcons name="lock-outline" size={20} color={c.subtext} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={onSignedIn} activeOpacity={0.9} style={[styles.primaryBtn, { backgroundColor: c.primary }]}> 
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}> 
          <View style={[styles.divider, { borderColor: c.border }]} />
          <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
          <View style={[styles.divider, { borderColor: c.border }]} />
        </View>

        <TouchableOpacity activeOpacity={0.9} style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.card }]}> 
          <MaterialCommunityIcons name="google" size={20} color={c.text} />
          <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}> 
        <Text style={[styles.footerText, { color: c.subtext }]}>Don't have an account?</Text>
        <TouchableOpacity onPress={onSignup} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.footerLink, { color: c.primary }]}>Sign Up</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  divider: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
  },
  googleBtn: {
    width: '100%',
    maxWidth: 360,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
