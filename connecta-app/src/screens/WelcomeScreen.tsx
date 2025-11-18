import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Logo from '../components/Logo';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin }) => {
  const c = useThemeColors();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}> 
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.center}> 
        <Logo size={96} style={styles.logo} />
        <Text style={[styles.title, { color: c.text }]}>Connecta</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>The platform to connect with talented freelancers and find your next project.</Text>
      </View>

      <View style={styles.footer}> 
        <TouchableOpacity onPress={onGetStarted} activeOpacity={0.9} style={[styles.cta, { backgroundColor: c.primary }]}> 
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
        <View style={styles.loginRow}> 
          <Text style={[styles.loginText, { color: c.subtext }]}>Already have an account?</Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={[styles.loginLink, { color: c.primary }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 480,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  cta: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default WelcomeScreen;
