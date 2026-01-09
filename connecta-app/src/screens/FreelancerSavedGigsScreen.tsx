import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../services/jobService';
import { Job } from '../types';

const FreelancerSavedGigsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayType, setSelectedPayType] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPayTypeMenu, setShowPayTypeMenu] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true);
      const jobs = await jobService.getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const filteredGigs = useMemo(() => {
    let gigs = [...savedJobs];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      gigs = gigs.filter(g => {
        if (!g) return false;
        return (
          g.title?.toLowerCase().includes(q) ||
          g.company?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
        );
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      gigs = gigs.filter(gig =>
        gig.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        gig.skills?.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Filter by pay type
    if (selectedPayType !== 'all') {
      gigs = gigs.filter(gig =>
        selectedPayType === 'fixed' ? gig.budgetType === 'fixed' : gig.budgetType === 'hourly'
      );
    }

    return gigs;
  }, [savedJobs, selectedCategory, selectedPayType, searchQuery]);

  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Category';
    return selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
  };

  const getPayTypeLabel = () => {
    if (selectedPayType === 'all') return 'Pay Type';
    if (selectedPayType === 'fixed') return 'Fixed Price';
    if (selectedPayType === 'hourly') return 'Hourly';
    return 'Pay Type';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="arrow-back" size={24} color={c.text} />
            </TouchableOpacity>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Saved Gigs</Text>
            <View style={{ width: 48, height: 48 }} />
          </View>
          {/* Search */}
          <View style={{ marginTop: 12 }}>
            <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialIcons name="search" size={20} color={c.subtext} style={{ marginHorizontal: 12 }} />
              <TextInput
                placeholder="Search saved jobs..."
                placeholderTextColor={c.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, color: c.text, paddingRight: 12 }}
              />
            </View>
          </View>
          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 10 }}>
            <TouchableOpacity
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
              style={[styles.chip, { borderColor: c.border, backgroundColor: c.isDark ? 'rgba(0,0,0,0.2)' : '#fff' }]}
            >
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>{getCategoryLabel()}</Text>
              <MaterialIcons name="expand-more" size={16} color={c.subtext} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPayTypeMenu(!showPayTypeMenu)}
              style={[styles.chip, { borderColor: c.border, backgroundColor: c.isDark ? 'rgba(0,0,0,0.2)' : '#fff' }]}
            >
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>{getPayTypeLabel()}</Text>
              <MaterialIcons name="expand-more" size={16} color={c.subtext} />
            </TouchableOpacity>
          </ScrollView>

          {/* Category Menu Dropdown */}
          {showCategoryMenu && (
            <View style={[styles.sortMenu, { backgroundColor: c.card, borderColor: c.border }]}>
              {['all', 'design', 'development', 'marketing', 'writing'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.sortOption}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                >
                  <Text style={{ color: selectedCategory === cat ? c.primary : c.text, fontSize: 14, fontWeight: selectedCategory === cat ? '600' : '500', textTransform: 'capitalize' }}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </Text>
                  {selectedCategory === cat && <MaterialIcons name="check" size={20} color={c.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pay Type Menu Dropdown */}
          {showPayTypeMenu && (
            <View style={[styles.sortMenu, { backgroundColor: c.card, borderColor: c.border }]}>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'fixed', label: 'Fixed Price' },
                { id: 'hourly', label: 'Hourly' }
              ].map(pt => (
                <TouchableOpacity
                  key={pt.id}
                  style={styles.sortOption}
                  onPress={() => {
                    setSelectedPayType(pt.id);
                    setShowPayTypeMenu(false);
                  }}
                >
                  <Text style={{ color: selectedPayType === pt.id ? c.primary : c.text, fontSize: 14, fontWeight: selectedPayType === pt.id ? '600' : '500' }}>
                    {pt.label}
                  </Text>
                  {selectedPayType === pt.id && <MaterialIcons name="check" size={20} color={c.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}>
          {filteredGigs.length > 0 ? (
            filteredGigs.map(item => (
              <View key={item._id} style={[styles.card, { backgroundColor: c.card, shadowColor: '#000' }]}>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.subtext, fontSize: 13 }}>{item.company || 'Unknown Company'}</Text>
                      <Text style={{ color: c.text, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{item.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleUnsave(item._id)}>
                      <MaterialIcons name="bookmark" size={22} color={c.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: c.subtext, fontSize: 13 }} numberOfLines={3}>{item.description}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {item.budget && (
                    <View style={[styles.pill, { backgroundColor: c.primary + '1A' }]}>
                      <Text style={{ color: c.primary, fontSize: 12, fontWeight: '700' }}>
                        {item.budgetType === 'hourly' ? 'Hourly' : 'Fixed'}: {item.budget}
                      </Text>
                    </View>
                  )}
                  {item.locationType && (
                    <View style={[styles.pill, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
                      <Text style={{ color: c.subtext, fontSize: 12, fontWeight: '700' }}>{item.locationType}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: c.isDark ? '#6B7280' : '#9CA3AF', fontSize: 12 }}>
                    Posted {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('JobDetail', { id: item._id })} style={[styles.btn, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
                      <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (item.isExternal && item.applyUrl) {
                          import('react-native').then(({ Linking }) => {
                            Linking.openURL(item.applyUrl!);
                          });
                        } else {
                          navigation.navigate('JobDetail', { id: item._id });
                        }
                      }}
                      style={[styles.btn, { backgroundColor: c.primary }]}
                    >
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                        {item.isExternal ? 'Visit Job' : 'Apply Now'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: c.subtext, marginTop: 40 }}>No saved jobs found</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchWrap: { height: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  chip: { height: 32, borderRadius: 999, paddingHorizontal: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { borderRadius: 12, padding: 16, gap: 10, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btn: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  sortMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});

export default FreelancerSavedGigsScreen;
