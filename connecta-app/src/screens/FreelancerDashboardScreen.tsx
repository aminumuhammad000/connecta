import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Animated, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import dashboardService from '../services/dashboardService';
import jobService from '../services/jobService';
import * as profileService from '../services/profileService';
import userService from '../services/userService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import SuccessModal from '../components/SuccessModal';
import { AIButton } from '../components/AIButton';
import Sidebar from '../components/Sidebar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from '../utils/i18n';

import { useWindowDimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface JobRec {
  id: string;
  title: string;
  company: string;
  budget: string;
  status: 'New' | 'Hot' | 'Featured';
  type: 'Fixed' | 'Hourly';
  skills: string[];
  postedAgo: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  budget: number;
  type: string;
  location: string;
  skills: string[];
  postedAgo: string;
}

const FreelancerDashboardScreen: React.FC<any> = () => {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedGigs, setLikedGigs] = useState<Set<string>>(new Set());
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const { socket, unreadNotificationCount } = useSocket();

  const renderBadge = (count: any) => {
    if (!count || count <= 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  };

  useEffect(() => {
    loadDashboardData();
    checkProfileStatus();
    checkDailyReward();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        console.log('[FreelancerDashboard] Refreshing due to socket event');
        loadDashboardData();
      };

      socket.on('conversation:update', handleUpdate);
      socket.on('notification:new', handleUpdate);
      socket.on('message:receive', handleUpdate);

      return () => {
        socket.off('conversation:update', handleUpdate);
        socket.off('notification:new', handleUpdate);
        socket.off('message:receive', handleUpdate);
      };
    }
  }, [socket]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      checkProfileStatus();
      checkDailyReward();
    }, [user])
  );

  const checkDailyReward = async () => {
    if (!user) return;
    try {
      const now = new Date();
      if (user.lastRewardClaimedAt) {
        const lastClaim = new Date(user.lastRewardClaimedAt);
        const hoursDiff = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
        if (hoursDiff >= 24) {
          console.log('[DailyReward] Showing modal because hoursDiff >= 24:', hoursDiff);
          setRewardModalVisible(true);
        } else {
          console.log('[DailyReward] Not showing modal. hoursDiff:', hoursDiff);
        }
      } else {
        // Never claimed before
        console.log('[DailyReward] Showing modal because never claimed before');
        setRewardModalVisible(true);
      }
    } catch (error) {
      console.log('Error checking daily reward:', error);
    }
  };

  const handleClaimReward = async () => {
    try {
      setClaimingReward(true);
      const res = await userService.claimDailyReward();
      if (res.success) {
        setRewardModalVisible(false);
        // Refresh local user state using returned user or fetch new
        if (res.user) {
          updateUser(res.user);
        } else {
          const updatedUser = await userService.getMe();
          updateUser(updatedUser);
        }
        // Refresh dashboard stats
        loadDashboardData();
      }
    } catch (error: any) {
      console.log('Error claiming reward:', error);
      setRewardModalVisible(false);
    } finally {
      setClaimingReward(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, jobsData] = await Promise.all([
        dashboardService.getFreelancerStats().catch(() => null),
        jobService.getRecommendedJobs().catch(() => []),
      ]);
      setStats(statsData);
      setRecommendedJobs(jobsData);

      // Init animations
      jobsData.forEach((job: any) => {
        if (job._id && !scaleAnims[job._id]) {
          scaleAnims[job._id] = new Animated.Value(1);
        }
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
    checkProfileStatus();
  };

  const checkProfileStatus = async () => {
    try {
      const profile = await profileService.getMyProfile();
      const missing: string[] = [];

      // Check required profile fields
      if (!profile?.bio) missing.push('bio');
      if (!profile?.skills || profile?.skills.length === 0) missing.push('skills');
      if (!profile?.location) missing.push('location');
      if (!profile?.phone && !profile?.phoneNumber) missing.push('phone');
      if (!profile?.avatar) missing.push('avatar');

      // Check preference fields
      if (!profile?.jobTitle) missing.push('education');

      if (missing.length > 0) {
        setMissingFields(missing);
        setProfileModalVisible(true);
      } else {
        setProfileModalVisible(false);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setMissingFields(['bio', 'skills', 'location', 'phone', 'avatar', 'experience', 'education', 'portfolio']);
        setProfileModalVisible(true);
      } else {
        console.error('Error checking profile status:', error);
      }
    }
  };

  const handleCompleteProfile = () => {
    setProfileModalVisible(false);
    // Navigate to sibling screen in the parent stack
    // Try parent first (Stack), then current (Tabs)
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('EditProfile');
    } else {
      navigation.navigate('EditProfile');
    }
  };

  const handleSkipProfile = () => {
    setProfileModalVisible(false);
  };

  const toggleLikeGig = (gigId: string) => {
    if (!scaleAnims[gigId]) {
      scaleAnims[gigId] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.spring(scaleAnims[gigId], {
        toValue: 1.5,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[gigId], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
    setLikedGigs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gigId)) {
        newSet.delete(gigId);
      } else {
        newSet.add(gigId);
      }
      return newSet;
    });
  };

  const userName = user ? `${user.firstName}` : 'User';
  // const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['right', 'top', 'bottom']}>
      <View style={{ flex: 1, maxWidth: isDesktop ? 1200 : 600, alignSelf: 'center', width: '100%' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 72 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {/* Header */}
          <View style={{ backgroundColor: c.background }}>
            <View style={[styles.header, {
              paddingTop: 10,
              paddingBottom: 80, // Increased height for overlap
              backgroundColor: '#FF7F50', // Coral
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {!isDesktop && (
                  <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconButton}>
                    <MaterialIcons name="menu" size={24} color="#FFF" />
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{t('welcome_back' as any)} 👋</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>{user?.firstName || 'User'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SparkHistory')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    gap: 4
                  }}
                >
                  <MaterialIcons name="auto-awesome" size={16} color="#FFD700" />
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>{user?.sparks || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="notifications-outline" size={22} color="#FFF" />
                    {unreadNotificationCount > 0 && (
                      <View style={{ position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FF7F50' }} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ height: 0 }} />

          {/* Daily Reward Modal */}
          <SuccessModal
            visible={rewardModalVisible}
            title="Daily Spark Reward! ✨"
            message="Your daily gift is ready. Claim your sparks now to keep the flame alive!"
            buttonText={claimingReward ? "Claiming..." : "Claim 10 Sparks"}
            onAction={handleClaimReward}
            onClose={() => setRewardModalVisible(false)}
          />

          {/* Profile Completion Card */}
          <ProfileCompletionCard
            visible={profileModalVisible}
            missingFields={missingFields}
            onComplete={handleCompleteProfile}
            onSkip={handleSkipProfile}
          />

          <View style={{
            marginTop: -45,
            marginHorizontal: 20,
            backgroundColor: c.card,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: c.border,
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingVertical: 15 }}
            >
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('FreelancerProjects')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="briefcase" size={20} color="#10B981" />
                  {renderBadge(stats?.activeProjects || stats?.totalProjects)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>My Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Proposals')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name="document-text" size={20} color={c.primary} />
                  {renderBadge(stats?.activeProposals)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Proposals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Messages')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F615' }]}>
                  <Ionicons name="chatbubbles" size={20} color="#3B82F6" />
                  {renderBadge(stats?.newMessages)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Wallet')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="wallet" size={20} color="#F59E0B" />
                  {renderBadge(stats?.pendingPayments)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('FreelancerProjects', { tab: 'collabo' })}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#6366F115' }]}>
                  <Ionicons name="people" size={20} color="#6366F1" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Team</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Search Bar */}
          {/* Modern Search & Saved Section */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 24,
            gap: 12
          }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Gigs', { autoFocus: true })}
              style={{
                flex: 1,
                backgroundColor: c.isDark ? '#2D2D2D' : '#F0F2F5',
                height: 48,
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: c.isDark ? '#404040' : '#E4E6EB',
              }}
            >
              <Ionicons name="search" size={18} color={c.subtext} />
              <Text style={{ marginLeft: 10, color: c.subtext, fontSize: 14, flex: 1 }}>Search for jobs...</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('FreelancerSavedGigs')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: c.isDark ? '#2D2D2D' : '#F0F2F5',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: c.isDark ? '#404040' : '#E4E6EB',
              }}
            >
              <MaterialIcons name="bookmark-outline" size={22} color={c.text} />
            </TouchableOpacity>
          </View>

          {/* Recommended Jobs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>{t('recommended_jobs' as any)}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Gigs')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>{t('view_all' as any)}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => {
                  if (!job) return null;
                  const isInternal = !job.isExternal;
                  const identityColor = isInternal ? '#10B981' : '#3B82F6'; // Green for Internal, Blue for External
                  const isNew = new Date(job.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // New if < 3 days old

                  return (
                    <TouchableOpacity
                      key={job._id}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('JobDetail', { id: job._id })}
                      style={{ marginBottom: 4 }}
                    >
                      <View style={{
                        backgroundColor: c.card,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: c.border,
                        padding: 20,
                        gap: 16
                      }}>
                        {/* Header: Title & Save */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <View style={{ position: 'relative' }}>
                              <Avatar
                                uri={(job.clientId as any)?.profileImage || job.companyLogo}
                                name={job.company || (job.clientId as any)?.firstName || 'C'}
                                size={45}
                              />
                              {isInternal && (
                                <View style={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  backgroundColor: '#FFF',
                                  borderRadius: 10,
                                  padding: 1
                                }}>
                                  <MaterialIcons name="verified" size={16} color="#FF7F50" />
                                </View>
                              )}
                            </View>
                            <View style={{ flex: 1, gap: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, lineHeight: 22, flex: 1 }}>
                                  {job.title}
                                </Text>
                                {isNew && (
                                  <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: '700' }}>NEW</Text>
                                  </View>
                                )}
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '500' }}>
                                  {job.company || 'Confidential'} • {new Date(job.createdAt).toLocaleDateString()}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity onPress={() => toggleLikeGig(job._id)}>
                            <Ionicons
                              name={likedGigs.has(job._id) ? "bookmark" : "bookmark-outline"}
                              size={22}
                              color={likedGigs.has(job._id) ? c.primary : c.subtext}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Badges Row */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          <Badge label={job.jobType} variant="neutral" size="small" />
                          <Badge label={job.locationType || 'Remote'} variant="neutral" size="small" />
                          <Badge label={`₦${job.budget} / project`} variant="custom" customColor="#FF7F50" size="small" />
                        </View>

                        {/* Description Preview */}
                        <Text style={{ fontSize: 13, color: c.subtext, lineHeight: 20 }} numberOfLines={2}>
                          {job.description ? job.description.replace(/<[^>]*>/g, '') : (job.summary ? job.summary.replace(/<[^>]*>/g, '') : 'No description available')}
                        </Text>

                        {/* Footer: Skills & Apply */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: c.border,
                          gap: 12
                        }}>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                            {job.skills && job.skills.slice(0, 2).map((skill: string, idx: number) => (
                              <Text key={idx} style={{ fontSize: 11, color: c.subtext, backgroundColor: c.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '500' }}>
                                {skill}
                              </Text>
                            ))}
                            {job.skills && job.skills.length > 2 && (
                              <Text style={{ fontSize: 11, color: c.subtext, paddingVertical: 4 }}>+{job.skills.length - 2} more</Text>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() => navigation.navigate('JobDetail', { id: job._id })}
                            style={{
                              backgroundColor: '#FF7F50',
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 20,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Apply</Text>
                            <MaterialIcons name="arrow-forward" size={14} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>{t('no_jobs_found' as any)}</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* OLD MODAL REMOVED - Now using ProfileCompletionCard instead */}

        <Sidebar
          isVisible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          navigation={navigation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF', // Fallback
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    marginTop: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  desktopStatsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
    marginTop: -50,
    zIndex: 20,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  quickAction: {
    alignItems: 'center',
    width: 60,
    marginRight: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },
  jobCard: {
    gap: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  company: {
    fontSize: 14,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  overlayTitle: { fontSize: 18, fontWeight: '700' },
});

export default FreelancerDashboardScreen;

