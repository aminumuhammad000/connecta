import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import jobService from '../services/jobService';

const JobDetailScreen: React.FC = () => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const [job, setJob] = React.useState<any>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

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

  const handleSave = async () => {
    // Implement save functionality
    setIsSaved(!isSaved);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: c.text }}>Job not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            <Text style={{ color: c.subtext, fontSize: 12 }}>Posted by {job.clientName || 'Unknown'} ★ {job.clientRating || '0.0'}</Text>
            <Text style={{ color: c.subtext, fontSize: 12 }}>Posted {new Date(job.createdAt).toLocaleDateString()}</Text>
          </View>

          {/* Key Info */}
          <View style={[styles.keyInfoWrap, { borderTopColor: c.border, borderBottomColor: c.border }]}>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Budget</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>${job.budget}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Duration</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.duration || 'N/A'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Experience</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.experienceLevel || 'Intermediate'}</Text>
            </View>
            <View style={styles.keyInfoItem}>
              <Text style={[styles.keyLabel, { color: c.subtext }]}>Location</Text>
              <Text style={[styles.keyValue, { color: c.text }]}>{job.location || 'Remote'}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Job Description</Text>
            <Text style={{ color: c.subtext, lineHeight: 18, fontSize: 13 }}>
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

          {/* Client */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>About the Client</Text>
            <View style={[styles.clientCard, { borderColor: c.border, backgroundColor: c.card }]}>
              <Image
                source={{ uri: job.clientAvatar || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: c.text }]}>{job.clientName || 'Client'}</Text>
                <Text style={{ color: c.subtext, fontSize: 11 }}>{job.clientLocation || 'Location Hidden'}</Text>
                <Text style={{ color: c.subtext, fontSize: 10, marginTop: 4 }}>{job.clientJobsPosted || 0} Jobs Posted • Member Since {new Date(job.clientJoinedAt || Date.now()).getFullYear()}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </View>
          </View>

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

      {/* Fixed CTA */}
      <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: c.primary }]}
          onPress={() => navigation.navigate('ProposalDetail', { jobId: job._id })} // Or a dedicated ApplyScreen
        >
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
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
