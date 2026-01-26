import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Animated, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import jobService from '../services/jobService';
import { Job } from '../types';

const FreelancerMatchedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'internal' | 'external' | 'fixed' | 'hourly' | 'remote' | 'entry' | 'intermediate' | 'expert'>('all');
  const [savedGigs, setSavedGigs] = useState<Set<string>>(new Set());
  const [likedGigs, setLikedGigs] = useState<Set<string>>(new Set());
  const [dismissedGigs, setDismissedGigs] = useState<Set<string>>(new Set());

  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

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
      // Initialize anim values
      jobsData.forEach(job => {
        if (job._id) {
          scaleAnims[job._id] = new Animated.Value(1);
          fadeAnims[job._id] = new Animated.Value(1);
        }
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotInterested = (gigId: string) => {
    if (!fadeAnims[gigId]) fadeAnims[gigId] = new Animated.Value(1);

    Animated.timing(fadeAnims[gigId], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setDismissedGigs(prev => {
        const newSet = new Set(prev);
        newSet.add(gigId);
        return newSet;
      });
    });
  };

  const handleInterested = (gigId: string) => {
    const job = jobs.find(j => j._id === gigId);
    if (job?.isExternal && job?.applyUrl) {
      Linking.openURL(job.applyUrl);
    } else {
      navigation.navigate('JobDetail', { id: gigId });
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' => {
    if (status === 'Featured') return 'success';
    if (status === 'Hot') return 'warning';
    return 'primary';
  };

  const toggleSaveGig = async (gigId: string) => {
    try {
      if (savedGigs.has(gigId)) {
        await jobService.unsaveJob(gigId);
        setSavedGigs(prev => {
          const newSet = new Set(prev);
          newSet.delete(gigId);
          return newSet;
        });
      } else {
        await jobService.saveJob(gigId);
        setSavedGigs(prev => {
          const newSet = new Set(prev);
          newSet.add(gigId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const toggleLikeGig = (gigId: string) => {
    // Animate
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
    // Hide dismissed
    if (dismissedGigs.has(job._id)) return false;

    // Filter by type
    if (selectedFilter === 'internal' && job.isExternal) return false;
    if (selectedFilter === 'external' && !job.isExternal) return false;
    if (selectedFilter === 'fixed' && job.budgetType !== 'fixed') return false;
    if (selectedFilter === 'hourly' && job.budgetType !== 'hourly') return false;
    if (selectedFilter === 'remote' && job.locationType !== 'remote') return false;
    if (selectedFilter === 'entry' && job.experienceLevel !== 'Entry') return false;
    if (selectedFilter === 'intermediate' && job.experienceLevel !== 'Intermediate') return false;
    if (selectedFilter === 'expert' && job.experienceLevel !== 'Expert') return false;

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

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: isDesktop ? '100%' : 600, alignSelf: 'center', width: '100%' }}>
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
          {/* Search & Filters */}
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

            {/* Primary Source Filter (Segmented Control) */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 4,
              marginTop: 16,
              borderWidth: 1,
              borderColor: c.border
            }}>
              {(['all', 'internal', 'external'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: selectedFilter === filter ? c.primary : 'transparent',
                  }}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: selectedFilter === filter ? '#FFF' : c.subtext,
                    textTransform: 'capitalize'
                  }}>
                    {filter} Jobs
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Secondary Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
              {['fixed', 'hourly', 'remote', 'entry', 'intermediate', 'expert'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter
                      ? { backgroundColor: c.primary, borderWidth: 0 }
                      : { backgroundColor: c.card, borderColor: c.border }
                  ]}
                  onPress={() => setSelectedFilter(filter as any)}
                >
                  <Text style={selectedFilter === filter ? styles.filterChipTextActive : [styles.filterChipText, { color: c.text }]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Jobs List */}
          <View style={styles.section}>
            <Text style={[styles.resultsText, { color: c.subtext, marginBottom: 12 }]}>{filteredJobs.length} jobs found</Text>

            <View style={[isDesktop && styles.desktopGrid, { gap: 12 }]}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => {
                  if (!job) return null;
                  const isInternal = !job.isExternal;
                  const identityColor = isInternal ? '#10B981' : '#3B82F6'; // Green for Internal, Blue for External

                  return (
                    <Animated.View
                      key={job._id}
                      style={[{ opacity: fadeAnims[job._id] || 1, transform: [{ scale: fadeAnims[job._id] || 1 }] }, isDesktop && styles.desktopCard]}
                    >
                      <TouchableOpacity
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
                            <View style={{ flex: 1, gap: 4 }}>
                              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, lineHeight: 22 }}>
                                {job.title}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '500' }}>
                                  {job.company || 'Confidential'} • {job.posted ? formatPostedTime(job.posted) : 'Recently'}
                                </Text>
                                {isInternal && (
                                  <MaterialIcons name="verified" size={16} color="#FF7F50" />
                                )}
                              </View>
                            </View>
                            <TouchableOpacity onPress={() => toggleSaveGig(job._id)}>
                              <MaterialIcons
                                name={savedGigs.has(job._id) ? "bookmark" : "bookmark-border"}
                                size={26}
                                color={savedGigs.has(job._id) ? c.primary : c.subtext}
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Badges Row */}
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {job.budgetType && (
                              <Badge label={job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'} variant="neutral" size="small" />
                            )}
                            {job.locationType !== 'remote' && (
                              <Badge label={job.location || 'On-site'} variant="neutral" size="small" />
                            )}
                            <Badge label={job.budget || 'Negotiable'} variant="custom" customColor={job.isExternal ? '#3B82F6' : '#FF7F50'} size="small" />
                          </View>

                          {/* Description Preview */}
                          <Text style={{ fontSize: 14, color: c.subtext, lineHeight: 22 }} numberOfLines={2}>
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
                              {job.skills && job.skills.slice(0, 2).map((skill, idx) => (
                                <Text key={idx} style={{ fontSize: 12, color: c.subtext, backgroundColor: c.background, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: 'hidden', fontWeight: '500' }}>
                                  {skill}
                                </Text>
                              ))}
                              {job.skills && job.skills.length > 2 && (
                                <Text style={{ fontSize: 12, color: c.subtext, paddingVertical: 6, fontWeight: '500' }}>+{job.skills.length - 2}</Text>
                              )}
                            </View>

                            <TouchableOpacity
                              onPress={() => handleInterested(job._id)}
                              style={{
                                backgroundColor: job.isExternal ? '#3B82F6' : '#FF7F50',
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
                    </Animated.View>
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
      </View >
    </SafeAreaView >
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
    marginTop: 8
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0
  },
  cardFooter: {
    borderTopWidth: 1,
    marginTop: 8,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  desktopCard: {
    width: '48%',
  }
});

export default FreelancerMatchedGigsScreen;
