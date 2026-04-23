import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import Input from '../components/Input';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import SignupProgressBar from '../components/SignupProgressBar';
import ChatGreeting from '../components/ChatGreeting';
import * as storage from '../utils/storage';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';

const SignupScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useInAppAlert();

  const { role: initialRole } = (route.params as any) || {};
  const [role, setRole] = useState<'client' | 'freelancer'>(initialRole || 'freelancer');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const loadRole = async () => {
      if (!initialRole) {
        const data = await storage.getPendingSignupData();
        if (data?.userType) {
          setRole(data.userType);
        }
      }
    };
    loadRole();
  }, [initialRole]);

  const handleContinue = async () => {
    setNameError('');
    if (!name.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setNameError('Please introduce yourself!');
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await storage.savePendingSignupData({
        firstName,
        lastName,
        userType: role,
      });

      (navigation as any).navigate('SignupDetails');
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'Saving failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.mainWrapper}>
          <View style={styles.stickyHeader}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <SignupProgressBar currentStep={2} totalSteps={5} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.chatSection}>
              <ChatGreeting
                messages={[
                  { text: 'Hi there!' },
                  { text: 'What is your name?', delay: 1000 }
                ]}
              />
            </View>

            <View style={styles.form}>
              <Input
                value={name}
                onChangeText={(val) => { setName(val); setNameError(''); }}
                placeholder="What is your name?"
                icon="person-outline"
                error={nameError}
              />
            </View>

            <View style={styles.footer}>
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <Button title="Continue" onPress={handleContinue} loading={isLoading} size="large" />
                </View>
              </View>

              <View style={styles.loginRow}>
                <Text style={[styles.loginText, { color: c.subtext }]}>Already have an account?</Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                  <Text style={[styles.loginLink, { color: c.primary }]}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 30,
  },
  stickyHeader: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.01)',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  chatSection: {
    marginBottom: 0,
  },
  form: { gap: 24 },
  footer: { paddingTop: 20 },
  buttonContainer: { width: '100%', alignItems: 'flex-end' },
  buttonWrapper: { width: '60%' },
  loginRow: { flexDirection: 'row', gap: 8, marginTop: 24, justifyContent: 'center', width: '100%' },
  loginText: { fontSize: 15, fontWeight: '500' },
  loginLink: { fontSize: 15, fontWeight: '700' },
});

export default SignupScreen;
