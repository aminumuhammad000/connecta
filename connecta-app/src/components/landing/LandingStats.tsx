import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const categories = [
    { label: "Programming & Tech", icon: "code", iconLib: Feather, desc: "Build platforms" },
    { label: "Graphics & Design", icon: "pen-tool", iconLib: Feather, desc: "Visual identities" },
    { label: "Digital Marketing", icon: "trending-up", iconLib: Feather, desc: "Expand reach" },
    { label: "Writing & Translation", icon: "file-text", iconLib: Feather, desc: "Compelling copy" },
    { label: "Video & Animation", icon: "video", iconLib: Feather, desc: "Stories to life" },
    { label: "AI Services", icon: "cpu", iconLib: Feather, desc: "Smart tech" },
    { label: "Music & Audio", icon: "music", iconLib: Feather, desc: "Sonic impact" },
    { label: "Business", icon: "briefcase", iconLib: Feather, desc: "Scale operations" },
];

const LandingStats = ({ isDesktop }: { isDesktop?: boolean }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        freelancersCount: 0,
        completedProjects: 0,
        paymentRevenue: 0,
        loading: true
    });

    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('📊 [LandingStats] Fetching real stats from server...');
            const response = await fetch(`${API_BASE_URL}/api/analytics/stats`);
            const data = await response.json();

            if (data.success && data.data) {
                console.log('✅ [LandingStats] Stats fetched successfully:', data.data.overview);
                setStats({
                    totalUsers: data.data.overview.totalUsers || 0,
                    freelancersCount: data.data.overview.freelancersCount || 0,
                    completedProjects: data.data.overview.completedProjects || 0,
                    paymentRevenue: data.data.overview.paymentRevenue || 0,
                    loading: false
                });
            } else {
                console.warn('⚠️ [LandingStats] Invalid response format, using defaults');
                setStats(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('❌ [LandingStats] Failed to fetch stats:', error);
            // Keep defaults on error
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    // Infinite Scroll Animation
    useEffect(() => {
        Animated.loop(
            Animated.timing(scrollX, {
                toValue: -width, // Scroll one screen width distance
                duration: 10000, // Adjust speed
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
        return num.toString();
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return '₦' + (amount / 1000000).toFixed(1) + 'M+';
        if (amount >= 1000) return '₦' + (amount / 1000).toFixed(1) + 'k+';
        return '₦' + amount.toLocaleString();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Platform <Text style={{ color: '#FD6730' }}>Growth</Text>
                </Text>
                <Text style={styles.subtitle}>
                    Join the fastest growing network of digital professionals.
                </Text>
            </View>

            {/* Marquee Label */}
            <View style={styles.tagContainer}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>Explore Categories</Text>
                </View>
            </View>

            {/* Infinite Marquee */}
            <View style={styles.marqueeContainer}>
                <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX: scrollX }] }]}>
                    {/* Render Double for infinite loop illusion */}
                    {[...categories, ...categories, ...categories].map((cat, i) => (
                        <TouchableOpacity key={i} style={styles.categoryCard} activeOpacity={0.8}>
                            <cat.iconLib name={cat.icon as any} size={18} color="#FD6730" />
                            <Text style={styles.categoryText}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
                {/* Gradients to fade edges */}
                <LinearGradient colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.leftFade} />
                <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rightFade} />
            </View>

            {/* Stats Grid */}
            <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
                {isDesktop ? (
                    // Desktop: Single Row of 4
                    <View style={styles.desktopRowFull}>
                        <StatCard icon="users" label="Total Users" value={formatNumber(stats.totalUsers)} loading={stats.loading} />
                        <StatCard icon="code" label="Contributors" value={formatNumber(stats.freelancersCount)} loading={stats.loading} />
                        <StatCard icon="check-circle" label="Projects Done" value={formatNumber(stats.completedProjects)} loading={stats.loading} />
                        <StatCard icon="dollar-sign" label="Total Paid Out" value={formatCurrency(stats.paymentRevenue)} loading={stats.loading} />
                    </View>
                ) : (
                    // Mobile: 2x2 Grid using Rows
                    <>
                        <View style={styles.row}>
                            <StatCard icon="users" label="Total Users" value={formatNumber(stats.totalUsers)} loading={stats.loading} />
                            <StatCard icon="code" label="Contributors" value={formatNumber(stats.freelancersCount)} loading={stats.loading} />
                        </View>
                        <View style={styles.row}>
                            <StatCard icon="check-circle" label="Projects Done" value={formatNumber(stats.completedProjects)} loading={stats.loading} />
                            <StatCard icon="dollar-sign" label="Total Paid Out" value={formatCurrency(stats.paymentRevenue)} loading={stats.loading} />
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const StatCard = ({ icon, label, value, loading }: { icon: string, label: string, value: string, loading?: boolean }) => (
    <View style={styles.card}>
        <View style={styles.iconBox}>
            <Feather name={icon as any} size={20} color="#FD6730" />
        </View>
        {loading ? (
            <View style={styles.skeleton}>
                <View style={styles.skeletonLine} />
            </View>
        ) : (
            <Text style={styles.cardValue}>{value}</Text>
        )}
        <Text style={styles.cardLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 40,
        backgroundColor: '#FFF',
    },
    header: {
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        maxWidth: 260,
        lineHeight: 20,
    },
    tagContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FD6730',
        textTransform: 'uppercase',
    },
    marqueeContainer: {
        height: 60,
        marginBottom: 32,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    marqueeTrack: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EDF2F7',
        borderRadius: 12,
        marginRight: 12, // Gap manual
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 2,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
    },
    leftFade: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 40,
        zIndex: 10,
    },
    rightFade: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        zIndex: 10,
    },
    grid: {
        paddingHorizontal: 24,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF5F0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#718096',
    },
    skeleton: {
        height: 28,
        width: '60%',
        marginBottom: 4,
    },
    skeletonLine: {
        flex: 1,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
    desktopGrid: {
        width: '100%',
    },
    desktopRowFull: {
        flexDirection: 'row',
        gap: 24,
        width: '100%',
    },
    desktopRow: {
        flex: 1,
        gap: 16,
    }
});

export default LandingStats;
