import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import aiService from '../services/aiService';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHAtdQiUgt2BKEOZ74E88IdnTkPeT872UYB4CRTnNZVaX9Ceane9jsutA5LDIBHIUdm-5YaTJV4g5T-KHx51RbZz9GJtCHNjzvjKNgl4ROoSrxQ8wS8E9_EnRblUVQCBri1V-SVrGlF0fNJpV7iEUfgALZdUdSdEK4x4ZXjniKd-62zI6B_VrhpemzmR97eKrBJcyf4BR8vBgXnyRjJYOdIBjiU6bIA0jni9splDm26Qo2-6GEWsXBbCJoWJtxiNGW67rtsOuA-Wc';
const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const c = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getMyProfile();
      const merged = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        ...data,
      };
      setProfile(merged);
      setErrorMessage(data ? null : 'Profile not found. Create your profile to get started.');
    } catch (error: any) {
      console.error('Error loading profile:', error);
      if (error?.status === 404) {
        setProfile(null);
        setErrorMessage('Profile not found. Create your profile to get started.');
      } else {
        setErrorMessage('Unable to load profile. Pull to refresh to try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onBack = () => navigation.goBack?.();

  const generateAIBio = async () => {
    if (!profile) return;
    try {
      setIsGeneratingBio(true);
      const prompt = `Generate a professional summary for a freelancer named ${profile.firstName} with job title "${profile.jobTitle || profile.title || 'Freelancer'}" and skills: ${profile.skills?.join(', ') || 'various skills'}. The summary must be short, between 10 and 20 words. Return ONLY the summary text, no conversational filler.`;
      const generatedBio = await aiService.sendAIQuery(prompt, user?._id || '', 'freelancer');

      if (generatedBio) {
        // Typing effect for "writing" feel
        let currentText = '';
        const words = generatedBio.split(' ');
        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? '' : ' ') + words[i];
          setProfile((prev: any) => ({ ...prev, bio: currentText }));
          // Small delay between words
          await new Promise(resolve => setTimeout(resolve, 40));
        }
        // Update server after typing finishes
        await profileService.updateMyProfile({ bio: generatedBio });
      }
    } catch (error) {
      console.error('Error generating AI bio:', error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (isLoading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    const totalFields = 8;

    if (profile.avatar) score++;
    if (profile.bio && profile.bio.length > 20) score++;
    if (profile.skills && profile.skills.length > 0) score++;
    if (profile.jobTitle) score++;
    if (profile.education && profile.education.length > 0) score++;
    if (profile.employment && profile.employment.length > 0) score++;
    if (profile.portfolio && profile.portfolio.length > 0) score++;
    if (profile.jobCategories && profile.jobCategories.length > 0) score++;

    return Math.round((score / totalFields) * 100);
  };

  const completeness = calculateCompleteness();

  if (!profile && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="person-outline" size={48} color={c.subtext} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No profile yet</Text>
          <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 20 }}>
            {errorMessage || 'Set up your profile to start getting matched with jobs.'}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.btnTextWhite}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { backgroundColor: c.background, borderBottomColor: c.border, opacity: headerOpacity, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <SafeAreaView edges={['top']} style={{ width: '100%' }}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: c.text }]}>{profile?.firstName}'s Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={24} color={c.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Floating Back Button (Visible when header is transparent) */}
      <Animated.View style={[styles.floatingHeader, { opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: 'clamp' }) }]}>
        <SafeAreaView edges={['top']} style={{ width: '100%' }}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadProfile} colors={[c.primary]} tintColor={c.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image Area */}
        <View style={styles.coverContainer}>
          <LinearGradient
            colors={['#FF7F50', '#f39170ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          />
          <View style={styles.coverOverlay} />
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCardContainer}>
          <View style={[styles.profileCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor }]}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatarContainer, { borderColor: c.card, backgroundColor: c.primary }]}>
                {profile?.avatar ? (
                  <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary }]}>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFF' }}>
                      {profile?.firstName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                {profile?.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="star" size={12} color="#FFF" />
                  </View>
                )}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: c.text }]}>{profile?.completedJobs || '0'}</Text>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Jobs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: c.text }]}>{profile?.averageRating || '5.0'}</Text>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: c.text }]}>{profile?.totalHours || '0'}</Text>
                  <Text style={[styles.statLabel, { color: c.subtext }]}>Hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>
                {profile?.isPremium && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />}
              </View>
              <Text style={[styles.role, { color: c.primary }]}>{profile?.jobTitle || profile?.title || 'Freelancer'}</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color={c.subtext} />
                  <Text style={[styles.detailText, { color: c.subtext }]}>{profile?.location || 'No location'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Ionicons name="ribbon-outline" size={14} color={c.subtext} />
                  <Text style={[styles.detailText, { color: c.subtext }]}>
                    {profile?.yearsOfExperience !== undefined ? `${profile.yearsOfExperience}+ yrs` : 'No exp.'}
                  </Text>
                </View>
              </View>

              {profile?.engagementTypes && profile.engagementTypes.length > 0 && (
                <View style={styles.engagementContainer}>
                  {profile.engagementTypes.map((type: string, idx: number) => {
                    const engMap: any = { 'full_time': 'Full-time', 'part_time': 'Part-time', 'contract': 'Contract', 'freelance': 'Freelance', 'internship': 'Internship' };
                    const label = engMap[type] || type;
                    return (
                      <View key={idx} style={[styles.engagementBadge, { backgroundColor: c.primary + '15' }]}>
                        <Text style={[styles.engagementText, { color: c.primary }]}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.bioHeader}>
                <Text style={[styles.bioTitle, { color: c.subtext }]}>BIO</Text>
                <TouchableOpacity
                  onPress={generateAIBio}
                  disabled={isGeneratingBio}
                  style={[styles.aiBioBtn, { backgroundColor: c.primary + '10' }]}
                >
                  {isGeneratingBio ? (
                    <ActivityIndicator size="small" color={c.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="auto-awesome" size={12} color={c.primary} />
                      <Text style={[styles.aiBioText, { color: c.primary }]}>AI Rewrite</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={[styles.bio, { color: c.text }]}>{profile?.bio || 'No bio added yet.'}</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.profileActionBtn, { borderColor: c.border, backgroundColor: c.card }]}
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Ionicons name="pencil-outline" size={14} color={c.text} style={{ marginRight: 6 }} />
                  <Text style={[styles.profileActionText, { color: c.text }]}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileActionBtn, { borderColor: c.border, backgroundColor: c.card }]}
                  onPress={() => navigation.navigate('JobPreferences')}
                >
                  <Ionicons name="options-outline" size={14} color={c.text} style={{ marginRight: 6 }} />
                  <Text style={[styles.profileActionText, { color: c.text }]}>Preferences</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileActionIconBtn, { borderColor: c.border, backgroundColor: c.card }]}
                  onPress={() => navigation.navigate('ManageSubscription')}
                >
                  <Ionicons name={profile?.isPremium ? "settings-outline" : "star-outline"} size={18} color={c.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ultra-Sleek Profile Completeness */}
            <View style={styles.ultraSleekCompleteness}>
              <View style={styles.completenessRow}>
                <Text style={[styles.tinyLabel, { color: c.subtext }]}>Profile Strength</Text>
                <Text style={[styles.tinyValue, { color: c.primary }]}>{completeness}%</Text>
              </View>
              <View style={[styles.thinTrack, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <LinearGradient
                  colors={[c.primary, '#FF9F70']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.thinFill, { width: `${completeness}%` }]}
                />
              </View>
              {completeness < 100 && (
                <TouchableOpacity
                  style={styles.compactTip}
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Text style={[styles.compactTipText, { color: c.subtext }]} numberOfLines={1}>
                    <Text style={{ color: c.primary, fontWeight: '800' }}>• </Text>
                    Add portfolio to reach 100% strength
                  </Text>
                  <Ionicons name="arrow-forward" size={10} color={c.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profile?.skills?.length > 0 ? (
              profile.skills.map((s: string, index: number) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: c.isDark ? '#333' : '#F3F4F6' }]}>
                  <Text style={[styles.skillText, { color: c.text }]}>{s}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: c.subtext, fontSize: 14 }}>No skills added yet.</Text>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: c.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'portfolio' && { borderBottomColor: c.primary }]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'portfolio' ? c.primary : c.subtext }]}>Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reviews' && { borderBottomColor: c.primary }]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'reviews' ? c.primary : c.subtext }]}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'portfolio' ? (
            <View>
              <TouchableOpacity style={[styles.addProjectBtn, { borderColor: c.border, borderStyle: 'dashed' }]} onPress={() => navigation.navigate('AddPortfolio')}>
                <Ionicons name="add" size={24} color={c.subtext} />
                <Text style={{ color: c.subtext, marginLeft: 8, fontWeight: '500' }}>Add Project</Text>
              </TouchableOpacity>

              {profile?.portfolio?.length > 0 ? (
                <View style={styles.portfolioGrid}>
                  {profile.portfolio.map((item: any, index: number) => (
                    <TouchableOpacity key={index} style={[styles.portfolioItem, { backgroundColor: c.card }]} activeOpacity={0.9}>
                      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }} style={styles.portfolioImage} />
                      <View style={styles.portfolioOverlay}>
                        <Text style={styles.portfolioTitle} numberOfLines={1}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyTabState}>
                  <Text style={{ color: c.subtext }}>No projects yet.</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {profile?.reviews?.length > 0 ? (
                profile.reviews.map((review: any, index: number) => (
                  <View key={index} style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.reviewAuthor, { color: c.text }]}>{review.reviewerId?.firstName || review.author || 'Anonymous'}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={[styles.ratingText, { color: c.text }]}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={[styles.reviewComment, { color: c.subtext }]}>{review.comment}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyTabState}>
                  <Text style={{ color: c.subtext }}>No reviews yet.</Text>
                </View>
              )}
            </View>
          )}
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 10,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  coverGradient: {
    flex: 1,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  profileCardContainer: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    position: 'relative',
    marginTop: -42, // Pull avatar up
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  infoSection: {
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  detailDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
  },
  engagementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  engagementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  engagementText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aiBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBioText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnTextWhite: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tabItem: {
    marginRight: 24,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  addProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portfolioItem: {
    width: (width - 52) / 2, // 2 columns with padding
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  portfolioTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTabState: {
    padding: 40,
    alignItems: 'center',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    margin: 20,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  profileActionBtn: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileActionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ultraSleekCompleteness: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.02)',
  },
  completenessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tinyLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.6,
  },
  tinyValue: {
    fontSize: 11,
    fontWeight: '900',
  },
  thinTrack: {
    height: 3,
    borderRadius: 1.5,
    width: '100%',
    overflow: 'hidden',
  },
  thinFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  compactTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  compactTipText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
});
