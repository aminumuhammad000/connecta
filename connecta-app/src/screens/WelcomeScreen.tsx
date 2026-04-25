import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Platform, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  FadeIn
} from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../components/AnimatedBackground';

const WelcomeScreen: React.FC<{ navigation?: any, onLogin?: () => void, onSignup?: () => void }> = ({ navigation, onLogin, onSignup }) => {
  const c = useThemeColors();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const isDesktop = width > 768;

  const taglines = [
    'The friendly place\nfor professionals.',
    'Find great talent\neasily & securely.',
    'Work your own way,\nget paid on time.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [taglines]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />
      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        {/* Logo Area */}
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
          <View style={[styles.logoGlow, { backgroundColor: c.primary + '30' }]} />
          <Image source={require('../../assets/logo copy.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Text Area */}
        <View style={styles.textContainer}>
          <Animated.Text entering={FadeInDown.delay(200)} style={[styles.title, { color: c.text }]}>
            Connecta
          </Animated.Text>

          <View style={styles.taglineWrapper}>
            <Animated.View
              key={index}
              entering={FadeInUp.springify()}
              exiting={FadeOutUp}
            >
              <Animated.Text
                style={[styles.dynamicTagline, { color: c.text }]}
              >
                {taglines[index]}
              </Animated.Text>
            </Animated.View>
          </View>
        </View>

        {/* Action Area */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.actionZone}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (onSignup) onSignup();
              else navigation?.navigate('RoleSelection');
            }}
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onLogin) onLogin();
              else navigation?.navigate('Login');
            }}
            style={[styles.secondaryBtn, { borderColor: c.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: c.text }]}>
              Already have an account? <Text style={{ color: c.primary, fontWeight: '800' }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
  },
  desktopContent: {
    justifyContent: 'center',
    gap: 80, // Increased gap for desktop
    paddingVertical: 100,
  },
  logoContainer: { alignItems: 'center' },
  logoGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.5 },
  logo: { width: 140, height: 140 },
  textContainer: { alignItems: 'center', minHeight: 160 },
  title: { fontSize: 52, fontWeight: '900', letterSpacing: -2, marginBottom: 16 },
  taglineWrapper: { height: 80, justifyContent: 'center', alignItems: 'center' },
  dynamicTagline: { fontSize: 24, fontWeight: '600', textAlign: 'center', opacity: 0.8, lineHeight: 32 },
  actionZone: { width: '100%', gap: 24, marginBottom: 20 },
  primaryBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#FD6730', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  secondaryBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
});

export default WelcomeScreen;
