import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import jobService from '../services/jobService';
import { Job } from '../types';

const FreelancerMatchedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'fixed' | 'hourly' | 'remote'>('all');
  const [savedGigs, setSavedGigs] = useState<Set<string>>(new Set());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const jobsData = await jobService.getRecommendedJobs(50);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' => {
    if (status === 'Featured') return 'success';
    if (status === 'Hot') return 'warning';
    return 'primary';
  };

  const toggleSaveGig = (gigId: string) => {
    setSavedGigs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gigId)) {
        newSet.delete(gigId);
      } else {
        newSet.add(gigId);
      }
      return newSet;
    });
  };

  // Helper function to format posted time
  const formatPostedTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Filter jobs based on selected filter and search query
  const filteredJobs = jobs.filter(job => {
    if (!job) return false;
    // Filter by type
    if (selectedFilter === 'fixed' && job.budgetType !== 'fixed') return false;
    if (selectedFilter === 'hourly' && job.budgetType !== 'hourly') return false;
    if (selectedFilter === 'remote' && job.locationType !== 'remote') return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    return true;
  });

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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Find Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FreelancerSavedGigs')} style={styles.iconBtn}>
            <MaterialIcons name="bookmark" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 84 }} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.section}>
            <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialIcons name="search" size={20} color={c.subtext} />
              <TextInput
                placeholder="Search by keyword, skill..."
                placeholderTextColor={c.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: c.text }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={20} color={c.subtext} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === 'all'
                      ? { backgroundColor: c.primary, borderWidth: 0 }
                      : { backgroundColor: c.card, borderColor: c.border }
                  ]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={selectedFilter === 'all' ? styles.filterChipTextActive : [styles.filterChipText, { color: c.text }]}>
                    All Jobs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === 'fixed'
                      ? { backgroundColor: c.primary, borderWidth: 0 }
                      : { backgroundColor: c.card, borderColor: c.border }
                  ]}
                  onPress={() => setSelectedFilter('fixed')}
                >
                  <Text style={selectedFilter === 'fixed' ? styles.filterChipTextActive : [styles.filterChipText, { color: c.text }]}>
                    Fixed Price
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === 'hourly'
                      ? { backgroundColor: c.primary, borderWidth: 0 }
                      : { backgroundColor: c.card, borderColor: c.border }
                  ]}
                  onPress={() => setSelectedFilter('hourly')}
                >
                  <Text style={selectedFilter === 'hourly' ? styles.filterChipTextActive : [styles.filterChipText, { color: c.text }]}>
                    Hourly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === 'remote'
                      ? { backgroundColor: c.primary, borderWidth: 0 }
                      : { backgroundColor: c.card, borderColor: c.border }
                  ]}
                  onPress={() => setSelectedFilter('remote')}
                >
                  <Text style={selectedFilter === 'remote' ? styles.filterChipTextActive : [styles.filterChipText, { color: c.text }]}>
                    Remote
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Jobs List */}
          <View style={styles.section}>
            <Text style={[styles.resultsText, { color: c.subtext }]}>{filteredJobs.length} jobs found</Text>

            <View style={{ gap: 12, marginTop: 12 }}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => {
                  if (!job) return null;
                  return (
                    <Card key={job._id} variant="elevated" padding={16}>
                      <View style={styles.gigCard}>
                        <View style={styles.gigHeader}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.titleRow}>
                              <Text style={[styles.gigTitle, { color: c.text }]} numberOfLines={2}>
                                {job.title}
                              </Text>
                              {job.status === 'active' && (
                                <Badge label="Active" variant="success" size="small" />
                              )}
                            </View>
                            <Text style={[styles.company, { color: c.subtext }]}>{job.company || 'Company'}</Text>
                          </View>
                          <TouchableOpacity onPress={() => toggleSaveGig(job._id)}>
                            <MaterialIcons
                              name={savedGigs.has(job._id) ? "bookmark" : "bookmark-border"}
                              size={24}
                              color={savedGigs.has(job._id) ? c.primary : c.subtext}
                            />
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.description, { color: c.subtext }]} numberOfLines={2}>
                          {job.description || job.summary || 'No description available'}
                        </Text>

                        <View style={styles.gigMeta}>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.text }]}>{job.budget || 'N/A'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="schedule" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.subtext }]}>
                              {job.posted ? formatPostedTime(job.posted) : job.postedTime || 'Recently'}
                            </Text>
                          </View>
                          {job.budgetType && (
                            <Badge
                              label={job.budgetType === 'fixed' ? 'Fixed' : 'Hourly'}
                              variant="neutral"
                              size="small"
                            />
                          )}
                        </View>

                        {job.skills && job.skills.length > 0 && (
                          <View style={styles.skillsRow}>
                            {job.skills.slice(0, 5).map((skill, idx) => (
                              <Badge key={idx} label={skill} variant="info" size="small" />
                            ))}
                          </View>
                        )}

                        <View style={styles.gigActions}>
                          <Button
                            title="View Details"
                            onPress={() => navigation.navigate('JobDetail', { id: job._id })}
                            variant="outline"
                            size="small"
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Apply Now"
                            onPress={() => navigation.navigate('JobDetail', { id: job._id })}
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
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <MaterialIcons name="work-outline" size={48} color={c.subtext} />
                  <Text style={{ color: c.subtext, marginTop: 12, textAlign: 'center' }}>
                    No jobs found matching your criteria
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gigCard: {
    gap: 12,
  },
  gigHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  company: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  gigMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  gigActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default FreelancerMatchedGigsScreen;
