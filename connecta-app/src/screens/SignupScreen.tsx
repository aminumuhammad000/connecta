import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import { resendVerification } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const SignupScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const { signup, googleSignup } = useAuth();
  const { showAlert } = useInAppAlert();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer'>('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
    iosClientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
    androidClientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@0x_mrcoder/connecta',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignup(id_token);
    }
  }, [response]);

  const handleGoogleSignup = async (token: string) => {
    setIsLoading(true);
    try {
      const autoLogin = selectedRole === 'client';
      const response = await googleSignup(token, selectedRole, autoLogin);

      if (selectedRole === 'freelancer') {
        // For Google signup, send to Skills
        (navigation as any).navigate('SkillSelection', { token: response.token, user: response.user });
      } else {
        showAlert({ title: 'Success', message: 'Account created with Google!', type: 'success' });
      }
    } catch (error: any) {
      showAlert({ title: 'Google Signup Failed', message: error.message || 'Failed to sign up with Google', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!name.trim()) return showAlert({ title: 'Error', message: 'Please enter your full name', type: 'error' });
    if (!email.trim()) return showAlert({ title: 'Error', message: 'Please enter your email', type: 'error' });
    if (!password.trim() || password.length < 6) return showAlert({ title: 'Error', message: 'Password must be at least 6 characters', type: 'error' });

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const autoLogin = true; // Always login to get token for verification

      // Create account
      await signup({
        email: email.trim(),
        password,
        firstName,
        lastName,
        userType: selectedRole,
      }, autoLogin);

      // Removed automatic resend to prevent invalidating the signup OTP

      showAlert({ title: 'Success', message: 'Account created! Please verify your email.', type: 'success' });
      (navigation as any).navigate('OTPVerification', {
        email: email.trim(),
        mode: 'signup',
        role: selectedRole
      });
    } catch (error: any) {
      showAlert({ title: 'Signup Failed', message: error.message || 'Failed to create account', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignupForm = () => (
    <View style={[styles.mainContent, isDesktop && styles.desktopFormContent]}>

      {/* Mobile Header: Logo + Title */}
      {!isDesktop && (
        <View style={styles.topSection}>
          <View style={[styles.logoWrap, { backgroundColor: c.card }]}>
            <Logo size={42} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>Join Connecta today.</Text>
        </View>
      )}

      {/* Desktop Header: Just Title */}
      {isDesktop && (
        <View style={styles.desktopHeader}>
          <Text style={[styles.title, { color: c.text, fontSize: 32 }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>Join Connecta today.</Text>
        </View>
      )}

      {/* Role Switcher */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleBtn,
            selectedRole === 'freelancer' && { backgroundColor: c.primary, borderColor: c.primary },
            selectedRole !== 'freelancer' && { borderColor: c.border, backgroundColor: c.card }
          ]}
          onPress={() => setSelectedRole('freelancer')}
        >
          <Text style={[
            styles.roleText,
            { color: selectedRole === 'freelancer' ? '#fff' : c.subtext }
          ]}>Freelancer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleBtn,
            selectedRole === 'client' && { backgroundColor: c.primary, borderColor: c.primary },
            selectedRole !== 'client' && { borderColor: c.border, backgroundColor: c.card }
          ]}
          onPress={() => setSelectedRole('client')}
        >
          <Text style={[
            styles.roleText,
            { color: selectedRole === 'client' ? '#fff' : c.subtext }
          ]}>Client</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          icon="person-outline"
          containerStyle={styles.inputSpacing}
        />
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address"
          keyboardType="email-address"
          containerStyle={styles.inputSpacing}
          autoCapitalize="none"
          icon="mail-outline"
        />
        <View style={styles.inputSpacing}>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            icon="lock-outline"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title="Sign Up"
        onPress={handleCreateAccount}
        loading={isLoading}
        variant="primary"
        size="large"
        style={styles.mainBtn}
      />

      {/* Social Login */}
      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.background }]}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <MaterialCommunityIcons name="google" size={20} color={c.text} />
        <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.subtext }]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
          <Text style={{ color: c.primary, fontWeight: '700' }}>Log In</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  if (isDesktop) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
        <StatusBar barStyle="dark-content" />
        <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => { }, setThemeMode: () => { }, themeMode: 'light' }}>
          <View style={styles.desktopContainer}>
            {/* Left Panel - Hero (LIGHT THEMED) */}
            <LinearGradient
              colors={['#ffffff', '#f0f5ff']}
              style={styles.desktopHero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLogoWrap}>
                  {/* Show original logo without tint */}
                  <Logo size={120} />
                </View>
                <Text style={[styles.heroTitle, { color: '#1a1a1a' }]}>Connecta</Text>
                <Text style={[styles.heroSubtitle, { color: '#555' }]}>
                  Join the future of work.{'\n'}Client or Freelancer, we have you covered.
                </Text>
              </View>
              <View style={styles.heroFooter}>
                <Text style={[styles.heroFooterText, { color: '#999' }]}>© 2026 Connecta Global</Text>
              </View>
            </LinearGradient>

            {/* Right Panel - Signup Form */}
            <View style={styles.desktopRightPanel}>
              <View style={styles.desktopCard}>
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                  showsVerticalScrollIndicator={false}
                >
                  {renderSignupForm()}
                </ScrollView>
              </View>
            </View>
          </View>
        </ThemeContext.Provider>
      </SafeAreaView>
    );
  }

  // MOBILE VIEW
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header Back Btn */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderSignupForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    paddingVertical: 10,
    width: '100%',
  },
  // Desktop Styles
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  desktopHero: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
    position: 'relative',
  },
  heroContent: {
    maxWidth: 600,
  },
  heroLogoWrap: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '500',
  },
  heroFooter: {
    position: 'absolute',
    bottom: 40,
    left: 60,
  },
  heroFooterText: {
    fontSize: 14,
  },
  desktopRightPanel: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  desktopCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 40,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    maxHeight: '90%',
  },
  desktopFormContent: {
    paddingVertical: 0,
  },
  desktopHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  // Common Styles
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  mainBtn: {
    borderRadius: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 14,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
  },
});

export default SignupScreen;
