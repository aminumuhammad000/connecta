import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useThemeColors } from '../theme/theme';
import Logo from '../components/Logo';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onSignup }) => {
  const c = useThemeColors();

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Taglines
  const [index, setIndex] = useState(0);
  const taglines = [
    "The professional network\nfor freelancers.",
    "Hire top talent\ninstantly & securely.",
    "Work without limits,\nget paid on time.",
    "Build your dream team\nin minutes."
  ];
  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Tagline Cycle
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(textOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % taglines.length);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>

        {/* TOP: Logo Section (Perfectly Placed for Mobile Brand Recognition) */}
        <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainer}>
            {/* A subtle shadow behind the logo for depth */}
            <View style={styles.logoShadow}>
              <Logo size={90} />
            </View>
          </View>
          <Text style={styles.appName}>Connecta</Text>
        </Animated.View>

        {/* MIDDLE: Hero Text (Vertically Centered) */}
        <Animated.View style={[styles.middleSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.staticHeading}>Welcome to the future of work.</Text>

          <View style={styles.taglineWrapper}>
            <Animated.Text style={[styles.dynamicTagline, { opacity: textOpacity }]}>
              {taglines[index]}
            </Animated.Text>
          </View>
        </Animated.View>

        {/* BOTTOM: Actions (Comfortable Thumb Reach) */}
        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <Button
            title="Log In"
            onPress={onLogin || (() => { })}
            style={[styles.loginBtn, { backgroundColor: '#FD6730' }]}
            textStyle={styles.loginBtnText}
          />

          <Button
            title="Create Account"
            onPress={onSignup || (() => { })}
            variant="outline"
            style={styles.signupBtn}
            textStyle={styles.signupBtnText}
          />

          <Text style={styles.legalText}>
            Privacy Policy • Terms of Service
          </Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    flex: 2, // Takes up top ~35-40% of screen
    alignItems: 'center',
    justifyContent: 'flex-end', // Pushes logo towards the middle-top sweet spot
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoShadow: {
    shadowColor: '#FD6730',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  middleSection: {
    flex: 2, // Takes up middle ~35-40%
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  staticHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  taglineWrapper: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dynamicTagline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 40,
  },
  bottomSection: {
    flex: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    gap: 16,
    width: '100%',
  },
  loginBtn: {
    height: 56,
    borderRadius: 14,
    shadowColor: '#FD6730',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  signupBtn: {
    height: 56,
    borderRadius: 14,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  signupBtnText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default WelcomeScreen;
