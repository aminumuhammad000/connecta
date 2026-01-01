import React, { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';

WebBrowser.maybeCompleteAuthSession();

const SignupScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const { signup, googleSignup } = useAuth();
  const { showAlert } = useInAppAlert();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com',
    iosClientId: '573187536896-3r6b17udvgmati90l2edq3mo9af98s4e.apps.googleusercontent.com', // Using web client ID as placeholder if specific iOS ID not provided
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
      await googleSignup(token, selectedRole);
      showAlert({ title: 'Success', message: 'Account created with Google!', type: 'success' });
      // Navigation happens automatically
    } catch (error: any) {
      showAlert({ title: 'Google Signup Failed', message: error.message || 'Failed to sign up with Google', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!name.trim()) {
      showAlert({ title: 'Error', message: 'Please enter your full name', type: 'error' });
      return;
    }
    if (!email.trim()) {
      showAlert({ title: 'Error', message: 'Please enter your email', type: 'error' });
      return;
    }
    if (!password.trim() || password.length < 6) {
      showAlert({ title: 'Error', message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await signup({
        email: email.trim(),
        password,
        firstName,
        lastName,
        userType: selectedRole,
      });
      showAlert({ title: 'Success', message: 'Account created successfully!', type: 'success' });
      // Navigation will happen automatically via AuthContext
    } catch (error: any) {
      showAlert({ title: 'Signup Failed', message: error.message || 'Failed to create account', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={[styles.roleLabel, { color: c.text }]}>I want to:</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      {
                        backgroundColor: selectedRole === 'client' ? c.primary + '15' : c.card,
                        borderColor: selectedRole === 'client' ? c.primary : c.border
                      }
                    ]}
                    onPress={() => setSelectedRole('client')}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.roleIconWrap,
                      {
                        backgroundColor: selectedRole === 'client' ? c.primary : c.background,
                      }
                    ]}>
                      <MaterialIcons
                        name="work-outline"
                        size={20}
                        color={selectedRole === 'client' ? '#fff' : c.subtext}
                      />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text style={[
                        styles.roleTitle,
                        { color: selectedRole === 'client' ? c.primary : c.text }
                      ]}>
                        Hire Talent
                      </Text>
                      <Text style={[styles.roleDesc, { color: c.subtext }]}>
                        Post jobs & find freelancers
                      </Text>
                    </View>
                    <MaterialIcons
                      name={selectedRole === 'client' ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={22}
                      color={selectedRole === 'client' ? c.primary : c.subtext}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      {
                        backgroundColor: selectedRole === 'freelancer' ? c.primary + '15' : c.card,
                        borderColor: selectedRole === 'freelancer' ? c.primary : c.border
                      }
                    ]}
                    onPress={() => setSelectedRole('freelancer')}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.roleIconWrap,
                      {
                        backgroundColor: selectedRole === 'freelancer' ? c.primary : c.background,
                      }
                    ]}>
                      <MaterialIcons
                        name="person-outline"
                        size={20}
                        color={selectedRole === 'freelancer' ? '#fff' : c.subtext}
                      />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text style={[
                        styles.roleTitle,
                        { color: selectedRole === 'freelancer' ? c.primary : c.text }
                      ]}>
                        Find Work
                      </Text>
                      <Text style={[styles.roleDesc, { color: c.subtext }]}>
                        Browse jobs & get hired
                      </Text>
                    </View>
                    <MaterialIcons
                      name={selectedRole === 'freelancer' ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={22}
                      color={selectedRole === 'freelancer' ? c.primary : c.subtext}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form Inputs */}
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
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: c.text }]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={c.subtext}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleCreateAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { borderColor: c.border }]} />
              <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
              <View style={[styles.divider, { borderColor: c.border }]} />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.background }]}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <MaterialCommunityIcons name="google" size={20} color={c.text} />
              <Text style={[styles.googleText, { color: c.text }]}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: c.subtext }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Login')} accessibilityRole="button" accessibilityLabel="Go to Login">
              <Text style={[styles.footerLink, { color: c.primary }]}>Log in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    fontWeight: '600',
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
  roleSection: {
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  roleOptions: {
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 12,
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 11,
    fontWeight: '400',
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
  eyeIcon: {
    padding: 4,
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
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    fontWeight: '600',
  },
});

export default SignupScreen;
