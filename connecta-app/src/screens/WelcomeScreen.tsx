import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import { useTranslation } from '../utils/i18n';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedBackground from '../components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<{ navigation?: any, onLogin?: () => void, onSignup?: () => void }> = ({ navigation, onLogin, onSignup }) => {
  const c = useThemeColors();
  const { t, lang } = useTranslation();
  const [index, setIndex] = useState(0);

  const taglines = useMemo(() => [
    t('tagline_1'),
    t('tagline_2'),
    t('tagline_3'),
  ], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [taglines]);

  const sideContent = (
    <View style={styles.desktopSide}>
      <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoBox}>
        <Image source={require('../../assets/logo.png')} style={styles.sideLogo} resizeMode="contain" />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(200)} style={[styles.sideTitle, { color: c.text }]}>
        Nigeria's Premier{'\n'}Freelance Hub
      </Animated.Text>
      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <MaterialIcons name="security" size={24} color={c.primary} />
          <Text style={[styles.trustText, { color: c.subtext }]}>Secure Escrow</Text>
        </View>
        <View style={styles.trustItem}>
          <MaterialIcons name="verified" size={24} color={c.primary} />
          <Text style={[styles.trustText, { color: c.subtext }]}>Verified Gigs</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />
      <ResponsiveOnboardingWrapper sideComponent={sideContent}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => navigation.navigate('LanguageSelect')}
            style={[styles.langToggle, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <MaterialIcons name="language" size={20} color={c.primary} />
            <Text style={[styles.langToggleText, { color: c.text }]}>
              {lang === 'ha' ? 'Hausa' : 'English'}
            </Text>
          </TouchableOpacity>

          {/* Logo Area */}
          <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
            <View style={[styles.logoGlow, { backgroundColor: c.primary + '30' }]} />
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Text Area */}
          <View style={styles.textContainer}>
            <Animated.Text entering={FadeInDown.delay(200)} style={[styles.title, { color: c.text }]}>
              Connecta
            </Animated.Text>

            <View style={styles.taglineWrapper}>
              <Animated.Text
                key={index}
                entering={FadeInUp.springify()}
                exiting={FadeOutUp}
                style={[styles.dynamicTagline, { color: c.text }]}
              >
                {taglines[index]}
              </Animated.Text>
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
              <Text style={styles.primaryBtnText}>{t('get_started')}</Text>
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
                {t('already_have_account')} <Text style={{ color: c.primary, fontWeight: '800' }}>{t('login')}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ResponsiveOnboardingWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 40 },
  langToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  langToggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  logoGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.5 },
  logo: { width: 100, height: 100 },
  textContainer: { alignItems: 'center', minHeight: 140 },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: -2, marginBottom: 10 },
  taglineWrapper: { height: 60, justifyContent: 'center', alignItems: 'center' },
  dynamicTagline: { fontSize: 18, fontWeight: '600', textAlign: 'center', opacity: 0.8 },
  actionZone: { width: '100%', gap: 16, marginBottom: 20 },
  primaryBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#FD6730', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  secondaryBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },

  // Desktop styles
  desktopSide: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  logoBox: { width: 180, height: 180, marginBottom: 40 },
  sideLogo: { width: 180, height: 180, marginBottom: 40 },
  sideTitle: { fontSize: 56, fontWeight: '900', textAlign: 'center', letterSpacing: -2, marginBottom: 32, lineHeight: 64 },
  trustRow: { flexDirection: 'row', gap: 24 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  trustText: { fontSize: 14, fontWeight: '700' }
});

export default WelcomeScreen;
