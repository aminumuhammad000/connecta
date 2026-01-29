import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image, useWindowDimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import { resendVerification } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const nameInputScale = useRef(new Animated.Value(1)).current;
  const emailInputScale = useRef(new Animated.Value(1)).current;
  const passwordInputScale = useRef(new Animated.Value(1)).current;
  const roleAnimFreelancer = useRef(new Animated.Value(1)).current;
  const roleAnimClient = useRef(new Animated.Value(1)).current;

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const autoLogin = selectedRole === 'client';
      const response = await googleSignup(token, selectedRole, autoLogin);

      if (selectedRole === 'freelancer') {
        // For Google signup, send to Skills
        (navigation as any).navigate('SkillSelection', { token: response.token, user: response.user });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert({ title: 'Success', message: 'Account created with Google!', type: 'success' });
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({ title: 'Google Signup Failed', message: error.message || 'Failed to sign up with Google', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    // Validation with shake animations
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(nameInputScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(nameInputScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(nameInputScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return showAlert({ title: 'Error', message: 'Please enter your full name', type: 'error' });
    }

    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(emailInputScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(emailInputScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(emailInputScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return showAlert({ title: 'Error', message: 'Please enter your email', type: 'error' });
    }

    if (!password.trim() || password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(passwordInputScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(passwordInputScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(passwordInputScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return showAlert({ title: 'Error', message: 'Password must be at least 6 characters', type: 'error' });
    }

    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const autoLogin = true;

      await signup({
        email: email.trim(),
        password,
        firstName,
        lastName,
        userType: selectedRole,
      }, autoLogin);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert({ title: 'Success', message: 'Account created! Please verify your email.', type: 'success' });
      (navigation as any).navigate('OTPVerification', {
        email: email.trim(),
        mode: 'signup',
        role: selectedRole
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({ title: 'Signup Failed', message: error.message || 'Failed to create account', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: 'client' | 'freelancer') => {
    Haptics.selectionAsync();
    setSelectedRole(role);

    // Animate the selected role
    const targetAnim = role === 'freelancer' ? roleAnimFreelancer : roleAnimClient;
    Animated.sequence([
      Animated.spring(targetAnim, { toValue: 1.05, friction: 4, useNativeDriver: true }),
      Animated.spring(targetAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handlePasswordToggle = () => {
    Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleGooglePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    promptAsync();
  };

  const renderSignupForm = () => (
    <Animated.View
      style={[
        styles.mainContent,
        isDesktop && styles.desktopFormContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >

      {/* Mobile Header: Logo + Title */}
      {!isDesktop && (
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.logoWrap,
              { backgroundColor: c.card },
              {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            <Logo size={42} />
          </Animated.View>
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
        <Animated.View style={{ flex: 1, transform: [{ scale: roleAnimFreelancer }] }}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'freelancer' && { backgroundColor: c.primary, borderColor: c.primary },
              selectedRole !== 'freelancer' && { borderColor: c.border, backgroundColor: c.card }
            ]}
            onPress={() => handleRoleSelect('freelancer')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.roleText,
              { color: selectedRole === 'freelancer' ? '#fff' : c.subtext }
            ]}>Freelancer</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ flex: 1, transform: [{ scale: roleAnimClient }] }}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'client' && { backgroundColor: c.primary, borderColor: c.primary },
              selectedRole !== 'client' && { borderColor: c.border, backgroundColor: c.card }
            ]}
            onPress={() => handleRoleSelect('client')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.roleText,
              { color: selectedRole === 'client' ? '#fff' : c.subtext }
            ]}>Client</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Animated.View style={[styles.inputContainer, { transform: [{ scale: nameInputScale }] }]}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            icon="person-outline"
            containerStyle={styles.inputSpacing}
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, { transform: [{ scale: emailInputScale }] }]}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            keyboardType="email-address"
            containerStyle={styles.inputSpacing}
            autoCapitalize="none"
            icon="mail-outline"
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, { transform: [{ scale: passwordInputScale }] }]}>
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
              onPress={handlePasswordToggle}
              activeOpacity={0.7}
            >
              <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Button
          title="Sign Up"
          onPress={handleCreateAccount}
          loading={isLoading}
          variant="primary"
          size="large"
          style={styles.mainBtn}
        />
      </Animated.View>

      {/* Social Login */}
      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.background }]}
        onPress={handleGooglePress}
        disabled={!request}
      >
        <MaterialCommunityIcons name="google" size={20} color={c.text} />
        <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.subtext }]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          (navigation as any).navigate('Login');
        }}>
          <Text style={{ color: c.primary, fontWeight: '700' }}>Log In</Text>
        </TouchableOpacity>
      </View>

    </Animated.View>
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
          <TouchableOpacity onPress={handleBackPress} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
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
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
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
    marginBottom: 28,
  },
  logoWrap: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#FD6730',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
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
    borderRadius: 14,
    shadowColor: '#FD6730',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
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
