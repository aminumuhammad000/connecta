import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHAtdQiUgt2BKEOZ74E88IdnTkPeT872UYB4CRTnNZVaX9Ceane9jsutA5LDIBHIUdm-5YaTJV4g5T-KHx51RbZz9GJtCHNjzvjKNgl4ROoSrxQ8wS8E9_EnRblUVQCBri1V-SVrGlF0fNJpV7iEUfgALZdUdSdEK4x4ZXjniKd-62zI6B_VrhpemzmR97eKrBJcyf4BR8vBgXnyRjJYOdIBjiU6bIA0jni9splDm26Qo2-6GEWsXBbCJoWJtxiNGW67rtsOuA-Wc';

export default function ProfileScreen({ navigation }: any) {
  const c = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      // Merge with auth user basics so name/email show even if profile payload is sparse
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

  if (isLoading && !profile) { // Only show loading indicator if profile is null and still loading
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  if (!profile && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
          <MaterialIcons name="person-outline" size={36} color={c.subtext} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No profile yet</Text>
          <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 12 }}>
            {errorMessage || 'Set up your profile to start getting matched with jobs.'}
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.primary, width: '100%' }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.btnText, { color: 'white' }]}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} accessibilityRole="button" accessibilityLabel="Settings" style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadProfile} colors={[c.primary]} />
        }
      >
        {errorMessage && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Text style={{ color: c.subtext }}>{errorMessage}</Text>
          </View>
        )}

        {/* Profile Header */}
        <View style={[styles.sectionPad, profile?.isPremium && { backgroundColor: c.isDark ? '#3D2800' : '#FFFBEB', paddingBottom: 24, paddingTop: 20 }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarContainer, profile?.isPremium && styles.premiumBorder]}>
                <Image source={{ uri: profile?.avatar || AVATAR }} style={styles.avatar} accessibilityLabel="Profile picture" />
                {profile?.isPremium && (
                  <View style={styles.premiumIconBadge}>
                    <MaterialIcons name="workspace-premium" size={14} color="#FFF" />
                  </View>
                )}
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>
                  {profile?.isPremium && (
                    <MaterialIcons name="verified" size={20} color="#F59E0B" style={{ marginLeft: 4 }} />
                  )}
                </View>

                {profile?.isPremium && (
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="star" size={12} color="#FFF" />
                    <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
                  </View>
                )}

                <Text style={[styles.role, { color: c.subtext }]}>{profile?.title || 'Freelancer'}</Text>
                <View style={styles.verifiedRow}>
                  <MaterialIcons name="location-on" size={14} color={c.subtext} />
                  <Text style={[styles.location, { color: c.subtext }]}>{profile?.location || 'Location not set'}</Text>
                </View>
                <View style={[styles.verifiedRow, { marginTop: 4 }]}>
                  <MaterialIcons name="verified" size={16} color="#22c55e" />
                  <Text style={styles.verifiedText}>Identity Verified</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.btnText, { color: 'white' }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}
              onPress={() => navigation.navigate('ManageSubscription')}
            >
              <MaterialIcons
                name={profile?.isPremium ? "settings" : "workspace-premium"}
                size={16}
                color={c.primary}
              />
              <Text style={[styles.btnText, { color: c.text, marginLeft: 4 }]}>
                {profile?.isPremium ? 'Manage Premium' : 'Upgrade'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.sectionPad, styles.rowWrap, { gap: 12 }]}>
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Earnings</Text>
            <Text style={[styles.statValue, { color: c.text }]}>${profile?.totalEarnings || '0'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Jobs Done</Text>
            <Text style={[styles.statValue, { color: c.text }]}>{profile?.completedJobs || '0'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Hours</Text>
            <Text style={[styles.statValue, { color: c.text }]}>{profile?.totalHours || '0'}</Text>
          </View>
        </View>

        {/* About */}
        <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16, paddingTop: 16 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 0, paddingTop: 0, color: c.text }]}>About</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <MaterialIcons name="edit" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.about, { color: c.subtext }]}>{profile?.bio || 'No bio added yet.'}</Text>

        {/* Skills */}
        <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16, paddingTop: 16 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 0, paddingTop: 0, color: c.text }]}>Skills</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <MaterialIcons name="edit" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.skillsRow}>
          {profile?.skills?.length > 0 ? (
            profile.skills.map((s: string) => (
              <Text key={s} style={[styles.skillChip, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>
                {s}
              </Text>
            ))
          ) : (
            <Text style={{ color: c.subtext, paddingHorizontal: 16 }}>No skills added yet</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: c.border }]}>
          <View style={styles.tabList} accessibilityRole="tablist">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'portfolio' }}
              onPress={() => setActiveTab('portfolio')}
              style={[styles.tabItem, activeTab === 'portfolio' && { borderBottomColor: c.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'portfolio' ? c.primary : c.subtext }]}>Portfolio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'reviews' }}
              onPress={() => setActiveTab('reviews')}
              style={[styles.tabItem, activeTab === 'reviews' && { borderBottomColor: c.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'reviews' ? c.primary : c.subtext }]}>Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.sectionPad}>
          {activeTab === 'portfolio' ? (
            <View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  backgroundColor: c.isDark ? '#2C2C2E' : '#F3F4F6',
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderStyle: 'dashed'
                }}
                onPress={() => navigation.navigate('AddPortfolio')}
              >
                <MaterialIcons name="add" size={24} color={c.primary} />
                <Text style={{ color: c.text, fontWeight: '600', marginLeft: 8 }}>Add New Project</Text>
              </TouchableOpacity>

              {profile?.portfolio?.length > 0 ? (
                profile.portfolio.map((item: any, index: number) => {
                  if (!item) return null;
                  return (
                    <PortfolioCard
                      key={index}
                      title={item.title || 'Untitled Project'}
                      category={item.description || ''}
                      image={item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    />
                  );
                })
              ) : (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <MaterialIcons name="work-outline" size={48} color={c.subtext} style={{ marginBottom: 12 }} />
                  <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
                    No portfolio items yet
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: c.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onPress={() => navigation.navigate('EditProfile')}
                  >
                    <MaterialIcons name="add" size={20} color="white" />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Create Portfolio
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            profile?.reviews?.length > 0 ? (
              profile.reviews.map((review: any, index: number) => {
                if (!review) return null;
                return (
                  <ReviewCard
                    key={index}
                    author={review.author || 'Anonymous'}
                    rating={review.rating || 0}
                    comment={review.comment || ''}
                  />
                );
              })
            ) : (
              <Text style={{ color: c.subtext, textAlign: 'center', padding: 20 }}>No reviews yet</Text>
            )
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
    </SafeAreaView>
  );
}

function PortfolioCard({ title, category, image }: { title: string; category: string; image: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
      <Image source={{ uri: image }} style={{ width: '100%', height: 160 }} />
      <View style={{ padding: 12 }}>
        <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: c.subtext, marginTop: 2 }]}>{category}</Text>
      </View>
    </View>
  );
}

function ReviewCard({ author, rating, comment }: { author: string; rating: number; comment: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.metaRow, { marginBottom: 4 }]}>
        <Text style={[styles.cardTitle, { color: c.text, fontSize: 14 }]}>{author}</Text>
        <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <MaterialIcons key={i} name={i < rating ? 'star' : 'star-border'} size={16} color={i < rating ? '#f59e0b' : c.subtext} />
          ))}
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: c.subtext }]}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  title: { fontSize: 18, fontWeight: '700' },
  sectionPad: { paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  avatar: { width: 80, height: 80, borderRadius: 999, backgroundColor: '#ddd' },
  name: { fontSize: 22, fontWeight: '800' },
  role: { fontSize: 14, marginTop: 2, fontWeight: '500' },
  location: { fontSize: 13, marginLeft: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { color: '#22c55e', fontSize: 12, fontWeight: '600' },
  actionBtn: { flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 13, fontWeight: '700' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  statCard: { flexBasis: '30%', flexGrow: 1, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 16, fontSize: 18, fontWeight: '800' },
  emptyState: { margin: 16, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 20, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  about: { paddingHorizontal: 16, paddingTop: 6, fontSize: 14, lineHeight: 20 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 13, fontWeight: '700' },
  tabs: { marginTop: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  tabList: { flexDirection: 'row', paddingHorizontal: 16 },
  tabItem: { paddingVertical: 12, marginRight: 18, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '700' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  avatarContainer: {
    position: 'relative',
  },
  premiumBorder: {
    borderWidth: 3,
    borderColor: '#F59E0B',
    borderRadius: 999,
    padding: 2,
  },
  premiumIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
});
