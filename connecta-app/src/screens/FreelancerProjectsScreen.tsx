import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as projectService from '../services/projectService';
import proposalService from '../services/proposalService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Project } from '../types';

const chips: Array<{ key: 'All' | 'In-Progress' | 'Completed' | 'Pending' | 'Review'; label: string }> = [
    { key: 'All', label: 'All' },
    { key: 'In-Progress', label: 'In-Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Review', label: 'For Review' },
];

const FreelancerProjectsScreen: React.FC<any> = ({ navigation }) => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState<'All' | 'In-Progress' | 'Completed' | 'Pending' | 'Review'>('All');
    const [projects, setProjects] = useState<any[]>([]);
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
            const [regularProjects, proposals] = await Promise.all([
                projectService.getFreelancerProjects(user._id),
                proposalService.getFreelancerProposals(user._id)
            ]);

            // Transform non-rejected proposals into "project-like" objects
            const proposalItems = (proposals || [])
                .filter((p: any) => p.status !== 'rejected' && p.status !== 'declined')
                .map((p: any) => ({
                    _id: p._id,
                    title: p.jobId?.title || 'Job Proposal',
                    budget: p.budget || { amount: p.price, currency: '₦' },
                    status: p.status === 'accepted' ? 'proposal_accepted' : 
                            p.status === 'pending' ? 'proposal_pending' : p.status,
                    clientId: p.jobId?.clientId || p.clientId,
                    createdAt: p.createdAt,
                    isProposal: true
                }));

            const combined = [...(regularProjects || []), ...proposalItems].sort((a: any, b: any) =>
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

    const mapProjectStatus = (status: string): string => {
        if (status === 'ongoing' || status === 'in_progress') return 'In Progress';
        if (status === 'completed') return 'Completed';
        if (status === 'proposal_accepted') return 'Contract Pending';
        if (status === 'proposal_pending') return 'Pending';
        if (status === 'accepted') return 'Accepted';
        if (status === 'submitted') return 'Under Review';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const filtered = useMemo(() => {
        const base = projects.filter((p: any) =>
            p && p.title?.toLowerCase().includes(q.trim().toLowerCase())
        );
        if (filter === 'All') return base;
        if (filter === 'In-Progress') return base.filter((p: any) => p.status === 'ongoing' || p.status === 'in_progress');
        if (filter === 'Completed') return base.filter((p: any) => p.status === 'completed');
        if (filter === 'Pending') return base.filter((p: any) => p.status === 'proposal_accepted' || p.status === 'proposal_pending');
        if (filter === 'Review') return base.filter((p: any) => p.status === 'submitted');
        return base;
    }, [projects, q, filter]);

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

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
            <View style={{ flex: 1, maxWidth: isDesktop ? 900 : 600, alignSelf: 'center', width: '100%' }}>
                {/* Top App Bar */}
                <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.h1, { color: c.text }]}>My Jobs</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Messages')} style={styles.iconBtn}>
                        <MaterialIcons name="chat-bubble-outline" size={22} color={c.text} />
                    </TouchableOpacity>
                </View>

                {/* Search & Filter */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>
                        <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginLeft: 12 }} />
                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="Search active jobs..."
                            placeholderTextColor={c.subtext}
                            style={[styles.searchInput, { color: c.text }]}
                        />
                    </View>
                </View>

                {/* Chips / Navs */}
                <View style={{ marginTop: 16 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ 
                            paddingHorizontal: 16, 
                            gap: 10,
                            paddingBottom: 4
                        }}
                    >
                        {chips.map(ch => {
                            const active = filter === ch.key;
                            return (
                                <TouchableOpacity
                                    key={ch.key}
                                    onPress={() => setFilter(ch.key)}
                                    style={[
                                        styles.chip, 
                                        { 
                                            backgroundColor: active ? c.primary : c.card,
                                            borderColor: active ? c.primary : c.border,
                                            borderWidth: 1 
                                        }
                                    ]}
                                >
                                    <Text style={[styles.chipText, { color: active ? '#fff' : c.subtext }]}>{ch.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* List Container - Improved spacing between cards */}
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, gap: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} tintColor={c.primary} />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingTop: 80 }}>
                            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <MaterialIcons name="work-outline" size={48} color={c.subtext} />
                            </View>
                            <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>No Jobs Found</Text>
                            <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                                You don't have any projects in this category yet.
                            </Text>
                        </View>
                    ) : (
                        filtered.map((p: any) => {
                            if (!p) return null;
                            const statusLabel = mapProjectStatus(p.status);
                            const sStyle = pillStyle(statusLabel);

                            return (
                                <TouchableOpacity
                                    key={p._id}
                                    activeOpacity={0.9}
                                    style={[styles.card, { backgroundColor: c.card, borderColor: c.border, shadowColor: c.shadows.medium.shadowColor }]}
                                    onPress={() => {
                                        if (p.isProposal) {
                                            navigation.navigate('ProposalDetail', { id: p._id });
                                        } else {
                                            navigation.navigate('ProjectDetail', { projectId: p._id });
                                        }
                                    }}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{p.title}</Text>
                                            <Text style={{ fontSize: 12, color: c.subtext, marginTop: 4 }}>
                                                {p.isProposal ? 'Proposal submitted' : `Started ${new Date(p.createdAt).toLocaleDateString()}`}
                                            </Text>
                                        </View>
                                        <View style={[styles.pill, { backgroundColor: sStyle.backgroundColor }]}>
                                            <Text style={[styles.pillText, { color: sStyle.color }]}>{statusLabel}</Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: c.border, marginVertical: 14 }} />

                                    <View style={styles.cardInfo}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                            {(p.clientId?.profileImage) ? (
                                                <Image source={{ uri: p.clientId.profileImage }} style={styles.avatar} />
                                            ) : (
                                                <View style={[styles.avatar, { backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: c.primary }}>{(p.clientId?.firstName || 'C')[0]}</Text>
                                                </View>
                                            )}
                                            <View>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                                                    {p.clientId?.firstName ? `${p.clientId.firstName} ${p.clientId.lastName}` : 'Client'}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: c.subtext }}>Client</Text>
                                            </View>
                                        </View>

                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.cardPrice, { color: c.text }]}>
                                                {p.budget?.currency || '₦'}{p.budget?.amount?.toLocaleString() || '0'}
                                            </Text>
                                            <Text style={{ fontSize: 11, color: c.subtext }}>{p.isProposal ? 'Bid' : 'Budget'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            style={[styles.primaryAction, { backgroundColor: c.primary }]}
                                            onPress={() => {
                                                if (p.isProposal) {
                                                    navigation.navigate('ProposalDetail', { id: p._id });
                                                } else {
                                                    navigation.navigate('ProjectDetail', { projectId: p._id });
                                                }
                                            }}
                                        >
                                            <Text style={styles.actionText}>{p.isProposal ? 'View Proposal' : 'Workspace'}</Text>
                                            <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.secondaryAction, { backgroundColor: c.primary + '10' }]}
                                            onPress={() => {
                                                navigation.navigate('MessagesDetail', {
                                                    receiverId: p.clientId?._id || p.clientId,
                                                    userName: p.clientId?.firstName ? `${p.clientId.firstName} ${p.clientId.lastName}` : 'Client',
                                                    projectId: p._id
                                                });
                                            }}
                                        >
                                            <MaterialIcons name="chat" size={18} color={c.primary} />
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
    searchWrap: { height: 46, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
    searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
    chip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    chipText: { fontSize: 13, fontWeight: '700' },
    card: { 
        padding: 16, 
        borderRadius: 20, 
        borderWidth: 1, 
        elevation: 4, 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 12 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
    cardPrice: { fontSize: 16, fontWeight: '700' },
    cardInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    cardActions: { 
        marginTop: 16, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12 
    },
    primaryAction: { 
        flex: 1, 
        height: 44, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8 
    },
    actionText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    secondaryAction: { 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});

function pillStyle(status: string) {
    if (status === 'In Progress') return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb' };
    if (status === 'Completed') return { backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' };
    if (status === 'Contract Pending' || status === 'Accepted') return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#a16207' };
    if (status === 'Pending') return { backgroundColor: 'rgba(16,185,129,0.12)', color: '#166534' };
    if (status === 'Under Review') return { backgroundColor: 'rgba(245,158,11,0.12)', color: '#b45309' };
    return { backgroundColor: 'rgba(107,114,128,0.12)', color: '#6B7280' };
}

export default FreelancerProjectsScreen;
