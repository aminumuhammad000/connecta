import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

interface JobRec {
  id: string;
  title: string;
  company: string;
  budget: string;
  status: 'New' | 'Hot' | 'Featured';
  type: 'Fixed' | 'Hourly';
  skills: string[];
  postedAgo: string;
}

const JOBS: JobRec[] = [
  {
    id: 'j1',
    title: 'Mobile App UI/UX Design',
    company: 'Innovate Inc.',
    budget: '$3,500',
    status: 'Featured',
    type: 'Fixed',
    skills: ['Figma', 'Mobile Design', 'Prototyping'],
    postedAgo: '2 hours ago',
  },
  {
    id: 'j2',
    title: 'Brand Identity Package',
    company: 'Fintech Hub',
    budget: '$1,800',
    status: 'Hot',
    type: 'Fixed',
    skills: ['Branding', 'Logo Design', 'Style Guide'],
    postedAgo: '5 hours ago',
  },
  {
    id: 'j3',
    title: 'Marketing Website Redesign',
    company: 'Growth Labs',
    budget: '$4,200',
    status: 'New',
    type: 'Fixed',
    skills: ['Web Design', 'Responsive', 'Webflow'],
    postedAgo: '1 day ago',
  },
];

const FreelancerDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' => {
    if (status === 'Featured') return 'success';
    if (status === 'Hot') return 'warning';
    return 'primary';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 72 }} showsVerticalScrollIndicator={false}>
          {/* Header with Gradient */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: c.isDark ? '#1F2937' : c.primary,
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Avatar name="Sarah Johnson" size={48} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                >
                  <MaterialIcons name="notifications" size={22} color="#fff" />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>2</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ConnectaAI')}
                  style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                >
                  <MaterialIcons name="smart-toy" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Sarah!</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.primary + '22' }]}>
                <MaterialIcons name="description" size={24} color={c.primary} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>4</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Active Proposals</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B22' }]}>
                <MaterialIcons name="mail" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>2</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>New Invites</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98122' }]}>
                <MaterialIcons name="attach-money" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>$8.5k</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>This Month</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Button
              title="Browse All Jobs"
              onPress={() => navigation.navigate('Gigs')}
              size="large"
              style={{ marginBottom: 12 }}
            />
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Proposals')}
              >
                <MaterialIcons name="description" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>My Proposals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('FreelancerSavedGigs')}
              >
                <MaterialIcons name="bookmark" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>Saved Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <MaterialIcons name="person" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>My Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recommended Jobs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended Jobs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Gigs')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {JOBS.map((job) => (
                <Card key={job.id} variant="elevated" padding={16}>
                  <View style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.jobTitleRow}>
                          <Text style={[styles.jobTitle, { color: c.text }]} numberOfLines={1}>
                            {job.title}
                          </Text>
                          <Badge label={job.status} variant={getStatusVariant(job.status)} size="small" />
                        </View>
                        <Text style={[styles.company, { color: c.subtext }]}>{job.company}</Text>
                      </View>
                    </View>

                    <View style={styles.jobMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                        <Text style={[styles.metaText, { color: c.text }]}>{job.budget}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={16} color={c.subtext} />
                        <Text style={[styles.metaText, { color: c.subtext }]}>{job.postedAgo}</Text>
                      </View>
                      <Badge label={job.type} variant="neutral" size="small" />
                    </View>

                    <View style={styles.skillsRow}>
                      {job.skills.map((skill, idx) => (
                        <Badge key={idx} label={skill} variant="info" size="small" />
                      ))}
                    </View>

                    <View style={styles.jobActions}>
                      <Button
                        title="View Details"
                        onPress={() => navigation.navigate('JobDetail')}
                        variant="outline"
                        size="small"
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Apply Now"
                        onPress={() => navigation.navigate('JobDetail')}
                        variant="primary"
                        size="small"
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
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
    marginTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  jobCard: {
    gap: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  company: {
    fontSize: 14,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default FreelancerDashboardScreen;
