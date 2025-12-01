import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import * as jobService from '../services/jobService';
import { Job } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const ClientJobsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'All' | 'Open' | 'Closed'>('All');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [])
  );

  const loadJobs = async () => {
    try {
      const data = await jobService.getMyJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadJobs();
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60 / 60 / 24);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  const mapJobStatus = (status: string): 'Open' | 'In Progress' | 'Closed' => {
    if (status === 'active') return 'Open';
    // 'draft' is not really 'In Progress' but we can map it or hide it. 
    // For now, let's map 'draft' to 'In Progress' or just show 'Open' for active.
    if (status === 'draft') return 'In Progress';
    return 'Closed';
  };

  const filtered = useMemo(() => {
    if (tab === 'All') return jobs;
    if (tab === 'Open') return jobs.filter((j) => j.status === 'active' || j.status === 'draft');
    return jobs.filter((j) => j.status === 'closed');
  }, [jobs, tab]);

  const getStatusVariant = (status: string): 'success' | 'info' | 'neutral' => {
    if (status === 'active') return 'success';
    if (status === 'draft') return 'info';
    return 'neutral';
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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>My Jobs</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="search" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 84 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {/* Post Job Button */}
          <View style={styles.section}>
            <Button
              title="Post a New Job"
              onPress={() => navigation.navigate('PostJob')}
              size="large"
              style={{ marginBottom: 16 }}
            />
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { borderBottomColor: c.border }]}>
            <TouchableOpacity
              onPress={() => setTab('All')}
              style={[styles.tab, { borderBottomColor: tab === 'All' ? c.primary : 'transparent' }]}
            >
              <Text style={[styles.tabText, { color: tab === 'All' ? c.primary : c.subtext }]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab('Open')}
              style={[styles.tab, { borderBottomColor: tab === 'Open' ? c.primary : 'transparent' }]}
            >
              <Text style={[styles.tabText, { color: tab === 'Open' ? c.primary : c.subtext }]}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab('Closed')}
              style={[styles.tab, { borderBottomColor: tab === 'Closed' ? c.primary : 'transparent' }]}
            >
              <Text style={[styles.tabText, { color: tab === 'Closed' ? c.primary : c.subtext }]}>Closed</Text>
            </TouchableOpacity>
          </View>

          {/* Jobs List */}
          <View style={styles.section}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="work-outline" size={64} color={c.subtext} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No jobs found</Text>
                <Text style={[styles.emptyText, { color: c.subtext }]}>
                  {tab === 'All' ? 'Post your first job to get started' : `No ${tab.toLowerCase()} jobs`}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {filtered.map((j: any) => (
                  <TouchableOpacity
                    key={j._id}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('JobDetail', { id: j._id })}
                  >
                    <Card variant="elevated" padding={16}>
                      <View style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.jobTitle, { color: c.text }]}>{j.title}</Text>
                            <Badge label={mapJobStatus(j.status)} variant={getStatusVariant(j.status)} size="small" style={{ marginTop: 8 }} />
                          </View>
                          <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            // TODO: Show edit/delete menu
                          }}>
                            <MaterialIcons name="more-vert" size={24} color={c.subtext} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.jobMeta}>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="description" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.text }]}>{j.proposalsCount || 0} Proposals</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.text }]}>₦{j.budget?.toLocaleString() || '0'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="schedule" size={16} color={c.subtext} />
                            <Text style={[styles.metaText, { color: c.subtext }]}>{formatDate(j.postedAt)}</Text>
                          </View>
                        </View>

                        <View style={styles.jobActions}>
                          <Button
                            title="View Proposals"
                            onPress={() => navigation.navigate('Proposals', { jobId: j._id })}
                            variant="outline"
                            size="small"
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Edit Job"
                            onPress={() => navigation.navigate('PostJob', { jobId: j._id, mode: 'edit' })}
                            variant="primary"
                            size="small"
                            style={{ flex: 1 }}
                          />
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  jobCard: {
    gap: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default ClientJobsScreen;
