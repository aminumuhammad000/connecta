import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, Animated, Dimensions, Image, Modal, TextInput } from 'react-native';
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
import { DashboardStats, User } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import EmailVerificationModal from '../components/EmailVerificationModal';
import SuccessModal from '../components/SuccessModal';
import userService from '../services/userService';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../context/SocketContext';
import * as storage from '../utils/storage';

const { width } = Dimensions.get('window');

const ClientDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const { user, updateUser } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const { socket, unreadNotificationCount } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [authModalVisible, setAuthModalVisible] = React.useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '', type: 'success' as any });

  // Invite Modal State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    location: '',
    sortBy: 'relevance' as 'relevance' | 'rating' | 'rate_low' | 'rate_high',
  });
  const [draftFilters, setDraftFilters] = useState({
    minRating: 0,
    location: '',
    sortBy: 'relevance' as 'relevance' | 'rating' | 'rate_low' | 'rate_high',
  });
  const activeFilterCount = (filters.minRating > 0 ? 1 : 0) + (filters.location ? 1 : 0) + (filters.sortBy !== 'relevance' ? 1 : 0);

  // Projects State
  const [myJobs, setMyJobs] = useState<any[]>([]);

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
      const [statsData, freelancersData, jobsData] = await Promise.all([
        dashboardService.getClientStats().catch(() => null),
        dashboardService.getRecommendedFreelancers().catch(() => []),
        jobService.getMyJobs().catch(() => [])
      ]);

      setStats(statsData);
      setFreelancers(freelancersData);
      setMyJobs(jobsData);
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
        const lastShownStr = await storage.getItem('@profile_popup_last_shown');
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (!lastShownStr || now - parseInt(lastShownStr) > twoHours) {
          setProfileMissing(true);
          await storage.setItem('@profile_popup_last_shown', now.toString());
        } else {
          setProfileMissing(false);
        }
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
      setSuccessData({
        title: 'Success! 🕊️',
        message: `Your invitation for "${job.title}" has been sent to ${selectedFreelancer.firstName}.`,
        type: 'success'
      });
      setSuccessPopupVisible(true);
      setInviteModalVisible(false);
      setSelectedFreelancer(null);
    } catch (error: any) {
      console.error('Error sending invite:', error);
      if (error?.status === 403) {
        setSuccessData({
          title: 'Job Not Approved',
          message: error.message || 'You cannot invite freelancers until your job has been approved by admin.',
          type: 'warning'
        });
        setSuccessPopupVisible(true);
        setInviteModalVisible(false);
      } else {
        Alert.alert('Error', error.message || 'Failed to send invitation. Please try again.');
      }
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

  // Sort & filter freelancers
  const filteredFreelancers = useMemo(() => {
    let list = [...freelancers];

    // Apply minRating filter
    if (filters.minRating > 0) {
      list = list.filter(f => (f.rating || 0) >= filters.minRating);
    }

    // Apply location filter
    if (filters.location.trim()) {
      const loc = filters.location.toLowerCase();
      list = list.filter(f => (f.location || '').toLowerCase().includes(loc));
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        `${f.firstName || ''} ${f.lastName || ''}`.toLowerCase().includes(q) ||
        (f.jobTitle || '').toLowerCase().includes(q) ||
        (f.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
        (f.location || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (filters.sortBy === 'rate_low') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      if (filters.sortBy === 'rate_high') return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      // Default: relevance
      const scoreA = (a.rating || 0) * 20 + (a.jobSuccessScore || 0) + (a.reviews || 0);
      const scoreB = (b.rating || 0) * 20 + (b.jobSuccessScore || 0) + (b.reviews || 0);
      return scoreB - scoreA;
    });

    return list;
  }, [freelancers, searchQuery, filters]);

  const renderBadge = (count: number | undefined) => {
    if (!count || count <= 0) return null;
    return (
      <View style={{
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        height: 18,
        minWidth: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: c.background,
        paddingHorizontal: 4,
        zIndex: 10
      }}>
        <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
          {count > 99 ? '99+' : count}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  // Combine active jobs and projects for display
  const allActiveProjects = Array.isArray(myJobs) ? myJobs.filter(j => j.status === 'active' || j.status === 'in_progress') : [];

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
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{"Welcome back"} 👋</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>{user?.firstName || "User"}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>

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


          {/* Stats Overview Removed */}

          {/* Quick Actions Removed */}
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
            overflow: 'hidden',
            zIndex: 1000,
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingVertical: 15 }}
            >
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('ClientProjects')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name="briefcase" size={18} color={c.primary} />
                  {renderBadge(stats?.submittedProjects)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>{"My Projects"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Jobs')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="list" size={18} color="#10B981" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>{"Postings"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Proposals')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name="document-text" size={18} color={c.primary} />
                  {renderBadge(stats?.activeProposals)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>{"Proposals"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Chats')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F615' }]}>
                  <Ionicons name="chatbubbles" size={18} color="#3B82F6" />
                  {renderBadge(stats?.newMessages)}
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>{"Chats"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Wallet')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="wallet" size={18} color="#F59E0B" />
                </View>
                <Text style={[styles.quickActionText, { color: c.text }]} numberOfLines={1}>{"Wallet"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Recommended Freelancers */}
          <View style={styles.section}>

            {/* Search + Filter Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, gap: 10 }}>
              {/* Search Bar */}
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: c.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: c.border,
                paddingHorizontal: 14,
                gap: 10,
                height: 46,
              }}>
                <Ionicons name="search-outline" size={18} color={c.subtext} />
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: c.text }}
                  placeholder="Search by name, skill..."
                  placeholderTextColor={c.subtext}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={c.subtext} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Icon Button */}
              <TouchableOpacity
                onPress={() => {
                  setDraftFilters({ ...filters });
                  setShowFilterModal(true);
                }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: activeFilterCount > 0 ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: activeFilterCount > 0 ? c.primary : c.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? '#FFF' : c.text} />
                {activeFilterCount > 0 && (
                  <View style={{
                    position: 'absolute', top: -4, right: -4,
                    backgroundColor: '#EF4444',
                    width: 16, height: 16, borderRadius: 8,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '700' }}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Section Label below search */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Recommended Freelancers</Text>
              <Text style={{ fontSize: 12, color: c.subtext }}>{filteredFreelancers.length} found</Text>
            </View>

            <View style={{ gap: 12, paddingHorizontal: 20 }}>
              {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((f: any, index: number) => (
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

                        {/* Meta Row */}
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

                    {/* Skills */}
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
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 11,
                        borderRadius: 12,
                        backgroundColor: c.primary,
                        shadowColor: c.primary,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleInviteClick(f);
                      }}
                    >
                      <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 }}>{"Send Invite"}</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Ionicons name="search-outline" size={40} color={c.subtext} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 15, fontWeight: '600' }}>{"No freelancers found"}</Text>
                  <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 13, marginTop: 4, opacity: 0.7 }}>{"Try a different search or filter"}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {
          profileMissing && (
            <View style={styles.overlay}>
              <View style={[styles.overlayCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <MaterialIcons name="person-outline" size={32} color={c.primary} />
                <Text style={[styles.overlayTitle, { color: c.text }]}>{"Complete Your Profile"}</Text>
                <Text style={{ color: c.subtext, textAlign: 'center', marginBottom: 8 }}>
                  {"Please complete your profile to post jobs and invite freelancers."}
                </Text>
                <Button title={"Complete Profile"} onPress={() => navigation.navigate('ClientEditProfile')} size="large" />
              </View>
            </View>
          )
        }
        <EmailVerificationModal
          visible={authModalVisible}
          onSuccess={handleEmailVerified}
        />

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{
              backgroundColor: c.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '85%',
              width: '100%',
              maxWidth: 600,
              alignSelf: 'center',
            }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Filter Freelancers</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color={c.subtext} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Minimum Rating */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 12 }}>Minimum Rating</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                  {[{ label: 'Any', value: 0 }, { label: '3+', value: 3 }, { label: '4+', value: 4 }, { label: '4.5+', value: 4.5 }].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDraftFilters(prev => ({ ...prev, minRating: opt.value }))}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: draftFilters.minRating === opt.value ? c.primary : c.border,
                        backgroundColor: draftFilters.minRating === opt.value ? c.primary + '12' : c.background,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      {opt.value > 0 && <Ionicons name="star" size={13} color={draftFilters.minRating === opt.value ? c.primary : '#F59E0B'} />}
                      <Text style={{ fontSize: 13, fontWeight: '600', color: draftFilters.minRating === opt.value ? c.primary : c.text }}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Location */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 12 }}>Location</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: c.background,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  paddingHorizontal: 14,
                  gap: 8,
                  height: 46,
                  marginBottom: 24,
                }}>
                  <Ionicons name="location-outline" size={18} color={c.subtext} />
                  <TextInput
                    style={{ flex: 1, fontSize: 14, color: c.text }}
                    placeholder="e.g. Lagos, Abuja..."
                    placeholderTextColor={c.subtext}
                    value={draftFilters.location}
                    onChangeText={text => setDraftFilters(prev => ({ ...prev, location: text }))}
                  />
                  {draftFilters.location.length > 0 && (
                    <TouchableOpacity onPress={() => setDraftFilters(prev => ({ ...prev, location: '' }))}>
                      <Ionicons name="close-circle" size={16} color={c.subtext} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Sort By */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 12 }}>Sort By</Text>
                <View style={{ gap: 10, marginBottom: 32 }}>
                  {[
                    { label: 'Most Relevant', sublabel: 'Based on rating & success', value: 'relevance', icon: 'bulb-outline' },
                    { label: 'Highest Rated', sublabel: 'Top rated freelancers first', value: 'rating', icon: 'star-outline' },
                    { label: 'Rate: Low to High', sublabel: 'Most affordable first', value: 'rate_low', icon: 'trending-down-outline' },
                    { label: 'Rate: High to Low', sublabel: 'Premium freelancers first', value: 'rate_high', icon: 'trending-up-outline' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDraftFilters(prev => ({ ...prev, sortBy: opt.value as any }))}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: draftFilters.sortBy === opt.value ? c.primary : c.border,
                        backgroundColor: draftFilters.sortBy === opt.value ? c.primary + '10' : c.background,
                      }}
                    >
                      <Ionicons name={opt.icon as any} size={20} color={draftFilters.sortBy === opt.value ? c.primary : c.subtext} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: draftFilters.sortBy === opt.value ? c.primary : c.text }}>{opt.label}</Text>
                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>{opt.sublabel}</Text>
                      </View>
                      {draftFilters.sortBy === opt.value && <Ionicons name="checkmark-circle" size={20} color={c.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, alignItems: 'center' }}
                  onPress={() => {
                    const reset = { minRating: 0, location: '', sortBy: 'relevance' as const };
                    setDraftFilters(reset);
                    setFilters(reset);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: c.primary, alignItems: 'center' }}
                  onPress={() => {
                    setFilters({ ...draftFilters });
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invite Modal */}
        <Modal
          visible={inviteModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setInviteModalVisible(false)}
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
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Invite {selectedFreelancer?.firstName}</Text>
                <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={c.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 16 }}>
                Select a job to invite this freelancer to:
              </Text>

              <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 12 }}>
                {myJobs.filter(j => j.status === 'active' || j.status === 'Open').length > 0 ? (
                  myJobs.filter(j => j.status === 'active' || j.status === 'Open').map((job) => (
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
                        backgroundColor: c.background
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{job.title}</Text>
                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>₦{job.budget || 'No budget'}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', color: c.subtext, padding: 20 }}>No active jobs found. Post a job first!</Text>
                )}
              </ScrollView>

              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
                <TouchableOpacity
                  onPress={() => {
                    setInviteModalVisible(false);
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


        <SuccessModal
          visible={successPopupVisible}
          title={successData.title}
          message={successData.message}
          onClose={() => setSuccessPopupVisible(false)}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 10,
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
