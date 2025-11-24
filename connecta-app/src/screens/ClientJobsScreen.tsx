import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface ClientJob {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Closed';
  proposals: number;
  budget: string;
  postedDate: string;
}

const SEED: ClientJob[] = [
  {
    id: 'c1',
    title: 'UX/UI Designer for Mobile App',
    status: 'Open',
    proposals: 15,
    budget: '$3,500',
    postedDate: '2 days ago',
  },
  {
    id: 'c2',
    title: 'Senior Frontend Developer',
    status: 'In Progress',
    proposals: 22,
    budget: '$5,000',
    postedDate: '1 week ago',
  },
  {
    id: 'c3',
    title: 'Backend API Integration',
    status: 'Closed',
    proposals: 8,
    budget: '$2,800',
    postedDate: '2 weeks ago',
  },
];

const ClientJobsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [tab, setTab] = useState<'All' | 'Open' | 'Closed'>('All');
  const jobs = SEED;

  const filtered = useMemo(() => {
    if (tab === 'All') return jobs;
    if (tab === 'Open') return jobs.filter((j) => j.status === 'Open' || j.status === 'In Progress');
    return jobs.filter((j) => j.status === 'Closed');
  }, [jobs, tab]);

  const getStatusVariant = (status: ClientJob['status']): 'success' | 'info' | 'neutral' => {
    if (status === 'Open') return 'success';
    if (status === 'In Progress') return 'info';
    return 'neutral';
  };

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

        <ScrollView contentContainerStyle={{ paddingBottom: 84 }} showsVerticalScrollIndicator={false}>
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
                {filtered.map((j) => (
                  <Card key={j.id} variant="elevated" padding={16}>
                    <View style={styles.jobCard}>
                      <View style={styles.jobHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.jobTitle, { color: c.text }]}>{j.title}</Text>
                          <Badge label={j.status} variant={getStatusVariant(j.status)} size="small" style={{ marginTop: 8 }} />
                        </View>
                        <TouchableOpacity>
                          <MaterialIcons name="more-vert" size={24} color={c.subtext} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.jobMeta}>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="description" size={16} color={c.subtext} />
                          <Text style={[styles.metaText, { color: c.text }]}>{j.proposals} Proposals</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                          <Text style={[styles.metaText, { color: c.text }]}>{j.budget}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="schedule" size={16} color={c.subtext} />
                          <Text style={[styles.metaText, { color: c.subtext }]}>{j.postedDate}</Text>
                        </View>
                      </View>

                      <View style={styles.jobActions}>
                        <Button
                          title="View Proposals"
                          onPress={() => navigation.navigate('JobDetail')}
                          variant="outline"
                          size="small"
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Edit Job"
                          onPress={() => navigation.navigate('PostJob')}
                          variant="primary"
                          size="small"
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  </Card>
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
