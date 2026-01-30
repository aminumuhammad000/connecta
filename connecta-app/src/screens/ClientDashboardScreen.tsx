import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, Animated, Dimensions, Image, Modal } from 'react-native';
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
import * as jobService from '../services/jobService';
import * as collaboService from '../services/collaboService';
import { DashboardStats, User } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { AIButton } from '../components/AIButton';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../context/SocketContext';

const { width } = Dimensions.get('window');

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

  // Invite Modal State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Projects State
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [collaboProjects, setCollaboProjects] = useState<any[]>([]);
  const [selectedCollaboProject, setSelectedCollaboProject] = useState<any>(null);

  const { socket } = useSocket();

  useEffect(() => {
    loadDashboardData();
    checkProfileStatus();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        console.log('[Dashboard] Refreshing due to socket event');
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
      const [statsData, freelancersData, notifCount, jobsData, collaboData] = await Promise.all([
        dashboardService.getClientStats().catch(() => null),
        dashboardService.getRecommendedFreelancers().catch(() => []),
        notificationService.getUnreadCount().catch(() => 0),
        jobService.getMyJobs().catch(() => []),
        collaboService.getMyCollaboProjects().catch(() => [])
      ]);

      setStats(statsData);
      setFreelancers(freelancersData);
      setUnreadCount(notifCount);
      setMyJobs(jobsData);
      setCollaboProjects(collaboData);
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

  const handleInviteClick = (freelancer: any) => {
    setSelectedFreelancer(freelancer);
    setInviteModalVisible(true);
  };

  const handleSendInvite = async (job: any) => {
    if (!selectedFreelancer) return;

    try {
      setIsInviting(true);
      await jobService.inviteFreelancer(job._id, selectedFreelancer._id || selectedFreelancer.id);
      Alert.alert('Success', `Invitation sent to ${selectedFreelancer.firstName} for "${job.title}"`);
      setInviteModalVisible(false);
      setSelectedFreelancer(null);
    } catch (error: any) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleSendCollaboInvite = async (role: any) => {
    if (!selectedFreelancer) return;
    try {
      setIsInviting(true);
      await collaboService.inviteToRole(role._id, selectedFreelancer._id || selectedFreelancer.id);
      Alert.alert('Success', `Invitation sent to ${selectedFreelancer.firstName} for role "${role.title}"`);
      setInviteModalVisible(false);
      setSelectedFreelancer(null);
      setSelectedCollaboProject(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  // Combine active jobs and projects for display
  const activeJobs = myJobs.filter(j => j.status === 'active' || j.status === 'in_progress');
  const activeCollabos = collaboProjects.filter(p => p.status === 'active' || p.status === 'planning');
  const allActiveProjects = [...activeJobs, ...activeCollabos];

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
          {/* Header */}
          <View style={{ backgroundColor: c.background }}>
            <View style={[styles.header, {
              paddingTop: 10,
              paddingBottom: 80, // Increased height for overlap
              backgroundColor: '#FF7F50', // Coral to match Freelancer Dashboard
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconButton}>
                  <MaterialIcons name="menu" size={24} color="#FFF" />
                </TouchableOpacity>
                <View>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Welcome back 👋</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>{user?.firstName || 'User'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ConnectaAI')} style={styles.iconButton}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="auto-awesome" size={20} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="notifications-outline" size={22} color="#FFF" />
                    {unreadCount > 0 && (
                      <View style={{ position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FF7F50' }} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Overview - Overlapping Header */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: -50, marginBottom: 24, gap: 12, zIndex: 20, elevation: 20 }}>
            {/* Active Projects */}
            <View style={{ flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: c.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="work" size={18} color="#3B82F6" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>{formatNumber(stats?.activeProjects)}</Text>
                <Text style={{ fontSize: 10, color: c.subtext, fontWeight: '600', textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>Active Projects</Text>
              </View>
            </View>

            {/* Payments Due */}
            <View style={{ flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: c.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="payment" size={18} color="#F59E0B" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>{formatNumber(stats?.pendingPayments)}</Text>
                <Text style={{ fontSize: 10, color: c.subtext, fontWeight: '600', textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>Payments Due</Text>
              </View>
            </View>

            {/* Total Spent */}
            <View style={{ flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: c.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="account-balance-wallet" size={18} color="#10B981" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>₦{formatNumber(stats?.totalSpent)}</Text>
                <Text style={{ fontSize: 10, color: c.subtext, fontWeight: '600', textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>Total Spent</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 12 }}>
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
                onPress={() => navigation.navigate('Projects')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF615' }]}>
                  <Ionicons name="people" size={24} color="#8B5CF6" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>Team</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Active Projects List */}
          {allActiveProjects.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Active Projects</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                  <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {allActiveProjects.map((item: any) => {
                  const isCollabo = !!item.teamName;
                  return (
                    <TouchableOpacity
                      key={item._id}
                      onPress={() => isCollabo ? navigation.navigate('CollaboWorkspace', { projectId: item._id }) : navigation.navigate('JobDetail', { id: item._id })}
                      style={{
                        width: 260,
                        backgroundColor: c.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: c.border,
                        marginRight: 4
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: isCollabo ? '#8B5CF620' : '#3B82F620', borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: isCollabo ? '#8B5CF6' : '#3B82F6' }}>
                            {isCollabo ? 'COLLABO' : 'JOB'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: c.subtext }}>{item.status}</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4 }} numberOfLines={1}>{item.title}</Text>
                      <Text style={{ fontSize: 13, color: c.subtext }} numberOfLines={2}>{item.description}</Text>

                      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                          {isCollabo ? `₦${(item.totalBudget || 0).toLocaleString()}` : `₦${(item.budget || 0).toLocaleString()}`}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={16} color={c.primary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Recommended Freelancers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended for You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClientRecommended')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, paddingHorizontal: 20 }}>
              {freelancers.length > 0 ? (
                freelancers.slice(0, 5).map((f: any, index: number) => (
                  <TouchableOpacity
                    key={f._id || f.id || `freelancer-${index}`}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('FreelancerPublicProfile', { id: f._id || f.id })}
                    style={{
                      backgroundColor: c.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: c.border,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1
                    }}
                  >
                    {/* Header: Avatar, Name, Rate */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Image
                        source={{ uri: f.avatar || 'https://via.placeholder.com/150' }}
                        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd' }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }} numberOfLines={1}>
                              {f.firstName || f.lastName ? `${f.firstName || ''} ${f.lastName || ''}`.trim() : 'Unknown Freelancer'}
                            </Text>
                            <Text style={{ color: c.subtext, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{f.jobTitle || 'Freelancer'}</Text>
                          </View>
                          {f.hourlyRate && (
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>₦{f.hourlyRate}</Text>
                              <Text style={{ fontSize: 11, color: c.subtext }}>/hr</Text>
                            </View>
                          )}
                        </View>

                        {/* Meta Row - Unified */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialIcons name="star" size={16} color="#F59E0B" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{(f.rating || 0).toFixed(1)}</Text>
                            <Text style={{ fontSize: 13, color: c.subtext }}>({f.reviews || 0})</Text>
                          </View>

                          {f.jobSuccessScore && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons name="bolt" size={16} color="#10B981" />
                              <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>{f.jobSuccessScore}%</Text>
                            </View>
                          )}

                          {f.location && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons name="place" size={14} color={c.subtext} />
                              <Text style={{ fontSize: 12, color: c.subtext }} numberOfLines={1}>{f.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Skills (Text based, clean) */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                      {f.skills?.slice(0, 4).map((s: string, i: number) => (
                        <Text key={`${s}-${i}`} style={{ fontSize: 12, color: c.subtext, backgroundColor: c.isDark ? '#374151' : '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: 'hidden', fontWeight: '500' }}>
                          {s}
                        </Text>
                      ))}
                      {f.skills?.length > 4 && (
                        <Text style={{ fontSize: 12, color: c.subtext, paddingVertical: 6, paddingHorizontal: 4 }}>+{f.skills.length - 4} more</Text>
                      )}
                    </View>

                    {/* Action Divider */}
                    <View style={{ height: 1, backgroundColor: c.border, marginVertical: 16 }} />

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border }}
                        onPress={() => navigation.navigate('FreelancerPublicProfile', { id: f._id || f.id })}
                      >
                        <MaterialIcons name="person" size={18} color={c.text} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>View Profile</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: c.primary }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleInviteClick(f);
                        }}
                      >
                        <MaterialIcons name="send" size={18} color="#FFF" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Invite</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>No recommendations available</Text>
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

        {/* Invite Modal */}
        <Modal
          visible={inviteModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setInviteModalVisible(false);
            setSelectedCollaboProject(null);
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{
              backgroundColor: c.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '80%',
              width: '100%',
              maxWidth: 600,
              alignSelf: 'center',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Invite {selectedFreelancer?.firstName}</Text>
                  {selectedCollaboProject && (
                    <TouchableOpacity onPress={() => setSelectedCollaboProject(null)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <MaterialIcons name="arrow-back" size={14} color={c.primary} />
                      <Text style={{ fontSize: 12, color: c.primary, fontWeight: '600', marginLeft: 4 }}>Back to projects</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => {
                  setInviteModalVisible(false);
                  setSelectedCollaboProject(null);
                }}>
                  <MaterialIcons name="close" size={24} color={c.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 16 }}>
                {selectedCollaboProject ? `Select a role in "${selectedCollaboProject.title}":` : 'Select a job or team project to invite this freelancer to:'}
              </Text>

              <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 12 }}>
                {!selectedCollaboProject ? (
                  <>
                    {/* Individual Jobs Section */}
                    {myJobs.length > 0 ? (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: c.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Individual Jobs</Text>
                        {myJobs.filter(j => j.status === 'active' || j.status === 'Open').map((job) => (
                          <TouchableOpacity
                            key={job._id}
                            onPress={() => handleSendInvite(job)}
                            disabled={isInviting}
                            style={{
                              padding: 16,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: c.border,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 8,
                              backgroundColor: c.background
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{job.title}</Text>
                              <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>₦{job.budget || 'No budget'}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ textAlign: 'center', color: c.subtext, padding: 20, display: collaboProjects.length === 0 ? 'flex' : 'none' }}>No active individual jobs found.</Text>
                    )}

                    {/* Collabo Projects Section */}
                    {collaboProjects.length > 0 && (
                      <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: c.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Team Projects (Collabo)</Text>
                        {collaboProjects.map((project) => (
                          <TouchableOpacity
                            key={project._id}
                            onPress={() => setSelectedCollaboProject(project)}
                            disabled={isInviting}
                            style={{
                              padding: 16,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: '#8B5CF640',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 8,
                              backgroundColor: '#8B5CF605'
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{project.title}</Text>
                              <Text style={{ fontSize: 12, color: '#8B5CF6', marginTop: 2 }}>{project.teamName || 'Team Project'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={{ fontSize: 12, color: c.subtext, marginRight: 4 }}>{project.roles?.filter((r: any) => r.status === 'open').length} roles</Text>
                              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {myJobs.length === 0 && collaboProjects.length === 0 && (
                      <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>No active projects found.</Text>
                    )}
                  </>
                ) : (
                  /* Roles Selection for Collabo Project */
                  <View>
                    {selectedCollaboProject.roles?.filter((r: any) => r.status === 'open').length > 0 ? (
                      selectedCollaboProject.roles.filter((r: any) => r.status === 'open').map((role: any) => (
                        <TouchableOpacity
                          key={role._id}
                          onPress={() => handleSendCollaboInvite(role)}
                          disabled={isInviting}
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: c.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                            backgroundColor: c.background
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{role.title}</Text>
                            <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>₦{role.budget?.toLocaleString()}</Text>
                          </View>
                          <MaterialIcons name="send" size={18} color={c.primary} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>No open roles in this project.</Text>
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
                <TouchableOpacity
                  onPress={() => {
                    setInviteModalVisible(false);
                    setSelectedCollaboProject(null);
                    navigation.navigate('PostJob');
                  }}
                  style={{
                    backgroundColor: c.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <MaterialIcons name="add-circle-outline" size={20} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Post New Job</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
