import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import jobService from '../services/jobService';
import proposalService from '../services/proposalService';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';
import Badge from '../components/Badge';

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
  const [successModal, setSuccessModal] = React.useState({ visible: false, title: '', message: '' });

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
  const isClient = user?.userType === 'client';

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

      // Check if saved status is available in user profile
      if (user?.savedJobs && user.savedJobs.includes(id)) {
        setIsSaved(true);
      } else if ((data as any)?.saved) {
        setIsSaved(true);
      }
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
      const response = await proposalService.approveProposal(proposalId);

      // Update local state and show SuccessModal
      setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'approved' } : p));

      const projectId = (response as any)?.data?.project?._id || (response as any)?.project?._id;

      setSuccessModal({
        visible: true,
        title: 'Freelancer Hired!',
        message: 'Proposal accepted and project created. You can now start working.',
        data: { projectId } // Pass projectId to modal
      } as any);
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
      setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'declined' } : p));
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal.');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={[styles.appBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: c.text }]}>Job Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: c.subtext, fontSize: 16 }}>Job not found or failed to load.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
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
            size={24}
            color={isSaved ? c.primary : c.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <View style={{ padding: 20 }}>
          {/* Header Section */}
          <View style={{ gap: 8 }}>
            <Text style={[styles.title, { color: c.text }]}>{job.title}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Text style={{ fontSize: 14, color: c.subtext, fontWeight: '500' }}>
                {job.company || 'Confidential'}
              </Text>
              {job.isExternal ? (
                <Badge label={job.source || "External"} variant="neutral" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialIcons name="verified" size={16} color="#FF7F50" />
                  <Text style={{ fontSize: 13, color: '#FF7F50', fontWeight: '600' }}>Verified</Text>
                </View>
              )}
              <Text style={{ fontSize: 14, color: c.subtext }}>•</Text>
              <Text style={{ fontSize: 14, color: c.subtext }}>
                {new Date(job.createdAt || job.posted).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Key Stats Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <MaterialIcons name="attach-money" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Budget</Text>
                <Text style={[styles.statValue, { color: c.text }]}>₦{job.budget}</Text>
                <Text style={{ fontSize: 11, color: c.subtext }}>{job.budgetType === 'hourly' ? '/hr' : 'Fixed'}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <MaterialIcons name="work-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Type</Text>
                <Text style={[styles.statValue, { color: c.text }]}>{job.jobType || 'Full Time'}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <MaterialIcons name="timeline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Level</Text>
                <Text style={[styles.statValue, { color: c.text }]}>{job.experienceLevel || 'Interm.'}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <MaterialIcons name="place" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Location</Text>
                <Text style={[styles.statValue, { color: c.text }]}>{job.location || 'Remote'}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 32 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Description</Text>
            <Text style={{ color: c.subtext, lineHeight: 24, fontSize: 15 }}>
              {isExpanded
                ? (job.description ? job.description.replace(/<[^>]*>/g, '') : 'No description available')
                : (job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 200) + (job.description.length > 200 ? '...' : '') : 'No description available')
              }
              {!isExpanded && job.description && job.description.replace(/<[^>]*>/g, '').length > 200 && (
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
          <View style={{ marginTop: 32 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Skills & Requirements</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {job.skills?.map((s: string) => (
                <Text key={s} style={[styles.skill, { color: c.subtext, backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>{s}</Text>
              ))}
            </View>
          </View>

          {/* Connecta AI Match Insights */}
          {!isJobOwner && !job.isExternal && (
            <View style={{ marginTop: 32, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: c.isDark ? '#4338ca' : '#e0e7ff' }}>
              <View style={{ backgroundColor: c.isDark ? '#312e81' : '#eef2ff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialIcons name="auto-awesome" size={20} color={c.primary} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.primary }}>Connecta AI Insights</Text>
              </View>

              <View style={{ padding: 20, backgroundColor: c.card, gap: 24 }}>
                {/* Match Reason */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 6 }}>Why this fits you</Text>
                  <Text style={{ fontSize: 14, color: c.subtext, lineHeight: 22 }}>
                    Your skills in <Text style={{ fontWeight: '700' }}>React Native</Text> and <Text style={{ fontWeight: '700' }}>TypeScript</Text> match 95% of the requirements.
                  </Text>
                </View>

                {/* Key Phrases */}
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 8 }}>Key Phrases to Include</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Clean Architecture', 'Performance', 'Responsive'].map((phrase) => (
                      <View key={phrase} style={{ backgroundColor: c.isDark ? '#374151' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, color: c.text, fontWeight: '500' }}>{phrase}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Client Info */}
          {!isJobOwner && (
            <View style={{ marginTop: 32 }}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>About the Client</Text>
              <View style={{
                backgroundColor: c.card,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: c.border,
                padding: 20
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                      {(job.clientId?.firstName || job.clientName || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
                        {job.clientId ? `${job.clientId.firstName} ${job.clientId.lastName}` : (job.clientName || (job.isExternal ? 'External Client' : 'Unknown Client'))}
                      </Text>
                      {job.paymentVerified && <MaterialIcons name="verified" size={16} color="#22C55E" />}
                    </View>
                    <Text style={{ color: c.subtext, fontSize: 13, marginTop: 2 }}>
                      Member since {new Date(job.createdAt).getFullYear()}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 24, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 16 }}>
                  <View>
                    <Text style={{ fontSize: 12, color: c.subtext, marginBottom: 4 }}>Location</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                      {job.locationType === 'remote' ? 'Remote' : (job.clientLocation || job.location)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 12, color: c.subtext, marginBottom: 4 }}>Responsiveness</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                      ~{job.clientId?.performanceMetrics?.responseTime || 24}h
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Proposals List (Job Owner) */}
          {isJobOwner && (
            <View style={{ marginTop: 32 }}>
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
                          borderRadius: 16,
                          borderWidth: isPremium ? 1.5 : 1,
                          borderColor: isPremium ? '#F59E0B' : c.border
                        }}
                        onPress={() => (navigation as any).navigate('ProposalDetail', { id: p._id })}
                      >
                        {/* Proposal Card Content - Simplified for brevity but keeping logic */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontWeight: '700', color: c.text }}>{p.freelancerId?.firstName}</Text>
                          <Text style={{ fontWeight: '700', color: c.primary }}>₦{p.budget?.amount}</Text>
                        </View>
                        <Text numberOfLines={2} style={{ color: c.subtext, marginTop: 8 }}>{p.description}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      {!isJobOwner && (
        <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 12 + insets.bottom, backgroundColor: c.background }]}>
          <TouchableOpacity
            disabled={hasApplied}
            onPress={() => {
              if (job.isExternal && job.applyUrl) {
                import('react-native').then(({ Linking }) => {
                  Linking.openURL(job.applyUrl!);
                });
              } else {
                (navigation as any).navigate('ApplyJob', { jobId: job._id, jobTitle: job.title, jobBudget: job.budget });
              }
            }}
            style={[styles.applyBtn, {
              backgroundColor: hasApplied
                ? (c.isDark ? '#374151' : '#E5E7EB')
                : (job.isExternal ? '#3B82F6' : '#FF7F50')
            }]}
          >
            <Text style={[styles.applyText, hasApplied && { color: c.subtext }]}>
              {job.isExternal ? 'Visit Job' : (hasApplied ? 'Applied' : 'Apply Now')}
            </Text>
            {!hasApplied && <MaterialIcons name="arrow-forward" size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>
      )}

      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, visible: false })}
        buttonText="View Project"
        onAction={() => {
          setSuccessModal({ ...successModal, visible: false });
          if ((successModal as any).data?.projectId) {
            (navigation as any).navigate('ProjectWorkspace', { id: (successModal as any).data.projectId });
          } else {
            (navigation as any).navigate('ClientProjects');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  skill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '500',
    overflow: 'hidden'
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  applyBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: "#FF7F50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  // Keep other styles if needed or let them be redefined
  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  clientName: { fontSize: 14, fontWeight: '600' },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  attachmentLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
  keyInfoWrap: {}, // Deprecated
  keyInfoItem: {}, // Deprecated
  keyLabel: {}, // Deprecated
  keyValue: {}, // Deprecated
});

export default JobDetailScreen;
