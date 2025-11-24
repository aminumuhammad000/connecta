import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

interface FreelancerRec {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  skills: string[];
}

const FREELANCERS: FreelancerRec[] = [
  {
    id: 'f1',
    name: 'Jenny Wilson',
    role: 'UX/UI Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEjA1qkTeGlFqHIJJxs96X8h7SWh3pp4bJJze9IaLG4bgFtH9cYiYYLxc0afI6nhNNop2i5SQHGPzAU4_ieX1ifB_e8FqV07caEx8PbLyRk0cHS40qYV4pfwXn4LD-vakHid3us0-5UBeGpuBqZmg59j9g1w1_pdtkEX2bK0HXc6zq9J8DXn5sNqbeVlcWbIzhGzmV_dupJuae8ajdKUAhQGKkQUiYaAlJcGUzurUc1gQJoef6_ngZB5caZqdX2UJgTQeuf36FJVo',
    rating: 4.9,
    reviews: 124,
    hourlyRate: '$85/hr',
    skills: ['Figma', 'UI Design', 'Prototyping'],
  },
  {
    id: 'f2',
    name: 'Robert Fox',
    role: 'Webflow Developer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBku_SBx_jdljBMvRoNSlxAzHNgYe99IoIDbg0INB9dxG-qJGw0tTm-KPPZJlh7Tfphorgu06whI0cCoq8ce0NiWTkibZc0aBbVUElMbcmwVdjWgRILxZH8CFe2Uq5NX3L72sYb6JqbirS0oqrMcPA__RsAkNB5QwDIX9zP8FJH5A00q9GFyqfUcZDAIQURju2Ozi6UZDHAPv01VWNXnGBh7srCZjxd1D5JshH8wMxWdjYWDFIQQDf7KuyQHCDrUyWlxCdbbPbTIXI',
    rating: 5.0,
    reviews: 88,
    hourlyRate: '$95/hr',
    skills: ['Webflow', 'No-Code', 'Responsive'],
  },
  {
    id: 'f3',
    name: 'Kristin Watson',
    role: 'SEO Specialist',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqJb1ZVN5TOym2QLLAlJyKR-mD8e7K8lFJWk_ZU9s4NkneWDBv4u_xI6-8a4hf3RSgxzAtP73XPbfKpIAjTIL87fUqJLNQkiMZYdJ0QrPUwBpiucHjo8rswE2IJwM-NAb1WdUQnANOgc5ufOVDelQqW6BRR1e8vUQ6PDIl37pQrnG9EyTVXEgPm19zQrIRD-wnanutFxDYFtxSteNIClSrMVIOJcureFllPmTa4k36YWbciBF--3JwPjJ_b839en9a7WyCF6i4BT4',
    rating: 4.8,
    reviews: 210,
    hourlyRate: '$75/hr',
    skills: ['SEO', 'Analytics', 'Content'],
  },
];

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKz_jM9IRQFZZag2PHtqGxtKYySTvATiq59ZeSw3q0IjvryLIjfeFr8Z5z_OHxi7agn1E0SBPBWf6JF59iMb49ekD1Ggst6xJEudlcFW6shMFmbXbO-CeOaTu8dNd_0SzjyhB5Gp-360xTzb5j3E3-8V6jQYLRhaZuu96bp-FkIKRESqEkPfQUPmzg1okhvSqw2jjcYMYuCkeGn8NGOYifjRo7Fmb_MkN-vDEoX-gfZSV2VobQ_zOJKew0eG8Z-_l6DKTis8EEgRE';

const ClientDashboardScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

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
                <Avatar uri={AVATAR} size={48} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                >
                  <MaterialIcons name="notifications" size={22} color="#fff" />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
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
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>David!</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.primary + '22' }]}>
                <MaterialIcons name="work" size={24} color={c.primary} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>5</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Active Projects</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B22' }]}>
                <MaterialIcons name="payment" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>Payments Due</Text>
            </Card>

            <Card variant="elevated" padding={16} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98122' }]}>
                <MaterialIcons name="chat" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: c.subtext }]}>New Messages</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Button
              title="Post a New Job"
              onPress={() => navigation.navigate('PostJob')}
              size="large"
              style={{ marginBottom: 12 }}
            />
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Jobs')}
              >
                <MaterialIcons name="work-outline" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>My Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('Projects')}
              >
                <MaterialIcons name="folder-open" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => navigation.navigate('ClientPayments')}
              >
                <MaterialIcons name="account-balance-wallet" size={24} color={c.primary} />
                <Text style={[styles.quickActionText, { color: c.text }]}>Payments</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recommended Freelancers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended for You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClientRecommended')}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {FREELANCERS.map((f) => (
                <Card key={f.id} variant="elevated" padding={16}>
                  <View style={styles.freelancerCard}>
                    <View style={styles.freelancerHeader}>
                      <Avatar uri={f.avatar} name={f.name} size={56} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.freelancerName, { color: c.text }]}>{f.name}</Text>
                        <Text style={[styles.freelancerRole, { color: c.subtext }]}>{f.role}</Text>
                        <View style={styles.ratingRow}>
                          <MaterialIcons name="star" size={16} color="#F59E0B" />
                          <Text style={[styles.rating, { color: c.text }]}>
                            {f.rating.toFixed(1)}
                          </Text>
                          <Text style={[styles.reviews, { color: c.subtext }]}>
                            ({f.reviews} reviews)
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.hourlyRate, { color: c.primary }]}>{f.hourlyRate}</Text>
                    </View>

                    <View style={styles.skillsRow}>
                      {f.skills.map((skill, idx) => (
                        <Badge key={idx} label={skill} variant="neutral" size="small" />
                      ))}
                    </View>

                    <View style={styles.freelancerActions}>
                      <Button
                        title="View Profile"
                        onPress={() => navigation.navigate('ClientRecommended')}
                        variant="outline"
                        size="small"
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Hire Now"
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
  freelancerCard: {
    gap: 12,
  },
  freelancerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  freelancerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  freelancerRole: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviews: {
    fontSize: 13,
  },
  hourlyRate: {
    fontSize: 15,
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freelancerActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default ClientDashboardScreen;
