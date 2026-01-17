
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useFocusEffect } from '@react-navigation/native';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { AIButton } from '../components/AIButton';
import Sidebar from '../components/Sidebar';

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

const FreelancerDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedGigs, setLikedGigs] = useState<Set<string>>(new Set());

  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      checkProfileStatus();
    }, [user])
  );

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
      if (!profile?.bio) missing.push('bio');
      if (!profile?.skills || profile?.skills.length === 0) missing.push('skills');
      if (!profile?.location) missing.push('location');

      if (missing.length > 0) {
        setMissingFields(missing);
        setProfileModalVisible(true);
      } else {
        setProfileModalVisible(false);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setMissingFields(['bio', 'skills', 'location']);
        setProfileModalVisible(true);
      } else {
        console.error('Error checking profile status:', error);
      }
    }
  };

  const handleCompleteProfile = () => {
    setProfileModalVisible(false);
    navigation.navigate('EditProfile');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 72 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {/* Header with Gradient */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: c.isDark ? '#1F2937' : c.primary,
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                <MaterialIcons name="menu" size={32} color="#fff" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                >
                  <MaterialIcons name="notifications" size={22} color="#fff" />
                </TouchableOpacity>
                <AIButton onPress={() => navigation.navigate('ConnectaAI')} />
              </View>
            </View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{userName}!</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.primary + '22' }]}>
                <MaterialIcons name="description" size={20} color={c.primary} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{stats?.activeProposals || 0}</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Active Proposals</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B22' }]}>
                <MaterialIcons name="check-circle" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{stats?.completedJobs || 0}</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Completed Jobs</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98122' }]}>
                <MaterialIcons name="attach-money" size={20} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>${stats?.totalEarnings || '0'}</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Total Earnings</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Button
              title="Browse All Jobs"
              onPress={() => navigation.navigate('Gigs')}
              size="large"
              style={{ marginBottom: 12 }}
            />
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Proposals')}
              >
                <MaterialIcons name="description" size={20} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>Proposals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('FreelancerProjects')}
              >
                <MaterialIcons name="work" size={20} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>My Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Wallet')}
              >
                <MaterialIcons name="account-balance-wallet" size={20} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>My Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('FreelancerSavedGigs')}
              >
                <MaterialIcons name="bookmark" size={20} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>Saved Jobs</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recommended Jobs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended Jobs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Gigs')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => {
                  if (!job) return null;
                  return (
                    <Card key={job._id} variant="elevated" padding={16}>
                      <View style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.jobTitleRow}>
                              <Text style={[styles.jobTitle, { color: c.text }]} numberOfLines={1}>
                                {job.title}
                              </Text>
                            </View>
                            <Text style={[styles.company, { color: c.subtext }]}>{job.category}</Text>
                          </View>

                          <TouchableOpacity onPress={() => toggleLikeGig(job._id)}>
                            <Animated.View style={{ transform: [{ scale: scaleAnims[job._id] || 1 }] }}>
                              <Ionicons
                                name={likedGigs.has(job._id) ? "heart" : "heart-outline"}
                                size={24}
                                color={likedGigs.has(job._id) ? "#ef4444" : c.subtext}
                              />
                            </Animated.View>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.jobMeta}>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.text }]}>${job.budget}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="schedule" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.subtext }]}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                          </View>
                          <Badge label={job.jobType} variant="neutral" size="small" />
                        </View>

                        <View style={styles.skillsRow}>
                          {job.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <Badge key={idx} label={skill} variant="info" size="small" />
                          ))}
                        </View>

                        <View style={styles.jobActions}>
                          <Button
                            title="View Details"
                            onPress={() => navigation.navigate('JobDetail', { id: job._id })}
                            variant="outline"
                            size="small"
                            style={{ flex: 1 }}
                          />
                          <Button
                            title={job.isExternal ? "Visit Job" : "Apply Now"}
                            onPress={() => {
                              if (job.isExternal && job.applyUrl) {
                                import('react-native').then(({ Linking }) => {
                                  Linking.openURL(job.applyUrl!);
                                });
                              } else {
                                navigation.navigate('JobDetail', { id: job._id });
                              }
                            }}
                            variant="primary"
                            size="small"
                            style={{ flex: 1 }}
                          />
                        </View>
                      </View>
                    </Card>
                  );
                })
              ) : (
                <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>No recommended jobs found</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <ProfileCompletionModal
          visible={profileModalVisible}
          missingFields={missingFields}
          onComplete={handleCompleteProfile}
          onSkip={handleSkipProfile}
        />

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
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
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

