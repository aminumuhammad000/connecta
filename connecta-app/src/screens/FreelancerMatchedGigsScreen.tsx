import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

interface GigItem {
  id: string;
  client: string;
  clientAvatar: string;
  clientRating: number;
  clientReviews: number;
  matchNote: string;
  title: string;
  summary: string;
  chips: string[];
  footer: string; // rate or fixed price
}

const GIGS: GigItem[] = [
  {
    id: 'g1',
    client: 'Innovate Inc.',
    clientAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCht5EhafSiD4V4Tbw_nUOmqlc-SH9q3sWwDVl903XzsUM5dF5TZMCedpA8plyXtckZy7Tk590rNmMrQXp6cDb_I1RLnDBLIQp6ouXsJpr34wEJnZU9W3ORQxlFT8zoreGLF8dE92Lp2C56iMPIUwBYMAghhfnqBCU-8H2ZBv5VqxKyqHwaSac-8vtBBiMVduIohBUVrrYqmpAYMrVVXrkNlFiM6GXG38NurQ8Tqm81MeBZOSsmq5KAjruVRr8QGciBcSfjQntG2U',
    clientRating: 4.9,
    clientReviews: 124,
    matchNote: "Matches your 'UI Design' skill",
    title: 'Senior UX Designer for Mobile App',
    summary:
      "We're looking for an experienced UX designer to help redesign our flagship mobile application.",
    chips: ['UI Design', 'UX Research', '3-6 Months'],
    footer: '$50 - $70 / hour',
  },
  {
    id: 'g2',
    client: 'SaaS Co.',
    clientAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzt1ZwaG0_YKfyBl20CBgf7dE4XJ3eAOcwMoADVmUDrRjmi57SQa0hsP2x2Ns6N7YtbfKt3GRpB2PtTjt90qMO_GVWZfrQsXei3jN408ALLpPzWZUvFAaxIchebzPogOIBM_2KSgu1IAn47zKT0I-elo329-HocfZZNc3E1PNf0EBdWelI6Gf77CUZQ60tiBnKs3WlZcwqhJj3B6SpUAOH9SmMQeHteBcoWtmrtIVUbD8itUvlOroHJs5Zi0juqS7jhX5IQzR064',
    clientRating: 4.8,
    clientReviews: 89,
    matchNote: "Matches your 'Copywriting' skill",
    title: 'Website Copywriting for SaaS Company',
    summary:
      'Craft compelling copy for our new website launch, focusing on user conversion and brand voice.',
    chips: ['Copywriting', 'Fixed Price'],
    footer: 'Fixed Price: $2,500',
  },
  {
    id: 'g3',
    client: 'E-Shop',
    clientAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDe64rK90zs77XIfvDrOXCkkQR-94JwSF0W4pjp2ACis0jvt70MEz8DdDDJrT1BV7l1bq-rtdNsgK-Q0-eTOrVrYz-5rdzFGSsGCIUmEjkZOjTfB6bF9SIhPiohoPQb3XFu6FjOZsPSJFjpAnSm1qxkY_XkbyQjIMXJ4lCvvguLI3GX6yymXR9HcINp9p7-t409Y8575C8prlCZYxghxHWh1DspPJHJGnA1e5UZWhJxbooHlV2tDTSCasuGiiYEyRQDF1EwYq2X2DE',
    clientRating: 5.0,
    clientReviews: 210,
    matchNote: "Matches your 'Web Development' skill",
    title: 'Frontend Developer for E-commerce Site',
    summary:
      'Develop and maintain the frontend of our Shopify store, implementing new features and ensuring responsiveness.',
    chips: ['Shopify', 'React', 'Project-based'],
    footer: '$4k - $6k Project',
  },
];

const FreelancerMatchedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={[styles.appBar, { borderBottomColor: c.border }]}> 
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="search" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: c.text }]}>Matched For You</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="tune" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}>
          {GIGS.map(g => (
            <View key={g.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Image source={{ uri: g.clientAvatar }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700' }}>{g.client}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="star" size={14} color="#f59e0b" />
                      <Text style={{ color: c.subtext, fontSize: 12 }}>{g.clientRating.toFixed(1)} ({g.clientReviews} reviews)</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ color: c.primary, fontSize: 12, fontWeight: '700' }}>{g.matchNote}</Text>
                <Text style={[styles.title, { color: c.text }]}>{g.title}</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>{g.summary}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {g.chips.map(ch => (
                    <View key={ch} style={[styles.chip, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}> 
                      <Text style={{ color: c.subtext, fontSize: 12, fontWeight: '700' }}>{ch}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }]}> 
                <Text style={{ color: c.text, fontWeight: '800' }}>{g.footer}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('JobDetail')} style={[styles.applyBtn, { backgroundColor: c.primary }]}> 
                  <Text style={styles.applyText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <BottomNav
          activeKey="home"
          onChange={(key) => {
            if (key === 'home') return;
            if (key === 'jobs') return navigation.navigate('Dashboard');
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  h1: { fontSize: 18, fontWeight: '800' },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#ddd' },
  title: { fontSize: 16, fontWeight: '800', marginVertical: 4 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  footer: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  applyBtn: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  applyText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default FreelancerMatchedGigsScreen;
