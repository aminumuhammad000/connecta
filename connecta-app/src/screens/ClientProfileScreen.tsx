import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as reviewService from '../services/reviewService';
import { Alert, Modal, TextInput } from 'react-native';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRoQQ-xxcLo9YcmbA5AWwLA-FKTuhoFyvCtoj3YzgnBUHc3Bck-0K5CDGhw26GGSiL4TVmx-echTOzkIszt19LuAJSmxtNX4gLR84lGhbyBU_ylBR9UPjYUsGq-sCWYMZU8YMxAwFk3vUMj8iG1B-JkvTnZ33PaK6gy8KAqR6GAF4C1IoRLxDv3FB7Jl0FhWIXIXurfNORMKY7rKh4LRJjYzPXNlfWTAvV548j73C9tUL04WQzqGCFCWqIVMqtsa2VztnMJKvY5rM';
const { width } = Dimensions.get('window');

export default function ClientProfileScreen({ navigation, route }: any) {
  const c = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'reviews'>('history');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleAddReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewService.createReview({
        revieweeId: viewingUserId,
        reviewerType: user?.userType === 'client' ? 'client' : 'freelancer',
        rating,
        comment,
      });
      Alert.alert('Success', 'Review submitted successfully');
      setReviewModalVisible(false);
      setComment('');
      setRating(5);
      loadProfile(); // Refresh reviews
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // If userId is passed in params, we are viewing another user's profile
  const viewingUserId = route?.params?.userId;
  const isOwnProfile = !viewingUserId || viewingUserId === user?._id;

  useEffect(() => {
    loadProfile();
  }, [viewingUserId]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [viewingUserId])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      let data: any;

      if (viewingUserId) {
        try {
          console.log('Fetching profile for:', viewingUserId);
          data = await profileService.getProfileByUserId(viewingUserId);
          console.log('Profile data received:', data);
        } catch (err) {
          console.error('API failed to get profile:', err);
          setErrorMessage('Failed to load profile details.');
          setIsLoading(false);
          return;
        }
      } else {
        data = await profileService.getMyProfile();
      }

      if (!data) {
        setErrorMessage('Profile not found.');
        setIsLoading(false);
        return;
      }

      const userData = data.user || (isOwnProfile ? user : null);

      // Map flat structure or nested structure depending on source
      const merged = {
        _id: userData?._id || data.userId || viewingUserId, // Ensure ID is present
        firstName: userData?.firstName || (isOwnProfile ? user?.firstName : data?.firstName || ''),
        lastName: userData?.lastName || (isOwnProfile ? user?.lastName : data?.lastName || ''),
        email: userData?.email || (isOwnProfile ? user?.email : data?.email || ''),
        isPremium: userData?.isPremium || (isOwnProfile ? user?.isPremium : false),
        avatar: data?.avatar || userData?.profileImage || (isOwnProfile ? user?.profileImage : null),
        userType: userData?.userType || data?.userType || 'client',
        // Freelancer specific
        jobTitle: data?.jobTitle,
        hourlyRate: data?.hourlyRate,
        portfolio: data?.portfolio || [],
        skills: data?.skills || [], // Ensure skills are mapped
        // Client specific
        companyName: data?.companyName,
        jobs: data?.jobs || [],
        // Common
        bio: data?.bio,
        location: data?.location || 'Remote',
        averageRating: data?.rating || data?.averageRating || 0,
        reviews: data?.reviewsList || data?.reviews || [],
        totalSpend: data?.totalSpend || 0,
        jobsPosted: data?.jobsPosted || 0,
        ...data,
      };

      setProfile(merged);
      setErrorMessage(null);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setErrorMessage('Unable to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const onBack = () => navigation.goBack?.();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const calculateTrustScore = () => {
    if (!profile) return 0;
    let score = 0;
    const totalFields = 5;

    // Reliability factors
    if (profile.paymentVerified || profile.isPremium) score++;
    if (profile.averageRating >= 4.5) score++;
    if (profile.jobsPosted > 2) score++;
    if (profile.totalSpend > 0) score++;
    if (profile.bio && profile.bio.length > 30) score++;

    return Math.min(Math.round((score / totalFields) * 100), 100);
  };

  const trustScore = calculateTrustScore();

  if (isLoading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!profile && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="person-outline" size={48} color={c.subtext} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No profile yet</Text>
          <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 20 }}>
            {errorMessage || 'Set up your profile to start hiring.'}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('ClientEditProfile')}
          >
            <Text style={styles.btnTextWhite}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%', position: 'relative' }}>
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

        {/* Floating Back Button */}
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
                </View>
                <View style={styles.statsRow}>
                  {profile?.userType === 'freelancer' ? (
                    <>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: c.text }]}>₦{profile?.hourlyRate || '0'}</Text>
                        <Text style={[styles.statLabel, { color: c.subtext }]}>/hr</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: c.text }]}>{profile?.jobsCompleted || '0'}</Text>
                        <Text style={[styles.statLabel, { color: c.subtext }]}>Jobs</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: c.text }]}>₦{profile?.totalSpend?.toLocaleString() || '0'}</Text>
                        <Text style={[styles.statLabel, { color: c.subtext }]}>Spend</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: c.text }]}>{profile?.jobsPosted || '0'}</Text>
                        <Text style={[styles.statLabel, { color: c.subtext }]}>Jobs</Text>
                      </View>
                    </>
                  )}
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: c.text }]}>{profile?.averageRating || '5.0'}</Text>
                    <Text style={[styles.statLabel, { color: c.subtext }]}>Rating</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>
                </View>
                <Text style={[styles.role, { color: c.primary }]}>
                  {profile?.userType === 'freelancer'
                    ? (profile?.jobTitle || 'Freelancer')
                    : (profile?.companyName || 'Individual Client')}
                </Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={c.subtext} />
                    <Text style={[styles.detailText, { color: c.subtext }]}>{profile?.location || 'No location'}</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={c.subtext} />
                    <Text style={[styles.detailText, { color: c.subtext }]}>Member since 2026</Text>
                  </View>
                </View>

                <View style={styles.bioHeader}>
                  <Text style={[styles.bioTitle, { color: c.subtext }]}>BIO</Text>
                </View>
                <Text style={[styles.bio, { color: c.text }]}>{profile?.bio || 'No bio added yet.'}</Text>

                {isOwnProfile ? (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.profileActionBtn, { borderColor: c.border, backgroundColor: c.card }]}
                      onPress={() => navigation.navigate('ClientEditProfile')}
                    >
                      <Ionicons name="pencil-outline" size={14} color={c.text} style={{ marginRight: 6 }} />
                      <Text style={[styles.profileActionText, { color: c.text }]}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.profileActionBtn, { borderColor: c.border, backgroundColor: c.card }]}
                      onPress={() => navigation.navigate('PostJob')}
                    >
                      <Ionicons name="add-circle-outline" size={14} color={c.text} style={{ marginRight: 6 }} />
                      <Text style={[styles.profileActionText, { color: c.text }]}>Post Job</Text>
                    </TouchableOpacity>


                  </View>
                ) : (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.profileActionBtn, { backgroundColor: c.primary, borderColor: c.primary }]}
                      onPress={() => {
                        // Logic to invite or message
                        if (profile?.userType === 'freelancer') {
                          // Invite logic (could open modal or navigate)
                          navigation.navigate('ClientRecommended', { openInvite: true, freelancerId: profile._id });
                        } else {
                          // Message logic
                          navigation.navigate('Messages', { recipientId: profile._id });
                        }
                      }}
                    >
                      <Ionicons name={profile?.userType === 'freelancer' ? "paper-plane" : "chatbubble-ellipses"} size={16} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.profileActionText, { color: '#FFF' }]}>
                        {profile?.userType === 'freelancer' ? 'Invite to Job' : 'Message'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.profileActionBtn, { borderColor: c.border, backgroundColor: c.card }]}
                      onPress={() => setReviewModalVisible(true)}
                    >
                      <Ionicons name="star-outline" size={16} color={c.text} style={{ marginRight: 6 }} />
                      <Text style={[styles.profileActionText, { color: c.text }]}>Add Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {isOwnProfile && (
                <View style={styles.ultraSleekCompleteness}>
                  <View style={styles.completenessRow}>
                    <Text style={[styles.tinyLabel, { color: c.subtext }]}>Trust Score</Text>
                    <Text style={[styles.tinyValue, { color: trustScore > 70 ? '#10B981' : c.primary }]}>{trustScore}%</Text>
                  </View>
                  <View style={[styles.thinTrack, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <LinearGradient
                      colors={trustScore > 70 ? ['#10B981', '#34D399'] : [c.primary, '#FF9F70']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.thinFill, { width: `${trustScore}%` }]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabContainer, { borderBottomColor: c.border, marginTop: 24 }]}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'history' && { borderBottomColor: c.primary }]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'history' ? c.primary : c.subtext }]}>
                {profile?.userType === 'freelancer' ? 'Portfolio' : 'Posted Jobs'}
              </Text>
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
            {activeTab === 'history' ? (
              <View>
                {profile?.userType === 'freelancer' ? (
                  /* Portfolio List */
                  profile?.portfolio?.length > 0 ? (
                    profile.portfolio.map((item: any, index: number) => (
                      <View key={index} style={[styles.jobCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={styles.jobHeader}>
                          <View style={[styles.iconBox, { backgroundColor: c.primary + '15' }]}>
                            <Ionicons name="images" size={20} color={c.primary} />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.jobTitle, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.jobBudget, { color: c.subtext }]} numberOfLines={2}>{item.description}</Text>
                          </View>
                        </View>
                        {item.imageUrl && (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 12 }}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyTabState}>
                      <Ionicons name="images-outline" size={48} color={c.border} />
                      <Text style={{ color: c.subtext, marginTop: 8 }}>No portfolio items yet.</Text>
                    </View>
                  )
                ) : (
                  /* Posted Jobs List */
                  profile?.jobs?.length > 0 ? (
                    profile.jobs.map((job: any, index: number) => (
                      <View key={index} style={[styles.jobCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={styles.jobHeader}>
                          <View style={[styles.iconBox, { backgroundColor: c.primary + '15' }]}>
                            <Ionicons name="briefcase" size={20} color={c.primary} />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.jobTitle, { color: c.text }]} numberOfLines={1}>{job.title}</Text>
                            <Text style={[styles.jobBudget, { color: c.subtext }]}>Budget: {job.budget}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: job.status === 'Open' ? '#D1FAE5' : '#F3F4F6' }]}>
                            <Text style={[styles.statusText, { color: job.status === 'Open' ? '#059669' : '#6B7280' }]}>{job.status}</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyTabState}>
                      <Ionicons name="clipboard-outline" size={48} color={c.border} />
                      <Text style={{ color: c.subtext, marginTop: 8 }}>No posted jobs yet.</Text>
                    </View>
                  )
                )}
              </View>
            ) : (
              <View>
                {profile?.reviews?.length > 0 ? (
                  profile.reviews.map((review: any, index: number) => (
                    <View key={index} style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}>
                      <View style={styles.reviewHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {review.reviewerId?.profileImage ? (
                            <Image source={{ uri: review.reviewerId.profileImage }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                          ) : (
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
                                {review.reviewerId?.firstName?.charAt(0) || '?'}
                              </Text>
                            </View>
                          )}
                          <Text style={[styles.reviewAuthor, { color: c.text }]}>
                            {review.reviewerId ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}` : 'Anonymous'}
                          </Text>
                        </View>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text style={[styles.ratingText, { color: c.text }]}>{review.rating}</Text>
                        </View>
                      </View>
                      <Text style={[styles.reviewComment, { color: c.subtext }]}>{review.comment}</Text>
                      {review.projectId && (
                        <Text style={{ fontSize: 12, color: c.primary, marginTop: 8 }}>
                          Project: {review.projectId.title || 'Untitled Project'}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyTabState}>
                    <Ionicons name="star-outline" size={48} color={c.border} />
                    <Text style={{ color: c.subtext, marginTop: 8 }}>No reviews yet.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </Animated.ScrollView>

        {/* Review Modal */}
        <Modal
          visible={reviewModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReviewModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{
              backgroundColor: c.card,
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 10,
              width: '100%',
              maxWidth: 500,
              alignSelf: 'center'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>Add Review</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                  <Ionicons name="close" size={24} color={c.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12 }}>Rating</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={star <= rating ? "#F59E0B" : c.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12 }}>Your Comment</Text>
              <TextInput
                style={{
                  backgroundColor: c.background,
                  borderRadius: 12,
                  padding: 16,
                  height: 120,
                  textAlignVertical: 'top',
                  color: c.text,
                  borderWidth: 1,
                  borderColor: c.border,
                  marginBottom: 24
                }}
                placeholder="Share your experience..."
                placeholderTextColor={c.subtext}
                multiline
                value={comment}
                onChangeText={setComment}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: c.primary,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: isSubmittingReview ? 0.7 : 1
                }}
                onPress={handleAddReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
    marginTop: -42,
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
    fontSize: 16,
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
  btnTextWhite: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
  jobCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  jobBudget: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tinyValue: {
    fontSize: 10,
    fontWeight: '800',
  },
  thinTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  thinFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
