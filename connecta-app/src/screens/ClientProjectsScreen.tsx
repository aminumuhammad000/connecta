import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as projectService from '../services/projectService';
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
      const data = await projectService.getMyProjects();
      setProjects(data);
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
        <View style={styles.appBar}> 
          <Text style={[styles.h1, { color: c.text }]}>My Projects</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" style={styles.iconBtn}>
            <MaterialIcons name="notifications" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={[styles.searchWrap, { backgroundColor: c.card }]}> 
            <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search projects..."
              placeholderTextColor={c.subtext}
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>
        </View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 12 }}
        >
          {chips.map(ch => {
            const active = filter === ch.key;
            return (
              <TouchableOpacity
                key={ch.key}
                onPress={() => setFilter(ch.key)}
                style={[styles.chip, { backgroundColor: active ? c.primary : c.card }]}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : c.text }]}>{ch.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 96 + insets.bottom, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <MaterialIcons name="folder-open" size={64} color={c.subtext} />
              <Text style={{ color: c.text, fontSize: 18, marginTop: 16 }}>No projects found</Text>
              <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8 }}>Your projects will appear here</Text>
            </View>
          ) : (
            filtered.map((p: any) => (
              <TouchableOpacity key={p._id} activeOpacity={0.85} style={[styles.card, { backgroundColor: c.card }]}> 
                <View style={styles.cardTop}> 
                  <Text style={[styles.cardTitle, { color: c.text }]}>{p.title}</Text>
                  <Text style={[styles.cardPrice, { color: c.primary }]}>₦{p.budget?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.cardMiddle}> 
                  <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer' }} style={styles.avatar} />
                  <Text style={{ color: c.subtext, fontSize: 13 }}>Freelancer</Text>
                </View>
                <View style={styles.cardBottom}> 
                  <View style={[styles.pill, pillStyle(mapProjectStatus(p.status))]}> 
                    <Text style={[styles.pillText, { color: pillStyle(mapProjectStatus(p.status)).color }]}>
                    {mapProjectStatus(p.status)}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={c.subtext} />
              </View>
            </TouchableOpacity>
          )))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => navigation.navigate('PostJob')}
          style={[styles.fab, { backgroundColor: c.primary, bottom: 24 + insets.bottom }]}
          accessibilityRole="button"
          accessibilityLabel="Add project"
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Bottom Nav */}
</View>
    </SafeAreaView>
  );
};

function pillStyle(status: ProjectItem['status']) {
  if (status === 'In Progress') return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb' };
  if (status === 'Completed') return { backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' };
  return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#a16207' };
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  h1: { fontSize: 22, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  searchWrap: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  chip: { height: 40, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '700' },
  card: { padding: 12, borderRadius: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardPrice: { fontSize: 16, fontWeight: '800' },
  cardMiddle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  avatar: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#ddd' },
  cardBottom: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', right: 20, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
});

export default ClientProjectsScreen;
