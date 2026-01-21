import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRoQQ-xxcLo9YcmbA5AWwLA-FKTuhoFyvCtoj3YzgnBUHc3Bck-0K5CDGhw26GGSiL4TVmx-echTOzkIszt19LuAJSmxtNX4gLR84lGhbyBU_ylBR9UPjYUsGq-sCWYMZU8YMxAwFk3vUMj8iG1B-JkvTnZ33PaK6gy8KAqR6GAF4C1IoRLxDv3FB7Jl0FhWIXIXurfNORMKY7rKh4LRJjYzPXNlfWTAvV548j73C9tUL04WQzqGCFCWqIVMqtsa2VztnMJKvY5rM';

const { width } = Dimensions.get('window');

export default function ClientProfileScreen({ navigation, route }: any) {
  const c = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'reviews'>('history');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If userId is passed in params, we are viewing another user's profile
  const viewingUserId = route?.params?.userId;
  const isOwnProfile = !viewingUserId || viewingUserId === user?._id;

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [viewingUserId])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      let data;

      if (viewingUserId) {
        data = await profileService.getProfileById(viewingUserId);
      } else {
        data = await profileService.getMyProfile();
      }

      // If viewing another user, strict profile data usage
      // If own profile, fallback to auth user context
      const userData = data?.user || (isOwnProfile ? user : null);

      const merged = {
        // User basic info
        firstName: userData?.firstName || (isOwnProfile ? user?.firstName : ''),
        lastName: userData?.lastName || (isOwnProfile ? user?.lastName : ''),
        email: userData?.email || (isOwnProfile ? user?.email : ''),
        isPremium: userData?.isPremium || (isOwnProfile ? user?.isPremium : false),

        // Profile image
        avatar: data?.avatar || userData?.profileImage || (isOwnProfile ? user?.profileImage : null),

        // Spread all profile data
        ...data,
      };

      setProfile(merged);
      setErrorMessage(data ? null : 'Profile not found.');
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMessage('Unable to load profile. Pull to refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onBack = () => navigation.goBack?.();

  if (isLoading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!isLoading && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 16 }]}>
        <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
          <MaterialIcons name="person-outline" size={48} color={c.subtext} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No profile yet</Text>
          <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 20 }}>
            {errorMessage || 'Set up your profile to start hiring.'}
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.primary, width: '100%' }]}
            onPress={() => navigation.navigate('ClientEditProfile')}
          >
            <Text style={[styles.btnText, { color: 'white' }]}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadProfile} colors={[c.primary]} />
        }
      >
        {/* Header Background */}
        <View style={styles.headerBackgroundContainer}>
          <LinearGradient
            colors={c.isDark ? [c.primary, c.primary] : [c.primary, c.primary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Nav Bar Overlay */}
          <SafeAreaView style={styles.navOverlay}>
            <View style={styles.navBar}>
              <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Profile</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
                <MaterialIcons name="settings" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Profile Card Overlay */}
        <View style={{ paddingHorizontal: 20, marginTop: -60 }}>
          <View style={[styles.profileCard, { backgroundColor: c.card, shadowColor: c.shadow }]}>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profile?.avatar || AVATAR }} style={styles.avatar} />
              {profile?.isPremium && (
                <View style={styles.premiumBadge}>
                  <MaterialIcons name="star" size={14} color="#FFF" />
                </View>
              )}
            </View>

            {/* Name & Info */}
            <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>

            <View style={styles.infoRow}>
              <MaterialIcons name="location-pin" size={16} color={c.subtext} />
              <Text style={[styles.location, { color: c.subtext }]}>{profile?.location || 'No location'}</Text>
            </View>

            {profile?.isPremium && (
              <View style={styles.premiumLabel}>
                <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
              </View>
            )}

            {/* Edit Button */}
            {isOwnProfile && (
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: c.primary + '15' }]} // 15 + hex opacity
                onPress={() => navigation.navigate('ClientEditProfile')}
              >
                <Text style={[styles.editBtnText, { color: c.primary }]}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { marginTop: 20, paddingHorizontal: 20 }]}>
          <StatItem
            label="Spend"
            value={`$${profile?.totalSpend || '0'}`}
            icon="attach-money"
            color="#10B981"
            bgColor={c.isDark ? '#064E3B' : '#D1FAE5'}
            c={c}
          />
          <StatItem
            label="Jobs"
            value={profile?.jobsPosted || '0'}
            icon="work-outline"
            color="#3B82F6"
            bgColor={c.isDark ? '#1E3A8A' : '#DBEAFE'}
            c={c}
          />
          <StatItem
            label="Avg Rate"
            value={`$${profile?.avgRate || '0'}`}
            icon="trending-up"
            color="#F59E0B"
            bgColor={c.isDark ? '#78350F' : '#FEF3C7'}
            c={c}
          />
        </View>

        {/* About Section */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>About Me</Text>
          <Text style={[styles.bioText, { color: c.subtext }]}>
            {profile?.bio || 'This user has not written a bio yet.'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={[styles.pillContainer, { backgroundColor: c.border + '40' }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'history' && { backgroundColor: c.card, shadowColor: '#000', elevation: 2 }]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabButtonText, { color: activeTab === 'history' ? c.primary : c.subtext }]}>Posted Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'reviews' && { backgroundColor: c.card, shadowColor: '#000', elevation: 2 }]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabButtonText, { color: activeTab === 'reviews' ? c.primary : c.subtext }]}>Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Content */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          {activeTab === 'history' ? (
            profile?.jobs?.length > 0 ? (
              profile.jobs.map((job: any, index: number) => (
                <JobCard
                  key={index}
                  title={job.title}
                  budget={job.budget}
                  status={job.status}
                  c={c}
                />
              ))
            ) : (
              <EmptyPlaceholder text="No posted jobs yet." c={c} />
            )
          ) : (
            profile?.reviews?.length > 0 ? (
              profile.reviews.map((review: any, index: number) => (
                <ReviewCard
                  key={index}
                  author={review.author}
                  rating={review.rating}
                  comment={review.comment}
                  c={c}
                />
              ))
            ) : (
              <EmptyPlaceholder text="No reviews yet." c={c} />
            )
          )}
        </View>

      </ScrollView>

      {/* Floating Manage Button for Owners */}
      {isOwnProfile && (
        <View style={styles.floatingBtnContainer}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('PostJob')}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.floatingBtnText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Sub-components
function StatItem({ label, value, icon, color, bgColor, c }: any) {
  return (
    <View style={[styles.statItem, { backgroundColor: c.card }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: c.subtext }]}>{label}</Text>
      </View>
    </View>
  );
}

function JobCard({ title, budget, status, c }: any) {
  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: c.primary + '20' }]}>
          <MaterialIcons name="work" size={20} color={c.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.cardSub, { color: c.subtext }]}>Budget: {budget}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status === 'Open' ? '#D1FAE5' : '#F3F4F6' }]}>
          <Text style={[styles.statusText, { color: status === 'Open' ? '#059669' : '#6B7280' }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

function ReviewCard({ author, rating, comment, c }: any) {
  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarSmall, { backgroundColor: '#E5E7EB' }]}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280' }}>{author.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{author}</Text>
          <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MaterialIcons key={i} name={i < rating ? 'star' : 'star-border'} size={14} color={i < rating ? '#F59E0B' : c.subtext} />
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.reviewText, { color: c.subtext }]}>"{comment}"</Text>
    </View>
  );
}

function EmptyPlaceholder({ text, c }: any) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={c.border} />
      <Text style={{ marginTop: 8, color: c.subtext }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackgroundContainer: {
    height: 220,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
  },
  navTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 8,
  },
  profileCard: {
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: -60, // Pull up above card
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f3f4f6',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#F59E0B',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  location: {
    fontSize: 14,
  },
  premiumLabel: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  premiumText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  pillContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSub: {
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
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  floatingBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  }
});
