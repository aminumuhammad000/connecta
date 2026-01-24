import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import * as jobService from '../services/jobService';
import * as collaboService from '../services/collaboService';
import { Job } from '../types';

interface ClientJob {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Closed';
  proposals: number;
  budget: string;
  postedDate: string;
}

const ClientJobsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'All' | 'Open' | 'In Progress' | 'Closed'>('All');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const [jobsData, collaboData] = await Promise.all([
        jobService.getMyJobs(),
        collaboService.getMyCollaboProjects().catch(() => [])
      ]);

      // Normalize Collabo projects to match Job interface roughly
      const normalizedCollabo = collaboData.map((p: any) => ({
        _id: p._id,
        title: p.title,
        status: p.status === 'planning' ? 'open' : p.status, // Map status
        proposalsCount: p.roles?.reduce((acc: number, r: any) => acc + (r.candidates?.length || 0), 0) || 0,
        budget: p.totalBudget,
        postedAt: p.createdAt,
        isCollabo: true,
        description: p.description,
        teamName: p.teamName
      }));

      setJobs([...jobsData, ...normalizedCollabo].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()));
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

  const mapJobStatus = (status: string): string => {
    if (status === 'open') return 'Open';
    if (status === 'active') return 'Open';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'open' || status === 'active') return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' };
    if (status === 'in_progress') return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' };
    if (status === 'completed') return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280' };
    return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280' };
  };

  const filtered = useMemo(() => {
    if (tab === 'All') return jobs;
    if (tab === 'Open') return jobs.filter((j) => j && (j.status === 'active' || j.status === 'open'));
    if (tab === 'In Progress') return jobs.filter((j) => j && j.status === 'in_progress');
    return jobs.filter((j) => j && (j.status === 'closed' || j.status === 'draft' || j.status === 'completed'));
  }, [jobs, tab]);

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
          <TouchableOpacity
            onPress={() => navigation.navigate('PostJob')}
            style={[styles.iconBtn, { backgroundColor: c.primary + '15' }]}
          >
            <MaterialIcons name="add" size={24} color={c.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 84 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {/* Search & Filter */}
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <View style={[styles.searchWrap, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginBottom: 12 }]}>
              <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
              <TextInput
                placeholder="Search jobs..."
                placeholderTextColor={c.subtext}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['All', 'Open', 'In Progress', 'Closed'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t as any)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: tab === t ? c.primary + '15' : c.card,
                      borderColor: tab === t ? c.primary : c.border,
                      borderWidth: 1
                    }
                  ]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: tab === t ? c.primary : c.subtext }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Jobs List */}
          <View style={{ paddingHorizontal: 16, gap: 16 }}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="work-outline" size={64} color={c.subtext} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No jobs found</Text>
                <Text style={[styles.emptyText, { color: c.subtext }]}>
                  {tab === 'All' ? 'Post your first job to get started' : `No ${tab.toLowerCase()} jobs`}
                </Text>
              </View>
            ) : (
              filtered.map((j: any) => {
                if (!j) return null;
                const isCollabo = j.isCollabo;

                return (
                  <TouchableOpacity
                    key={j._id}
                    activeOpacity={0.9}
                    onPress={() => isCollabo ? navigation.navigate('CollaboWorkspace', { projectId: j._id }) : navigation.navigate('JobDetail', { id: j._id })}
                    style={[styles.jobCard, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}
                  >
                    <View style={styles.jobHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {isCollabo && (
                            <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#8B5CF6', fontSize: 10, fontWeight: '700' }}>COLLABO</Text>
                            </View>
                          )}
                          <Text style={[styles.jobTitle, { color: c.text }]} numberOfLines={2}>{j?.title || 'Untitled Job'}</Text>
                        </View>
                        <Text style={{ fontSize: 13, color: c.subtext, marginTop: 4 }}>
                          Posted {formatDate(j.postedAt || j.createdAt)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(j.status).bg }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(j.status).text }]}>
                          {mapJobStatus(j.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: c.border }]} />

                    <View style={styles.jobMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name={isCollabo ? "groups" : "description"} size={18} color={c.primary} />
                        <View>
                          <Text style={[styles.metaValue, { color: c.text }]}>{j.proposalsCount || 0}</Text>
                          <Text style={[styles.metaLabel, { color: c.subtext }]}>{isCollabo ? 'Candidates' : 'Proposals'}</Text>
                        </View>
                      </View>

                      <View style={[styles.verticalDivider, { backgroundColor: c.border }]} />

                      <View style={styles.metaItem}>
                        <MaterialIcons name="account-balance-wallet" size={18} color="#10B981" />
                        <View>
                          <Text style={[styles.metaValue, { color: c.text }]}>₦{j.budget?.toLocaleString() || '0'}</Text>
                          <Text style={[styles.metaLabel, { color: c.subtext }]}>{j.budgetType || 'Fixed'}</Text>
                        </View>
                      </View>

                      <View style={[styles.verticalDivider, { backgroundColor: c.border }]} />

                      <View style={styles.metaItem}>
                        <MaterialIcons name="visibility" size={18} color="#F59E0B" />
                        <View>
                          <Text style={[styles.metaValue, { color: c.text }]}>{j.views || 0}</Text>
                          <Text style={[styles.metaLabel, { color: c.subtext }]}>Views</Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: c.border }]} />

                    <View style={styles.jobActions}>
                      {!isCollabo && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: c.border }]}
                          onPress={() => navigation.navigate('ClientRecommended', { jobId: j._id })}
                        >
                          <MaterialIcons name="person-add-alt" size={18} color={c.text} />
                          <Text style={[styles.actionText, { color: c.text }]}>Invite</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: c.border }]}
                        onPress={() => isCollabo ? navigation.navigate('PostCollaboJob', { projectId: j._id, mode: 'edit' }) : navigation.navigate('PostJob', { jobId: j._id, mode: 'edit' })}
                      >
                        <MaterialIcons name="edit" size={18} color={c.text} />
                        <Text style={[styles.actionText, { color: c.text }]}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtnPrimary, { backgroundColor: c.primary }]}
                        onPress={() => isCollabo ? navigation.navigate('CollaboWorkspace', { projectId: j._id }) : navigation.navigate('JobDetail', { id: j._id })}
                      >
                        <Text style={[styles.actionTextPrimary]}>{isCollabo ? 'Workspace' : 'View Details'}</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
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
  searchWrap: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 4,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 8,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnPrimary: {
    flex: 1.5,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ClientJobsScreen;
