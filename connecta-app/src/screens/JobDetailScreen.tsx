import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import jobService from '../services/jobService';
import proposalService from '../services/proposalService';
import { useAuth } from '../context/AuthContext';

const JobDetailScreen: React.FC = () => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const { user } = useAuth();

  const [job, setJob] = React.useState<any>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasApplied, setHasApplied] = React.useState(false);

  // Use useFocusEffect to re-check when returning from ApplyJobScreen
  useFocusEffect(
    React.useCallback(() => {
      if (id && user) {
        checkApplicationStatus();
      }
    }, [id, user])
  );

  React.useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);
  // Client-specific state
  const [proposals, setProposals] = React.useState<any[]>([]);
  const isClient = user?.role === 'client';

  // Check if current user is the owner of this job
  const isJobOwner = React.useMemo(() => {
    if (!job || !user || !isClient) return false;
    const jobOwnerId = job.clientId?._id || job.clientId;
    return jobOwnerId === user._id;
  }, [job, user, isClient]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const data = await jobService.getJobById(id).catch(() => null);
      setJob(data);
      // Check if saved status is available in data or requires separate call
      if (data?.saved) setIsSaved(true);
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      if (!isJobOwner) {
        return;
      }
      const data = await proposalService.getProposalsByJobId(id);
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  React.useEffect(() => {
    if (isJobOwner) {
      loadProposals();
    }
  }, [isJobOwner]);

  const checkApplicationStatus = async () => {
    try {
      if (!user?._id) return;
      const proposals = await proposalService.getFreelancerProposals(user._id);
      // Check if any proposal matches this job ID
      // API might return populated objects, handle both string ID and object ID
      const applied = proposals.some((p: any) => {
        const pJobId = typeof p.jobId === 'object' ? p.jobId?._id : p.jobId;
        return pJobId === id;
      });
      setHasApplied(applied);
    } catch (error) {
      console.log('Error checking application status:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await jobService.unsaveJob(id);
      } else {
        await jobService.saveJob(id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await proposalService.approveProposal(proposalId);
      alert('Proposal accepted! Project created.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      alert(error?.message || 'Failed to accept proposal.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await proposalService.rejectProposal(proposalId);
      loadProposals(); // Refresh list
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: c.text }]}>Job Details</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Save"
          onPress={handleSave}
        >
          <MaterialIcons
            name={isSaved ? "bookmark" : "bookmark-border"}
            size={22}
            color={isSaved ? c.primary : c.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <Text style={[styles.title, { color: c.text }]}>{job.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="schedule" size={14} color={c.subtext} />
              <Text style={{ color: c.subtext, fontSize: 12 }}>Posted {new Date(job.createdAt || job.posted).toLocaleDateString()}</Text>
            </View>
            {job.paymentVerified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <MaterialIcons name="verified" size={14} color="#22C55E" />
                <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '600' }}>Payment Verified</Text>
              </View>
            )}
            {!job.paymentVerified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,165,0,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <MaterialIcons name="info-outline" size={14} color="orange" />
                <Text style={{ color: 'orange', fontSize: 11, fontWeight: '600' }}>Payment Unverified</Text>
              </View>
            )}
            {isJobOwner && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <MaterialIcons name="person" size={14} color="#3b82f6" />
                <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}>Your Job</Text>
              </View>
            )}
          </View>

          {/* Key Info */}
          <View style={[styles.keyInfoWrap, { borderTopColor: c.border, borderBottomColor: c.border }]}>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Budget</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>${job.budget}</Text>
              <Text style={{ fontSize: 10, color: c.subtext }}>{job.budgetType === 'hourly' ? '/hr' : 'Fixed Price'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Duration</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.duration || 'N/A'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Experience</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.experienceLevel || job.experience || 'Intermediate'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Location</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.location || 'Remote'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Type</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.jobType || 'Full Time'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Applicants</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.applicants || 0}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Job Description</Text>
            <Text style={{ color: c.subtext, lineHeight: 22, fontSize: 14 }}>
              {isExpanded ? job.description : (job.description?.substring(0, 150) + '...')}
              {!isExpanded && job.description?.length > 150 && (
                <Text
                  style={{ color: c.primary, fontWeight: '600' }}
                  onPress={() => setIsExpanded(true)}
                >
                  {' '}Read More
                </Text>
              )}
            </Text>
          </View>

          {/* Skills */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Required Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {job.skills?.map((s: string) => (
                <Text key={s} style={[styles.skill, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.15)' : 'rgba(253,103,48,0.08)' }]}>{s}</Text>
              ))}
            </View>
          </View>

          {/* Client Info (Only show if NOT job owner) */}
          {!isJobOwner && (
            <View style={{ marginTop: 24, padding: 16, backgroundColor: c.card, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
              <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 12 }]}>About the Client</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {(job.clientId?.firstName || job.clientName || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.clientName, { color: c.text }]}>
                      {job.clientId ? `${job.clientId.firstName} ${job.clientId.lastName}` : (job.clientName || 'Unknown Client')}
                    </Text>
                    {job.paymentVerified && <MaterialIcons name="verified" size={14} color="#22C55E" />}
                  </View>
                  <Text style={{ color: c.subtext, fontSize: 12, marginTop: 2 }}>
                    {job.locationType === 'remote' ? 'Remote Client' : (job.clientLocation || job.location)}
                  </Text>
                  <Text style={{ color: c.subtext, fontSize: 11, marginTop: 4 }}>
                    Email: {job.clientId?.email ? 'Verified' : 'Unverified'} • Joined {new Date(job.createdAt).getFullYear()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Proposals List (Only for Job Owner) */}
          {isJobOwner && (
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Proposals ({proposals.length})</Text>
              {proposals.length === 0 ? (
                <Text style={{ color: c.subtext, marginTop: 8 }}>No proposals yet.</Text>
              ) : (
                <View style={{ gap: 16, marginTop: 12 }}>
                  {proposals.map((p) => {
                    const isPremium = p.freelancerId?.isPremium;
                    return (
                      <TouchableOpacity
                        key={p._id}
                        style={{
                          padding: 16,
                          backgroundColor: isPremium ? (c.isDark ? '#3D2800' : '#FFFBEB') : c.card,
                          borderRadius: 12,
                          borderWidth: isPremium ? 1.5 : StyleSheet.hairlineWidth,
                          borderColor: isPremium ? '#F59E0B' : c.border
                        }}
                        onPress={() => navigation.navigate('ProposalDetail', { id: p._id })}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View>
                              <Image
                                source={{ uri: p.freelancerId?.profileImage || `https://ui-avatars.com/api/?name=${p.freelancerId?.firstName}+${p.freelancerId?.lastName}` }}
                                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' }}
                              />
                              {isPremium && (
                                <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#F59E0B', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFF' }}>
                                  <MaterialIcons name="star" size={10} color="#FFF" />
                                </View>
                              )}
                            </View>
                            <View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
                                  {p.freelancerId?.firstName} {p.freelancerId?.lastName}
                                </Text>
                                {isPremium && <MaterialIcons name="verified" size={16} color="#F59E0B" />}
                              </View>
                              <Text style={{ fontSize: 12, color: c.subtext }}>{p.freelancerId?.title || 'Freelancer'}</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: c.primary }}>${p.budget?.amount}</Text>
                        </View>

                        <Text style={{ marginTop: 12, fontSize: 14, color: c.text, lineHeight: 20 }}>
                          {p.description}
                        </Text>

                        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                          <TouchableOpacity
                            style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => handleAcceptProposal(p._id)}
                          >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Hire</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ flex: 1, height: 40, borderRadius: 8, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => handleRejectProposal(p._id)}
                          >
                            <Text style={{ color: c.text, fontWeight: '600' }}>Decline</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => navigation.navigate('MessagesDetail', {
                              receiverId: p.freelancerId._id,
                              userName: `${p.freelancerId.firstName} ${p.freelancerId.lastName}`,
                              userAvatar: p.freelancerId.profileImage
                            })}
                          >
                            <MaterialIcons name="chat" size={20} color={c.subtext} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Attachments */}
          {job.attachments?.length > 0 && (
            <View style={{ marginTop: 16, marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Attachments</Text>
              <View style={{ gap: 8 }}>
                {job.attachments.map((att: any, index: number) => (
                  <View key={index} style={[styles.attachment, { borderColor: c.border }]}>
                    <MaterialIcons name="description" size={20} color={c.primary} />
                    <Text style={[styles.attachmentLabel, { color: c.text }]}>{att.name}</Text>
                    <MaterialIcons name="download" size={20} color={c.subtext} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA (Hide 'Apply Now' for Job Owner) */}
      {!isJobOwner && (
        <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: hasApplied ? (c.isDark ? '#374151' : '#E5E7EB') : c.primary }]}
            disabled={hasApplied}
            onPress={() => navigation.navigate('ApplyJob', { jobId: job._id, jobTitle: job.title, jobBudget: job.budget })}
          >
            <Text style={[styles.applyText, hasApplied && { color: c.subtext }]}>
              {hasApplied ? 'Applied' : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );


};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  appBarTitle: { fontSize: 16, fontWeight: '600' },

  title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

  keyInfoWrap: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyInfoItem: { width: '50%', paddingVertical: 14 },
  keyLabel: { fontSize: 11, fontWeight: '500' },
  keyValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  skill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 11, fontWeight: '500' },

  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  clientName: { fontSize: 14, fontWeight: '600' },

  attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  attachmentLabel: { flex: 1, fontSize: 13, fontWeight: '500' },

  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 8 },
  applyBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default JobDetailScreen;
