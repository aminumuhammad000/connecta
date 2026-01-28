import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as dashboardService from '../services/dashboardService';
import * as jobService from '../services/jobService';
import * as collaboService from '../services/collaboService';
import { User, Job } from '../types';

interface FreelancerItem {
  _id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatar: string;
  rating: number;
  reviews: number;
  skills: string[];
  jobSuccessScore?: number;
  userType?: string;
  hourlyRate?: number;
  location?: string;
}

// ... existing imports ...

const ClientRecommendedFreelancersScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [q, setQ] = useState('');
  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]); // Changed to any[] to support both types
  const [inviteSelectedJob, setInviteSelectedJob] = useState<any | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Invite Modal State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerItem | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Fetch Freelancers first (Critical Data)
      const freelancersData = await dashboardService.getRecommendedFreelancers();
      setFreelancers(freelancersData as any);
    } catch (error) {
      console.error('Error loading freelancers:', error);
    }

    try {
      // 2. Fetch Jobs & Projects (Secondary Data for Invite)
      const [jobsData, collaboProjects] = await Promise.all([
        jobService.getMyJobs().catch(err => { console.warn('Failed to load jobs', err); return []; }),
        (collaboService as any).getMyProjects().catch((err: any) => { console.warn('Failed to load projects', err); return []; })
      ]);

      // Format Jobs
      const formattedJobs = (jobsData || []).map((j: any) => ({
        _id: j._id,
        title: j.title,
        subtitle: 'Individual Job',
        budget: j.budget?.min || j.salary?.min || 0,
        type: 'job',
        category: j.category,
        skills: j.skills
      }));

      // Format Collabo Roles
      const formattedCollaboRoles: any[] = [];
      const projectsList = Array.isArray(collaboProjects) ? collaboProjects : (collaboProjects as any)?.projects || [];

      (projectsList || []).forEach((p: any) => {
        if (p.roles && p.roles.length > 0) {
          p.roles.forEach((r: any) => {
            if (r.status === 'open' || !r.freelancerId) {
              formattedCollaboRoles.push({
                _id: r._id,
                title: r.title,
                subtitle: `${p.title} (Team Role)`,
                budget: r.budget,
                type: 'collabo',
                projectId: p._id,
                category: p.category,
                skills: r.skills
              });
            }
          });
        }
      });

      setMyJobs([...formattedJobs, ...formattedCollaboRoles]);

    } catch (error) {
      console.error('Error loading invite data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleInviteClick = (freelancer: FreelancerItem) => {
    setSelectedFreelancer(freelancer);
    setInviteSelectedJob(null); // Reset selection
    setInviteModalVisible(true);
  };

  const handleSendInvite = async () => {
    if (!selectedFreelancer || !inviteSelectedJob) return;

    try {
      setIsInviting(true);

      if (inviteSelectedJob.type === 'collabo') {
        await (collaboService as any).inviteToRole(inviteSelectedJob._id, selectedFreelancer._id);
        Alert.alert('Success', `Invitation sent to ${selectedFreelancer.firstName} for "${inviteSelectedJob.title}"`);
      } else {
        await (jobService as any).inviteFreelancer(inviteSelectedJob._id, selectedFreelancer._id);
        Alert.alert('Success', `Invitation sent to ${selectedFreelancer.firstName} for "${inviteSelectedJob.title}"`);
      }

      setInviteModalVisible(false);
      setSelectedFreelancer(null);
      setInviteSelectedJob(null);
    } catch (error: any) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  // ...

  {/* Invite Modal */ }
  <Modal
    visible={inviteModalVisible}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setInviteModalVisible(false)}
  >
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Invite {selectedFreelancer?.firstName}</Text>
          <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
            <MaterialIcons name="close" size={24} color={c.subtext} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 16 }}>
          Select a job or project role to invite this freelancer to:
        </Text>

        <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 12 }}>
          {myJobs.length > 0 ? (
            myJobs.map((item) => (
              <TouchableOpacity
                key={`${item.type}-${item._id}`}
                onPress={() => setInviteSelectedJob(item)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: inviteSelectedJob?._id === item._id ? c.primary : c.border,
                  backgroundColor: inviteSelectedJob?._id === item._id ? c.primary + '08' : c.card,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      backgroundColor: item.type === 'collabo' ? '#8B5CF6' + '20' : '#10B981' + '20',
                      borderWidth: 1,
                      borderColor: item.type === 'collabo' ? '#8B5CF6' : '#10B981'
                    }}>
                      <Text style={{
                        color: item.type === 'collabo' ? '#8B5CF6' : '#10B981',
                        fontSize: 10, fontWeight: '800', letterSpacing: 0.5
                      }}>
                        {item.type === 'collabo' ? 'COLLABO' : 'JOB'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, flex: 1 }} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name={item.type === 'collabo' ? 'groups' : 'work'} size={14} color={c.subtext} />
                    <Text style={{ fontSize: 13, color: c.subtext, flex: 1 }} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <MaterialIcons name="payments" size={14} color={c.primary} />
                    <Text style={{ fontSize: 13, color: c.primary, fontWeight: '600' }}>
                      {item.budget ? `₦${item.budget.toLocaleString()}` : 'Budget Negotiable'}
                    </Text>
                  </View>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    borderWidth: 2,
                    borderColor: inviteSelectedJob?._id === item._id ? c.primary : c.border,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: inviteSelectedJob?._id === item._id ? c.primary : 'transparent'
                  }}>
                    {inviteSelectedJob?._id === item._id && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.border + '30', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="work-off" size={28} color={c.subtext} />
              </View>
              <Text style={{ textAlign: 'center', color: c.text, fontSize: 16, fontWeight: '600' }}>
                No Active Jobs or Projects
              </Text>
              <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 14, maxWidth: 240 }}>
                You need to post a job or create a Collabo project before you can invite freelancers.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border, gap: 12 }}>
          <TouchableOpacity
            onPress={handleSendInvite}
            disabled={!inviteSelectedJob || isInviting}
            style={{
              backgroundColor: inviteSelectedJob ? c.primary : c.border,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: (!inviteSelectedJob || isInviting) ? 0.7 : 1
            }}
          >
            {isInviting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Send Invitation</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setInviteModalVisible(false);
              navigation.navigate('PostJob');
            }}
            style={{
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <MaterialIcons name="add-circle-outline" size={20} color={c.primary} />
            <Text style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>Post New Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

  const filtered = useMemo(() => {
    let result = freelancers;

    // Filter by Search Query
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      result = result.filter((f: any) =>
        `${f.firstName} ${f.lastName} `.toLowerCase().includes(s) ||
        f.jobTitle?.toLowerCase().includes(s) ||
        f.skills?.some((skill: string) => skill.toLowerCase().includes(s))
      );
    }

    // Filter by Selected Job (Category/Skills)
    if (selectedJob) {
      result = result.filter((f: any) => {
        // 1. Match Category/Title
        const titleMatch = f.jobTitle?.toLowerCase().includes(selectedJob.category?.toLowerCase() || '') ||
          f.jobTitle?.toLowerCase().includes(selectedJob.title?.toLowerCase() || '');

        // 2. Match Skills (at least one)
        const skillMatch = f.skills?.some((s: string) =>
          selectedJob.skills?.some((js: string) => js.toLowerCase() === s.toLowerCase())
        );

        return titleMatch || skillMatch;
      });
    }

    return result;
  }, [freelancers, q, selectedJob]);

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
        {/* Top App Bar */}
        <View style={[styles.appBarWrap, { borderBottomColor: c.border }]}>
          <View style={styles.appBar}>
            <TouchableOpacity onPress={() => navigation.goBack?.()} accessibilityLabel="Go back" style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={22} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: c.text }]}>Recommended For You</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search & Filter */}
          <View style={styles.searchRow}>
            <View style={[styles.searchWrap, { backgroundColor: c.card }]}>
              <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginLeft: 12, marginRight: 6 }} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search freelancers..."
                placeholderTextColor={c.subtext}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialIcons name="filter-list" size={24} color={c.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Card Overlay */}
        {showFilters && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ backgroundColor: c.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: c.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Filter by Job</Text>
                {selectedJob && (
                  <TouchableOpacity onPress={() => setSelectedJob(null)}>
                    <Text style={{ fontSize: 12, color: c.primary, fontWeight: '600' }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ gap: 8 }}>
                {myJobs.length > 0 ? (
                  myJobs.map((job) => (
                    <TouchableOpacity
                      key={job._id}
                      onPress={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: selectedJob?._id === job._id ? c.primary + '15' : (c.isDark ? '#374151' : '#F3F4F6'),
                        borderWidth: 1,
                        borderColor: selectedJob?._id === job._id ? c.primary : 'transparent',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: selectedJob?._id === job._id ? c.primary : c.text }} numberOfLines={1}>
                          {job.title}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.subtext, marginTop: 2 }}>
                          {job.category} • {job.skills?.length || 0} skills
                        </Text>
                      </View>
                      {selectedJob?._id === job._id && (
                        <MaterialIcons name="check" size={16} color={c.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: c.subtext, fontSize: 13, textAlign: 'center', padding: 8 }}>
                    No active jobs found. Post a job to filter recommendations.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.meta, { color: c.subtext }]}>
          {selectedJob
            ? `Recommended for "${selectedJob.title}"`
            : "Top freelancers based on your profile"
          }
        </Text>

        {/* List */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, gap: 16 }}>
          {filtered.map((f, index) => (
            <TouchableOpacity
              key={f._id || (f as any).id || `freelancer-${index}`}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('FreelancerPublicProfile', { id: f._id || (f as any).id })}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            >
              {/* Header: Avatar, Name, Rate */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Image source={{ uri: f.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="star" size={16} color="#F59E0B" />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{(f.rating || 0).toFixed(1)}</Text>
                      <Text style={{ fontSize: 13, color: c.subtext }}>({f.reviews || 0})</Text>
                    </View>

                    {f.jobSuccessScore && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name="bolt" size={16} color="#10B981" />
                        <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>{f.jobSuccessScore}% Success</Text>
                      </View>
                    )}
                  </View>

                  {f.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <MaterialIcons name="place" size={14} color={c.subtext} />
                      <Text style={{ fontSize: 12, color: c.subtext }}>{f.location}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Skills (Text based, clean) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {f.skills?.slice(0, 4).map((s, i) => (
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
                  onPress={() => navigation.navigate('FreelancerPublicProfile', { id: f._id || (f as any).id })}
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
          ))}
        </ScrollView>

        {/* Invite Modal */}
        <Modal
          visible={inviteModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Invite {selectedFreelancer?.firstName}</Text>
                <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={c.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 16 }}>
                Select a job to invite this freelancer to:
              </Text>

              <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 12 }}>
                {myJobs.length > 0 ? (
                  myJobs.map((item) => (
                    <TouchableOpacity
                      key={`${item.type}-${item._id}`}
                      onPress={() => setInviteSelectedJob(item)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: inviteSelectedJob?._id === item._id ? c.primary : c.border,
                        backgroundColor: inviteSelectedJob?._id === item._id ? c.primary + '08' : c.card,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <View style={{
                            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                            backgroundColor: item.type === 'collabo' ? '#8B5CF6' + '20' : '#10B981' + '20',
                            borderWidth: 1,
                            borderColor: item.type === 'collabo' ? '#8B5CF6' : '#10B981'
                          }}>
                            <Text style={{
                              color: item.type === 'collabo' ? '#8B5CF6' : '#10B981',
                              fontSize: 10, fontWeight: '800', letterSpacing: 0.5
                            }}>
                              {item.type === 'collabo' ? 'COLLABO' : 'JOB'}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, flex: 1 }} numberOfLines={1}>
                            {item.title}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <MaterialIcons name={item.type === 'collabo' ? 'groups' : 'work'} size={14} color={c.subtext} />
                          <Text style={{ fontSize: 13, color: c.subtext, flex: 1 }} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <MaterialIcons name="payments" size={14} color={c.primary} />
                          <Text style={{ fontSize: 13, color: c.primary, fontWeight: '600' }}>
                            {item.budget ? `₦${item.budget.toLocaleString()}` : 'Budget Negotiable'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <View style={{
                          width: 24, height: 24, borderRadius: 12,
                          borderWidth: 2,
                          borderColor: inviteSelectedJob?._id === item._id ? c.primary : c.border,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: inviteSelectedJob?._id === item._id ? c.primary : 'transparent'
                        }}>
                          {inviteSelectedJob?._id === item._id && <MaterialIcons name="check" size={16} color="#FFF" />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.border + '30', alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="work-off" size={28} color={c.subtext} />
                    </View>
                    <Text style={{ textAlign: 'center', color: c.text, fontSize: 16, fontWeight: '600' }}>
                      No Active Jobs or Projects
                    </Text>
                    <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 14, maxWidth: 240 }}>
                      You need to post a job or create a Collabo project before you can invite freelancers.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border, gap: 12 }}>
                <TouchableOpacity
                  onPress={handleSendInvite}
                  disabled={!inviteSelectedJob || isInviting}
                  style={{
                    backgroundColor: inviteSelectedJob ? c.primary : c.border,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: (!inviteSelectedJob || isInviting) ? 0.7 : 1
                  }}
                >
                  {isInviting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={20} color="#FFF" />
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Send Invitation</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setInviteModalVisible(false);
                    navigation.navigate('PostJob');
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <MaterialIcons name="add-circle-outline" size={20} color={c.primary} />
                  <Text style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>Post New Job</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

function Chip({ label, leftIcon, active }: { label: string; leftIcon?: keyof typeof MaterialIcons.glyphMap; active?: boolean }) {
  const c = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: active ? c.primary + '33' : c.card }]}>
      <Text style={[styles.chipText, { color: active ? c.primary : c.text }]}>{label}</Text>
      {leftIcon ? <MaterialIcons name={leftIcon} size={18} color={active ? c.primary : c.text} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  title: { fontSize: 18, fontWeight: '800' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  searchWrap: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  filterBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 16, paddingTop: 8, fontSize: 12 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd' },
  name: { fontSize: 16, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 32, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
});

export default ClientRecommendedFreelancersScreen;
