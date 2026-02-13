import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import Input from '../components/Input';
import { useInAppAlert } from '../components/InAppAlert';
import * as uploadService from '../services/uploadService';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
import SignupProgressBar from '../components/SignupProgressBar';
import ChatGreeting from '../components/ChatGreeting';
import * as storage from '../utils/storage';
import AnimatedBackground from '../components/AnimatedBackground';

const SignupScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useInAppAlert();
  const { t, lang } = useTranslation();

  const { role } = (route.params as any) || { role: 'freelancer' };
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Animation values
  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    if (!image) {
      pulseValue.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1500 }), withTiming(1, { duration: 1500 })),
        -1
      );
    } else {
      pulseValue.value = withTiming(1);
    }
  }, [image]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    borderColor: image ? c.primary : withTiming(c.border)
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ title: 'Permission Required', message: 'We need access to your gallery to upload a profile photo.', type: 'error' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleContinue = async () => {
    setNameError('');
    if (!name.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setNameError('Please introduce yourself!');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadService.uploadAvatarPublic(image);
      }

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await storage.savePendingSignupData({
        firstName,
        lastName,
        avatar: imageUrl,
        userType: role,
      });

      (navigation as any).navigate('SignupDetails');
    } catch (error: any) {
      showAlert({ title: t('error' as any), message: error.message || 'Saving failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const sideContent = (
    <View style={styles.desktopSide}>
      <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
        <Ionicons name="person-circle-outline" size={80} color={c.primary} />
      </View>
      <Text style={[styles.sideTitle, { color: c.text }]}>Nice to{'\n'}Meet You!</Text>
      <Text style={[styles.sideSub, { color: c.subtext }]}>
        A friendly face builds trust. Add a photo so we can recognize you.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />
      <AnimatedBackground />
      <ResponsiveOnboardingWrapper sideComponent={sideContent}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.mainWrapper}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color={c.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('LanguageSelect')}
                  style={[styles.langToggle, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  <MaterialIcons name="language" size={18} color={c.primary} />
                  <Text style={[styles.langToggleText, { color: c.text }]}>
                    {lang === 'ha' ? 'Hausa' : 'English'}
                  </Text>
                </TouchableOpacity>
              </View>

              <SignupProgressBar currentStep={2} totalSteps={6} />

              <View style={styles.chatSection}>
                <ChatGreeting
                  messages={[
                    { text: t('signup_header') },
                    { text: t('signup_sub'), delay: 1000 }
                  ]}
                />
              </View>

              <View style={styles.form}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.9}>
                  <Animated.View style={[styles.imageWrapper, pulseStyle, { backgroundColor: c.card }]}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.profileImage} />
                    ) : (
                      <Feather name="camera" size={32} color={c.primary} />
                    )}
                    <View style={[styles.badge, { backgroundColor: c.primary }]}>
                      <MaterialIcons name={image ? "check" : "add"} size={16} color="#fff" />
                    </View>
                  </Animated.View>
                  <Text style={[styles.imgLabel, { color: c.subtext }]}>{t('upload_photo')}</Text>
                </TouchableOpacity>

                <Input
                  value={name}
                  onChangeText={(val) => { setName(val); setNameError(''); }}
                  placeholder={t('full_name')}
                  icon="person-outline"
                  error={nameError}
                />
              </View>

              <View style={styles.footer}>
                <Button title={t('continue')} onPress={handleContinue} loading={isLoading} size="large" />

                <View style={styles.loginRow}>
                  <Text style={[styles.loginText, { color: c.subtext }]}>{t('already_have_account')}</Text>
                  <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                    <Text style={[styles.loginLink, { color: c.primary }]}>{t('login')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ResponsiveOnboardingWrapper>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  headerControls: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  langToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, gap: 6 },
  langToggleText: { fontSize: 13, fontWeight: '700' },
  chatSection: {
    marginBottom: 32,
  },
  form: { gap: 24, marginBottom: 32 },
  imagePicker: { alignSelf: 'center', alignItems: 'center' },
  imageWrapper: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  profileImage: { width: 116, height: 116, borderRadius: 58 },
  badge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  imgLabel: { fontSize: 14, fontWeight: '600', opacity: 0.8 },
  footer: { marginTop: 'auto', alignItems: 'center' },
  loginRow: { flexDirection: 'row', gap: 8, marginTop: 24, justifyContent: 'center' },
  loginText: { fontSize: 15, fontWeight: '500' },
  loginLink: { fontSize: 15, fontWeight: '700' },
  // Desktop
  desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
  sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 }
});

export default SignupScreen;
