import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';

interface LoginScreenProps {
  onSignedIn?: () => void;
  onSignup?: () => void;
  onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, onSignup, onForgotPassword }) => {
  const c = useThemeColors();
  const { login } = useAuth();
  const { showAlert } = useInAppAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      showAlert({ title: 'Error', message: 'Please enter both email and password', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      showAlert({ title: 'Success', message: 'Logged in successfully!', type: 'success' });
      // Navigation will happen automatically via AuthContext
      onSignedIn?.();
    } catch (error: any) {
      showAlert({ title: 'Login Failed', message: error.message || 'Invalid email or password', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.center}>
            <View style={[styles.logoWrap, { backgroundColor: c.card, shadowColor: c.primary }]}>
              <Logo size={48} />
            </View>
            <Text style={[styles.title, { color: c.text }]}>Welcome back!</Text>
            <Text style={[styles.subtitle, { color: c.subtext }]}>Sign in to continue your journey.</Text>

            <View style={styles.form}>
              <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }]}>
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

              <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }]}>
                <MaterialIcons name="lock-outline" size={20} color={c.subtext} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={c.subtext}
                  style={[styles.input, { color: c.text }]}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={c.subtext}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: c.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.9}
                style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: isLoading ? 0.7 : 1 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
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
    paddingHorizontal: 24,
  },
  logoWrap: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 28,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    maxWidth: 380,
    marginTop: 32,
    gap: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 14,
  },
  divider: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  googleBtn: {
    width: '100%',
    maxWidth: 380,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginScreen;
