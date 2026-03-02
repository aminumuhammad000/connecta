import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Header from '../components/Header';
import ActiveJobCard from '../components/ActiveJobCard';
import RecommendedCard from '../components/RecommendedCard';
import JobsScreen from './JobsScreen';
import ProposalsScreen from './ProposalsScreen';
import MessagesScreen from './MessagesScreen';
import WalletScreen from './WalletScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';

interface ActiveJob {
  id: string;
  title: string;
  dueIn: string; // human string like '5 days'
  price: string;
  progress: number; // 0..1
}

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  logoUri: string;
  saved: boolean;
}

const DashboardScreen: React.FC = () => {
  const c = useThemeColors();
  const [activeTab, setActiveTab] = useState('home');
  const [recs, setRecs] = useState<Recommendation[]>([{
    id: 'r1',
    title: 'Brand Identity Designer',
    subtitle: 'Innovate Inc. • Remote',
    logoUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTdKTy-YWYZrDagXzzqC0bHn-DcuDZdcz-liVbvCwLJsyl_r0pE0BNGFDS6Vvs2EiEY2TaF_UGFqqRBRSrls8bZjn_lpHwhmn5225ZARwU7AEnaPpINdtQ4qopgitr0vcGh58tVp6X7_8iXNEIzzRmAXiBq8NA6JmgWigR2tZ2fziROsKrMChJqJLaGTv-T1Wn_TZbo5gkwYcoILNhwVHP-lF_RS2M9mAkWRbSpehWeZWVdcirznQ0NPrNeF4J-4gkUN8nj_KOkKA',
    saved: false,
  }, {
    id: 'r2',
    title: 'Product Designer',
    subtitle: 'Creative Solutions • Full-time',
    logoUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPrYL78sIaoPBTwqOW1PaK2UjohXhszcbrCDMx4w_z4kwr2dGlrOzXYv1il1jfTM8-HL3RYdP7kiZbFSXi0Ibp-YzHoujIwQUesrfuU9ryoXH94WQN7jz0dOE9Ye2CyQb6WnkkvmkRHxeiOMgE4Zrtzi8GP2Uknp-rNTOiAVx2K76JvYNvpHEDD7OULBpZCsTcUKBB0Ak9AjyhrVaYZR2dyPGGpK0fxSx6Y1tFWiy4hXCIykIdjHcCH5cfXH7YRNKgUxnUfEUj4I',
    saved: true,
  }]);

  const jobs: ActiveJob[] = useMemo(() => ([
    { id: 'j1', title: 'UI/UX Design for a Mobile App', dueIn: '5 days', price: '₦2,500', progress: 0.75 },
    { id: 'j2', title: 'Website Redesign Project', dueIn: '12 days', price: '₦4,000', progress: 0.4 },
  ]), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {activeTab === 'home' && (
          <>
            <Header name="Aminu Muhammad" onNotificationsPress={() => setActiveTab('notifications')} />
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 72 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.h2, { color: c.text }]}>Active Jobs ({jobs.length})</Text>
                <Text style={[styles.link, { color: c.primary }]}>View all</Text>
              </View>

              <View style={{ gap: 12, marginBottom: 24 }}>
                {jobs.map(j => (
                  <ActiveJobCard key={j.id} title={j.title} due={j.dueIn} price={j.price} progress={j.progress} />
                ))}
              </View>

              <Text style={[styles.h2, { color: c.text, marginBottom: 12 }]}>Recommended for you</Text>
              <View style={{ gap: 12 }}>
                {recs.map(r => (
                  <RecommendedCard
                    key={r.id}
                    title={r.title}
                    subtitle={r.subtitle}
                    logoUri={r.logoUri}
                    saved={r.saved}
                    onToggleSave={() => setRecs(prev => prev.map(x => x.id === r.id ? { ...x, saved: !x.saved } : x))}
                  />
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {activeTab === 'jobs' && <JobsScreen onOpenNotifications={() => setActiveTab('notifications')} />}

        {activeTab === 'messages' && <MessagesScreen />}

        {activeTab === 'proposals' && <ProposalsScreen onOpenNotifications={() => setActiveTab('notifications')} />}

        {activeTab === 'wallet' && <WalletScreen onOpenNotifications={() => setActiveTab('notifications')} />}

        {activeTab === 'notifications' && <NotificationsScreen onNavigateTab={(key: string) => setActiveTab(key as any)} />}

        {activeTab === 'profile' && <ProfileScreen />}

        {activeTab !== 'home' && activeTab !== 'jobs' && activeTab !== 'messages' && activeTab !== 'proposals' && activeTab !== 'wallet' && activeTab !== 'notifications' && activeTab !== 'profile' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: c.subtext }}>Coming soon</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h2: {
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DashboardScreen;
