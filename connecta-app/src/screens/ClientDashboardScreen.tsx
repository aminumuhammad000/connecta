
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import * as dashboardService from '../services/dashboardService';
import * as notificationService from '../services/notificationService';
import * as profileService from '../services/profileService';
import { DashboardStats, User } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { AIButton } from '../components/AIButton';
import Sidebar from '../components/Sidebar';

const ClientDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [authModalVisible, setAuthModalVisible] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
    checkProfileStatus();
    checkAuthStatus();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      checkProfileStatus();
      checkAuthStatus();
    }, [user])
  );

  const checkAuthStatus = () => {
    if (user && !user.isVerified) {
      setAuthModalVisible(true);
    } else {
      setAuthModalVisible(false);
    }
  };

  const handleEmailVerified = () => {
    setAuthModalVisible(false);
    checkProfileStatus();
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, freelancersData, notifCount] = await Promise.all([
        dashboardService.getClientStats().catch(() => null),
        dashboardService.getRecommendedFreelancers().catch(() => []),
        notificationService.getUnreadCount().catch(() => 0),
      ]);

      setStats(statsData);
      setFreelancers(freelancersData);
      setUnreadCount(notifCount);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkProfileStatus = async () => {
    try {
      await profileService.getMyProfile();
      setProfileMissing(false);
    } catch (error: any) {
      if (error?.status === 404) {
        setProfileMissing(true);
      } else {
        setProfileMissing(false);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
    checkProfileStatus();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
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
                backgroundColor: c.isDark ? '#111827' : c.primary,
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
                <MaterialIcons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                >
                  <MaterialIcons name="notifications-none" size={20} color="#fff" />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <AIButton onPress={() => navigation.navigate('ConnectaAI')} size={18} />
              </View>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{user?.firstName || 'User'}!</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.primary + '22' }]}>
                <MaterialIcons name="work" size={24} color={c.primary} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>
                {stats?.activeProjects ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Active Projects</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B22' }]}>
                <MaterialIcons name="payment" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>
                {stats?.pendingPayments ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Payments Due</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98122' }]}>
                <MaterialIcons name="chat" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>
                {stats?.newMessages ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>New Messages</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Jobs')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name="briefcase" size={24} color={c.primary} />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>My Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Projects')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="folder-open" size={24} color="#10B981" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Projects</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('ClientPayments')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="card" size={24} color="#F59E0B" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Payments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('PostJob')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#6366F115' }]}>
                  <Ionicons name="add-circle" size={24} color="#6366F1" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Post Job</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF615' }]}>
                  <Ionicons name="settings" size={24} color="#8B5CF6" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Recommended Freelancers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended for You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClientRecommended')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {freelancers.length > 0 ? (
                freelancers.slice(0, 3).map((f: User, index: number) => (
                  <Card key={f._id || `freelancer-${index}`} variant="elevated" padding={16}>
                    <View style={styles.freelancerCard}>
                      <View style={styles.freelancerHeader}>
                        <Avatar uri={f.avatar} name={f.firstName} size={56} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.freelancerName, { color: c.text }]}>
                            {f.firstName} {f.lastName}
                          </Text>
                          <Text style={[styles.freelancerRole, { color: c.subtext }]}>Freelancer</Text>
                          <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={16} color="#F59E0B" />
                            <Text style={[styles.rating, { color: c.text }]}>5.0</Text>
                            <Text style={[styles.reviews, { color: c.subtext }]}>(0 reviews)</Text>
                          </View>
                        </View>
                        <Text style={[styles.hourlyRate, { color: c.primary }]}>$50/hr</Text>
                      </View>

                      <View style={styles.freelancerActions}>
                        <Button
                          title="View Profile"
                          onPress={() => navigation.navigate('ClientRecommended')}
                          variant="outline"
                          size="small"
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Hire Now"
                          onPress={() => navigation.navigate('PostJob')}
                          variant="primary"
                          size="small"
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  </Card>
                ))
              ) : (
                <Text style={[{ color: c.subtext, textAlign: 'center', paddingVertical: 20 }]}>
                  No recommendations available
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {
          profileMissing && (
            <View style={styles.overlay}>
              <View style={[styles.overlayCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <MaterialIcons name="person-outline" size={32} color={c.primary} />
                <Text style={[styles.overlayTitle, { color: c.text }]}>Complete your profile</Text>
                <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 8 }}>
                  Add your details to get better matches and faster approvals.
                </Text>
                <Button title="Complete Profile" onPress={() => navigation.navigate('ClientEditProfile')} size="large" />
              </View>
            </View>
          )
        }
        <EmailVerificationModal
          visible={authModalVisible}
          onSuccess={handleEmailVerified}
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
    paddingTop: 12,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    marginTop: 24,
  },
  quickAction: {
    alignItems: 'center',
    width: 70,
    marginRight: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },
  freelancerCard: {
    gap: 12,
  },
  freelancerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  freelancerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  freelancerRole: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviews: {
    fontSize: 13,
  },
  hourlyRate: {
    fontSize: 15,
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freelancerActions: {
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

export default ClientDashboardScreen;
