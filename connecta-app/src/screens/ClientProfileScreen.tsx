import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRoQQ-xxcLo9YcmbA5AWwLA-FKTuhoFyvCtoj3YzgnBUHc3Bck-0K5CDGhw26GGSiL4TVmx-echTOzkIszt19LuAJSmxtNX4gLR84lGhbyBU_ylBR9UPjYUsGq-sCWYMZU8YMxAwFk3vUMj8iG1B-JkvTnZ33PaK6gy8KAqR6GAF4C1IoRLxDv3FB7Jl0FhWIXIXurfNORMKY7rKh4LRJjYzPXNlfWTAvV548j73C9tUL04WQzqGCFCWqIVMqtsa2VztnMJKvY5rM';

export default function ClientProfileScreen({ navigation }: any) {
  const c = useThemeColors();
  const [activeTab, setActiveTab] = useState<'history' | 'reviews'>('history');
  const [following, setFollowing] = useState(false);

  const onBack = () => navigation.goBack?.();
  const onMore = () => {};

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}> 
      {/* Top App Bar */}
      <View style={[styles.appBar, { borderBottomColor: c.border }]}> 
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Client Profile</Text>
        <TouchableOpacity onPress={onMore} accessibilityRole="button" accessibilityLabel="More options" style={styles.iconBtn}>
          <MaterialIcons name="more-vert" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Header */}
        <View style={styles.sectionPad}>
          <View style={styles.headerRow}> 
            <View style={styles.headerLeft}> 
              <Image source={{ uri: AVATAR }} style={styles.avatar} accessibilityLabel="Profile picture of Alexandria Smith" />
              <View>
                <Text style={[styles.name, { color: c.text }]}>Alexandria Smith</Text>
                <Text style={[styles.location, { color: c.subtext }]}>London, UK</Text>
                <View style={styles.verifiedRow}>
                  <MaterialIcons name="verified" size={16} color="#22c55e" />
                  <Text style={styles.verifiedText}>Payment Method Verified</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ pressed: following }}
                onPress={() => setFollowing(v => !v)}
                style={[styles.followBtn, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Text style={[styles.btnText, { color: c.text }]}>{following ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {}}
                style={[styles.messageBtn, { backgroundColor: c.primary }]}
              >
                <Text style={[styles.btnText, { color: 'white' }]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.sectionPad, styles.rowWrap, { gap: 12 }]}> 
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}> 
            <Text style={[styles.statLabel, { color: c.subtext }]}>Total Spend</Text>
            <Text style={[styles.statValue, { color: c.text }]}>$25K+</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}> 
            <Text style={[styles.statLabel, { color: c.subtext }]}>Jobs Posted</Text>
            <Text style={[styles.statValue, { color: c.text }]}>42</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}> 
            <Text style={[styles.statLabel, { color: c.subtext }]}>Avg. Rate Paid</Text>
            <Text style={[styles.statValue, { color: c.text }]}>$65/hr</Text>
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
        <Text style={[styles.about, { color: c.subtext }]}>We are a design-first company focused on creating beautiful and intuitive user experiences. We're looking for talented freelancers to partner with on exciting new projects.</Text>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: c.border }]}> 
          <View style={styles.tabList} accessibilityRole="tablist">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'history' }}
              onPress={() => setActiveTab('history')}
              style={[styles.tabItem, activeTab === 'history' && { borderBottomColor: c.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'history' ? c.primary : c.subtext }]}>Job History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'reviews' }}
              onPress={() => setActiveTab('reviews')}
              style={[styles.tabItem, activeTab === 'reviews' && { borderBottomColor: c.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'reviews' ? c.primary : c.subtext }]}>Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.sectionPad}> 
          {activeTab === 'history' ? (
            <>
              <JobCard
                title="UX/UI Designer for Mobile App"
                budget="$3,500"
                status="Completed"
                description="Looking for a skilled designer to create a modern and intuitive interface for our new productivity app..."
              />
              <JobCard
                title="Brand Identity & Logo Design"
                budget="$1,200"
                status="Completed"
                description="We need a full brand identity package for a new fintech startup, including a logo, color palette, and typography..."
              />
            </>
          ) : (
            <>
              <ReviewCard
                author="John D."
                rating={5}
                comment="Great experience working with Alexandria. Clear requirements and prompt payments."
              />
              <ReviewCard
                author="Emily R."
                rating={4}
                comment="Professional client. Quick feedback cycles. Would work again."
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeKey="jobs"
        onChange={(key) => {
          if (key === 'home') navigation.navigate('Dashboard');
          if (key === 'jobs') navigation.navigate('Dashboard');
        }}
      />
    </View>
  );
}

function JobCard({ title, budget, status, description }: { title: string; budget: string; status: string; description: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
      <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: c.subtext }]}>Budget: {budget}</Text>
        <Text style={[styles.dot, { color: c.subtext }]}>·</Text>
        <Text style={[styles.status, { color: '#22c55e' }]}>{status}</Text>
      </View>
      <Text style={[styles.cardDesc, { color: c.subtext }]}>{description}</Text>
    </View>
  );
}

function ReviewCard({ author, rating, comment }: { author: string; rating: number; comment: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
      <View style={[styles.metaRow, { marginBottom: 4 }]}> 
        <Text style={[styles.cardTitle, { color: c.text, fontSize: 14 }]}>{author}</Text>
        <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <MaterialIcons key={i} name={i < rating ? 'star' : 'star-border'} size={16} color={i < rating ? '#f59e0b' : c.subtext} />
          ))}
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: c.subtext }]}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  title: { fontSize: 18, fontWeight: '700' },
  sectionPad: { paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  avatar: { width: 96, height: 96, borderRadius: 999, backgroundColor: '#ddd' },
  name: { fontSize: 22, fontWeight: '800' },
  location: { fontSize: 14, marginTop: 2 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { color: '#22c55e', fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  followBtn: { paddingHorizontal: 16, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  messageBtn: { paddingHorizontal: 16, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 13, fontWeight: '700' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  statCard: { flexBasis: '32%', minWidth: 150, flexGrow: 1, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 16, fontSize: 18, fontWeight: '800' },
  about: { paddingHorizontal: 16, paddingTop: 6, fontSize: 14, lineHeight: 20 },
  tabs: { marginTop: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  tabList: { flexDirection: 'row', paddingHorizontal: 16 },
  tabItem: { paddingVertical: 12, marginRight: 18, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '700' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12 },
  dot: { marginHorizontal: 6 },
  status: { fontSize: 12, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
});
