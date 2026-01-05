import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeScreenProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onSignup }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />

      {/* Background Decor */}
      <View style={[styles.circle, { backgroundColor: c.primary + '10', top: -100, left: -50 }]} />
      <View style={[styles.circle, { backgroundColor: c.primary + '10', bottom: -50, right: -50, width: 300, height: 300 }]} />

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: c.card, shadowColor: c.primary }]}>
            <Logo size={64} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Connecta</Text>
          <Text style={[styles.tagline, { color: c.subtext }]}>The #1 Freelance Marketplace</Text>
        </View>

        <View style={styles.actionSection}>
          <View style={styles.infoBox}>
            <Text style={[styles.welcomeText, { color: c.text }]}>Welcome!</Text>
            <Text style={[styles.description, { color: c.subtext }]}>Log in to your account or sign up to get started.</Text>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Log In"
              onPress={onLogin || (() => { })}
              variant="primary"
              size="large"
              style={styles.btn}
            />
            <Button
              title="Create Account"
              onPress={onSignup || (() => { })}
              variant="outline"
              size="large"
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoContainer: {
    padding: 24,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
  },
  actionSection: {
    gap: 32,
    marginBottom: 24,
  },
  infoBox: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    maxWidth: 300,
  },
  buttonGroup: {
    gap: 16,
  },
  btn: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

export default WelcomeScreen;
