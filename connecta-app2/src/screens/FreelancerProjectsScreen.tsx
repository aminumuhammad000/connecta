import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as projectService from '../services/projectService';
import * as collaboService from '../services/collaboService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Project } from '../types';

const chips: Array<{ key: 'All' | 'Active' | 'Completed' | 'Pending'; label: string }> = [
    { key: 'All', label: 'All' },
    { key: 'Active', label: 'Active' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Pending', label: 'Pending' },
];

const FreelancerProjectsScreen: React.FC<any> = ({ navigation }) => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Pending'>('All');
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProjects();
        }, [])
    );

    const loadProjects = async () => {
        try {
            if (!user?._id) return;
            // Fetch BOTH regular and collabo projects
            const [regularProjects, collaboProjects] = await Promise.all([
                projectService.getFreelancerProjects(user._id),
                collaboService.getFreelancerCollaboProjects()
            ]);

            // Mark collabo projects
            const markedCollabo = collaboProjects.map((p: any) => ({ ...p, isCollabo: true }));

            // Combine and sort by creation date
            const combined = [...regularProjects, ...markedCollabo].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setProjects(combined);
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
        if (status === 'ongoing' || status === 'in_progress') return 'In Progress';
        if (status === 'completed') return 'Completed';
        return 'Pending Approval';
    };

    const filtered = useMemo(() => {
        const base = projects.filter((p: any) =>
            p && p.title?.toLowerCase().includes(q.trim().toLowerCase())
        );
        if (filter === 'All') return base;
        if (filter === 'Active') return base.filter((p: any) => p.status === 'ongoing' || p.status === 'in_progress');
        if (filter === 'Completed') return base.filter((p: any) => p.status === 'completed');
        return base.filter((p: any) => p.status !== 'ongoing' && p.status !== 'in_progress' && p.status !== 'completed');
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

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={{ flex: 1, maxWidth: isDesktop ? 900 : 600, alignSelf: 'center', width: '100%' }}>
                {/* Top App Bar */}
                <View style={styles.appBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                            <MaterialIcons name="arrow-back" size={24} color={c.text} />
                        </TouchableOpacity>
                        <Text style={[styles.h1, { color: c.text }]}>My Jobs</Text>
                    </View>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Notifications"
                        style={styles.iconBtn}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialIcons name="notifications" size={24} color={c.text} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                    <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth }]}>
                        <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="Search my jobs..."
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
                                style={[styles.chip, { backgroundColor: active ? c.primary : c.card, borderWidth: active ? 0 : StyleSheet.hairlineWidth, borderColor: c.border }]}
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
                        <View style={{ alignItems: 'center', paddingTop: 60 }}>
                            <MaterialIcons name="work-outline" size={64} color={c.subtext} />
                            <Text style={{ color: c.text, fontSize: 18, marginTop: 16, fontWeight: '700' }}>
                                No Jobs Found
                            </Text>
                            <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                                You don't have any active projects yet.{'\n'}Start applying to jobs to get hired.
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MatchingJobs')}
                                style={{
                                    marginTop: 24,
                                    backgroundColor: c.primary,
                                    paddingHorizontal: 24,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <MaterialIcons name="search" size={20} color="#FFF" />
                                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>
                                    Find Jobs
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filtered.map((p: any) => {
                            if (!p) return null;
                            return (
                                <TouchableOpacity
                                    key={p._id}
                                    activeOpacity={0.85}
                                    style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
                                    onPress={() => {
                                        if (p.isCollabo) {
                                            navigation.navigate('CollaboWorkspace', { projectId: p._id });
                                        } else {
                                            navigation.navigate('ProjectWorkspace', { id: p._id });
                                        }
                                    }}
                                >
                                    <View style={styles.cardTop}>
                                        <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{p.title}</Text>
                                        <Text style={[styles.cardPrice, { color: c.primary }]}>
                                            {p.budget?.currency || '$'}{p.budget?.amount?.toLocaleString() || '0'}
                                        </Text>
                                    </View>
                                    <View style={styles.cardMiddle}>
                                        {(p.clientId?.profileImage) ? (
                                            <Image source={{ uri: p.clientId.profileImage }} style={styles.avatar} />
                                        ) : (
                                            <View style={[styles.avatar, { backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' }]}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{(p.clientId?.firstName || 'C')[0]}</Text>
                                            </View>
                                        )}
                                        <Text style={{ color: c.subtext, fontSize: 13 }}>
                                            {p.clientId?.firstName ? `${p.clientId.firstName} ${p.clientId.lastName}` : 'Client'}
                                        </Text>
                                    </View>
                                    <View style={styles.cardBottom}>
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            <View style={[styles.pill, pillStyle(mapProjectStatus(p.status))]}>
                                                <Text style={[styles.pillText, { color: pillStyle(mapProjectStatus(p.status)).color }]}>
                                                    {mapProjectStatus(p.status)}
                                                </Text>
                                            </View>
                                            {p.isCollabo && (
                                                <View style={[styles.pill, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                                                    <Text style={[styles.pillText, { color: '#7c3aed' }]}>Collabo</Text>
                                                </View>
                                            )}
                                        </View>
                                        <MaterialIcons name="chevron-right" size={22} color={c.subtext} />
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

function pillStyle(status: string) {
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
    card: { padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
    cardPrice: { fontSize: 16, fontWeight: '800' },
    cardMiddle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    avatar: { width: 24, height: 24, borderRadius: 12 },
    cardBottom: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 12, fontWeight: '700' },
});

export default FreelancerProjectsScreen;
