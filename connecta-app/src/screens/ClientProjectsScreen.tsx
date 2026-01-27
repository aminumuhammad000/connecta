import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as projectService from '../services/projectService';
import { getMyCollaboProjects } from '../services/collaboService';
import { Project } from '../types';

interface ProjectItem {
  id: string;
  title: string;
  price: string;
  freelancer: string;
  avatar: string;
  status: 'In Progress' | 'Completed' | 'Pending Approval';
}

const chips: Array<{ key: 'All' | 'Active' | 'Completed' | 'Pending'; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'Active', label: 'Active' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Pending', label: 'Pending' },
];

const ClientProjectsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Pending'>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const [standardProjects, collaboProjects] = await Promise.all([
        projectService.getMyProjects(),
        getMyCollaboProjects()
      ]);

      const normalizedCollabo = Array.isArray(collaboProjects) ? collaboProjects.map((p: any) => ({
        _id: p._id,
        title: p.title,
        budget: p.totalBudget,
        status: p.status === 'planning' ? 'review' : (p.status === 'active' ? 'in_progress' : p.status),
        freelancerId: { firstName: p.teamName || 'Collabo', lastName: 'Team', profileImage: 'https://ui-avatars.com/api/?name=Team&background=8B5CF6&color=fff' },
        isCollabo: true,
        createdAt: p.createdAt
      })) : [];

      const allProjects = [...(Array.isArray(standardProjects) ? standardProjects : []), ...normalizedCollabo]
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setProjects(allProjects as any);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProjects();
  };

  const mapProjectStatus = (status: string): 'In Progress' | 'Completed' | 'Pending Approval' => {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    return 'Pending Approval';
  };

  const filtered = useMemo(() => {
    const base = projects.filter((p: any) =>
      p.title?.toLowerCase().includes(q.trim().toLowerCase())
    );
    if (filter === 'All') return base;
    if (filter === 'Active') return base.filter((p: any) => p.status === 'in_progress');
    if (filter === 'Completed') return base.filter((p: any) => p.status === 'completed');
    return base.filter((p: any) => p.status === 'review');
  }, [projects, q, filter]);

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
        {/* Top App Bar */}
        <View style={[styles.appBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: c.text }]}>My Projects</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PostJob')}
            style={[styles.iconBtn, { backgroundColor: c.primary + '15' }]}
            accessibilityLabel="Add project"
          >
            <MaterialIcons name="add" size={24} color={c.primary} />
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View style={[styles.searchWrap, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginBottom: 12 }]}>
            <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search projects..."
              placeholderTextColor={c.subtext}
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {chips.map(ch => {
              const active = filter === ch.key;
              return (
                <TouchableOpacity
                  key={ch.key}
                  onPress={() => setFilter(ch.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? c.primary + '15' : c.card,
                      borderColor: active ? c.primary : c.border,
                      borderWidth: 1
                    }
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? c.primary : c.subtext }]}>{ch.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 + insets.bottom, gap: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MaterialIcons name="folder-open" size={40} color={c.subtext} />
              </View>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>No projects found</Text>
              <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                {filter === 'All' ? 'Your active projects will appear here' : `No ${filter.toLowerCase()} projects found`}
              </Text>
            </View>
          ) : (
            filtered.map((p: any) => {
              if (!p) return null;
              const status = mapProjectStatus(p.status);
              const statusColor = pillStyle(status);

              return (
                <TouchableOpacity
                  key={p._id}
                  activeOpacity={0.9}
                  style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}
                  onPress={() => (p as any).isCollabo
                    ? navigation.navigate('CollaboWorkspace', { projectId: p._id })
                    : navigation.navigate('ProjectWorkspace', { id: p._id })
                  }
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{p.title || 'Untitled Project'}</Text>
                      <Text style={{ fontSize: 12, color: c.subtext, marginTop: 4 }}>
                        Started {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: statusColor.backgroundColor }]}>
                      <Text style={[styles.pillText, { color: statusColor.color }]}>{status}</Text>
                    </View>
                  </View>

                  <View style={{ height: 1, backgroundColor: c.border, marginVertical: 12 }} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                      onPress={() => {
                        if (p.freelancerId && (p.freelancerId._id || p.freelancerId.id)) {
                          navigation.navigate('FreelancerPublicProfile', { id: p.freelancerId._id || p.freelancerId.id });
                        }
                      }}
                    >
                      <Image
                        source={{ uri: p.freelancerId?.profileImage || `https://ui-avatars.com/api/?name=${p.freelancerId?.firstName}+${p.freelancerId?.lastName}&background=random` }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>
                          {p.freelancerId ? `${p.freelancerId.firstName} ${p.freelancerId.lastName}` : 'Freelancer'}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.subtext }}>Freelancer</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.cardPrice, { color: c.text }]}>₦{p.budget?.toLocaleString() || '0'}</Text>
                      <Text style={{ fontSize: 11, color: c.subtext }}>Budget</Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: c.primary,
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-start',
                        gap: 6
                      }}
                      onPress={() => (p as any).isCollabo
                        ? navigation.navigate('CollaboWorkspace', { projectId: p._id })
                        : navigation.navigate('ProjectWorkspace', { id: p._id })
                      }
                    >
                      <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Open Workspace</Text>
                      <MaterialIcons name="arrow-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

function pillStyle(status: ProjectItem['status']) {
  if (status === 'In Progress') return { backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
  if (status === 'Completed') return { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' };
  return { backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  h1: { fontSize: 18, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  searchWrap: { height: 44, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginRight: 4 },
  chipText: { fontSize: 13, fontWeight: '600' },
  card: { padding: 16, borderRadius: 12, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  cardPrice: { fontSize: 15, fontWeight: '700' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pillText: { fontSize: 11, fontWeight: '600' },
});

export default ClientProjectsScreen;
