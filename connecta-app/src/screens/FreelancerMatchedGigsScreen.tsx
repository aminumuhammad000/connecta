import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface GigItem {
  id: string;
  title: string;
  company: string;
  budget: string;
  type: 'Fixed' | 'Hourly';
  skills: string[];
  postedAgo: string;
  status: 'New' | 'Hot' | 'Featured';
  description: string;
}

const GIGS: GigItem[] = [
  {
    id: 'g1',
    title: 'Mobile App UI/UX Design',
    company: 'Innovate Inc.',
    budget: '$3,500',
    type: 'Fixed',
    skills: ['Figma', 'Mobile Design', 'Prototyping'],
    postedAgo: '2 hours ago',
    status: 'Featured',
    description: 'Looking for an experienced UI/UX designer to create a modern mobile app interface...',
  },
  {
    id: 'g2',
    title: 'React Native Developer',
    company: 'Tech Startup',
    budget: '$75-$95/hr',
    type: 'Hourly',
    skills: ['React Native', 'TypeScript', 'Mobile'],
    postedAgo: '5 hours ago',
    status: 'Hot',
    description: 'We need a skilled React Native developer for our fintech application...',
  },
  {
    id: 'g3',
    title: 'Brand Identity Package',
    company: 'Fintech Hub',
    budget: '$1,800',
    type: 'Fixed',
    skills: ['Branding', 'Logo Design', 'Style Guide'],
    postedAgo: '1 day ago',
    status: 'New',
    description: 'Create a complete brand identity package including logo, colors, and guidelines...',
  },
];

const FreelancerMatchedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'fixed' | 'hourly' | 'remote'>('all');
  const [savedGigs, setSavedGigs] = useState<Set<string>>(new Set());

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
            <Text style={[styles.resultsText, { color: c.subtext }]}>{GIGS.length} jobs found</Text>

            <View style={{ gap: 12, marginTop: 12 }}>
              {GIGS.map((gig) => (
                <Card key={gig.id} variant="elevated" padding={16}>
                  <View style={styles.gigCard}>
                    <View style={styles.gigHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.gigTitle, { color: c.text }]} numberOfLines={2}>
                            {gig.title}
                          </Text>
                          <Badge label={gig.status} variant={getStatusVariant(gig.status)} size="small" />
                        </View>
                        <Text style={[styles.company, { color: c.subtext }]}>{gig.company}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleSaveGig(gig.id)}>
                        <MaterialIcons
                          name={savedGigs.has(gig.id) ? "bookmark" : "bookmark-border"}
                          size={24}
                          color={savedGigs.has(gig.id) ? c.primary : c.subtext}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: c.subtext }]} numberOfLines={2}>
                      {gig.description}
                    </Text>

                    <View style={styles.gigMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="account-balance-wallet" size={16} color={c.subtext} />
                        <Text style={[styles.metaText, { color: c.text }]}>{gig.budget}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={16} color={c.subtext} />
                        <Text style={[styles.metaText, { color: c.subtext }]}>{gig.postedAgo}</Text>
                      </View>
                      <Badge label={gig.type} variant="neutral" size="small" />
                    </View>

                    <View style={styles.skillsRow}>
                      {gig.skills.map((skill, idx) => (
                        <Badge key={idx} label={skill} variant="info" size="small" />
                      ))}
                    </View>

                    <View style={styles.gigActions}>
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
