import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import Animated, {
    FadeInDown,
    FadeInRight,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SparkHistoryScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();

    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'history' | 'earn' | 'benefits' | 'referral'>('history');

    // Animation for the Spark Counter
    const sparkScale = useSharedValue(1);

    const loadData = async () => {
        try {
            const [historyRes, statsRes] = await Promise.all([
                userService.getSparkHistory(1, 50),
                userService.getSparkStats()
            ]);
            setHistory(historyRes.data || []);
            setStats(statsRes.data || null);

            // Sync with global user state
            if (statsRes.data) {
                const updatedUser = await userService.getMe();
                updateUser(updatedUser);
            }
        } catch (error) {
            console.error('Error loading spark data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    const sparkAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sparkScale.value }]
    }));

    const renderHistory = () => (
        <View style={styles.listContainer}>
            {history.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="history" size={48} color={c.subtext} />
                    <Text style={[styles.emptyText, { color: c.subtext }]}>No spark history found.</Text>
                </View>
            ) : (
                history.map((item, index) => (
                    <Animated.View
                        key={item._id}
                        entering={FadeInDown.delay(index * 50)}
                        style={[styles.historyItem, { backgroundColor: c.card, borderColor: c.border }]}
                    >
                        <View style={[styles.historyIcon, { backgroundColor: item.amount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                            <MaterialCommunityIcons
                                name={item.amount > 0 ? "lightning-bolt" : "lightning-bolt-outline"}
                                size={24}
                                color={item.amount > 0 ? "#10B981" : "#EF4444"}
                            />
                        </View>
                        <View style={styles.historyContent}>
                            <Text style={[styles.historyTitle, { color: c.text }]}>{item.description}</Text>
                            <Text style={[styles.historyDate, { color: c.subtext }]}>
                                {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <Text style={[styles.historyAmount, { color: item.amount > 0 ? "#10B981" : "#EF4444" }]}>
                            {item.amount > 0 ? '+' : ''}{item.amount}
                        </Text>
                    </Animated.View>
                ))
            )}
        </View>
    );

    const renderHowToEarn = () => (
        <View style={styles.listContainer}>
            {[
                { title: 'Daily Login', desc: 'Securely login every day to claim your reward.', sparks: 5, icon: 'today' },
                { title: 'Identity Verification', desc: 'Get verified to build trust and earn sparks.', sparks: 100, icon: 'verified-user' },
                { title: 'Complete Profile', desc: 'Fill your profile to 100% to boost your trust.', sparks: 50, icon: 'person' },
                { title: 'First Job', desc: 'Complete your first contract on Connecta.', sparks: 100, icon: 'work' },
                { title: 'Refer a Friend', desc: 'Invite friends and get rewarded when they join.', sparks: 50, icon: 'group-add' },
                { title: 'Leave Review', desc: 'Review your experience after a project wraps up.', sparks: 15, icon: 'star' },
            ].map((item, index) => (
                <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 50)}
                    style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                    <View style={[styles.infoIcon, { backgroundColor: c.primary + '15' }]}>
                        <MaterialIcons name={item.icon as any} size={24} color={c.primary} />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoTitle, { color: c.text }]}>{item.title}</Text>
                        <Text style={[styles.infoDesc, { color: c.subtext }]}>{item.desc}</Text>
                    </View>
                    <View style={styles.sparkPill}>
                        <Text style={[styles.sparkPillText, { color: c.primary }]}>+{item.sparks}</Text>
                    </View>
                </Animated.View>
            ))}
        </View>
    );

    const renderBenefits = () => (
        <View style={styles.listContainer}>
            <View style={[styles.infoCard, { backgroundColor: c.primary + '10', borderColor: c.primary + '30', marginBottom: 12 }]}>
                <Ionicons name="information-circle" size={24} color={c.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.infoTitle, { color: c.text }]}>Critical Requirement</Text>
                    <Text style={[styles.infoDesc, { color: c.subtext }]}>
                        Maintaining a positive Spark balance is essential. If your balance hits zero, AI Job Matching (Email/WhatsApp) and premium AI services like CV Optimization will be temporarily disabled.
                    </Text>
                </View>
            </View>
            {[
                { title: 'Job Matching (Email/WA)', desc: 'Get instant job matches sent directly to your inbox and WhatsApp.', cost: '1 Spark/match', icon: 'notifications-active' },
                { title: 'CV Optimization', desc: 'Let our AI tailor your profile and CV for specific job descriptions.', cost: '50 Sparks', icon: 'description' },
                { title: 'Boost Proposal', desc: 'Increase your chances by pinning your proposal to the top.', cost: '20 Sparks', icon: 'trending-up' },
                { title: 'Connecta AI Plus', desc: 'Unlock advanced AI insights for better job matching.', cost: '50 Sparks/day', icon: 'auto-awesome' },
                { title: 'Verification Badge', desc: 'Temporary verified status to win higher-paying jobs.', cost: '200 Sparks', icon: 'verified' },
            ].map((item, index) => (
                <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 50)}
                    style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                    <View style={[styles.infoIcon, { backgroundColor: '#8B5CF615' }]}>
                        <MaterialIcons name={item.icon as any} size={24} color="#8B5CF6" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoTitle, { color: c.text }]}>{item.title}</Text>
                        <Text style={[styles.infoDesc, { color: c.subtext }]}>{item.desc}</Text>
                        <Text style={[styles.costText, { color: '#8B5CF6' }]}>Cost: {item.cost}</Text>
                    </View>
                </Animated.View>
            ))}
        </View>
    );

    const renderReferral = () => (
        <View style={styles.listContainer}>
            <Animated.View entering={FadeInDown} style={[styles.referralCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3820/3820177.png' }}
                    style={styles.referralImage}
                />
                <Text style={[styles.referralTitle, { color: c.text }]}>Invite Friends, Get Sparks!</Text>
                <Text style={[styles.referralDesc, { color: c.subtext }]}>
                    Share your unique referral code with friends. When they sign up using your code, both of you will receive bonus Sparks!
                </Text>

                <View style={[styles.codeBox, { backgroundColor: c.background, borderColor: c.border }]}>
                    <Text style={[styles.codeText, { color: c.text }]}>{user?.referralCode || '-------'}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (user?.referralCode) {
                                require('react-native').Clipboard.setString(user.referralCode);
                                showAlert?.({ title: 'Copied!', message: 'Referral code copied to clipboard', type: 'success' });
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        }}
                        style={[styles.copyBtn, { backgroundColor: c.primary }]}
                    >
                        <MaterialIcons name="content-copy" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.referralStats}>
                    <View style={styles.refStatItem}>
                        <Text style={[styles.refStatVal, { color: c.text }]}>50</Text>
                        <Text style={[styles.refStatLabel, { color: c.subtext }]}>Per Friend</Text>
                    </View>
                    <View style={styles.refStatDivider} />
                    <View style={styles.refStatItem}>
                        <Text style={[styles.refStatVal, { color: c.text }]}>{stats?.totalReferrals || 0}</Text>
                        <Text style={[styles.refStatLabel, { color: c.subtext }]}>Friends Invited</Text>
                    </View>
                </View>
            </Animated.View>

            <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: c.primary }]}
                onPress={() => {
                    const message = `Join me on Connecta and get free sparks to boost your career! Use my code: ${user?.referralCode}\nDownload here: https://myconnecta.ng/app`;
                    require('react-native').Share.share({ message });
                }}
            >
                <MaterialIcons name="share" size={20} color="#FFF" />
                <Text style={styles.shareBtnText}>Share Invitation</Text>
            </TouchableOpacity>
        </View>
    );

    const { showAlert } = require('../components/InAppAlert').useInAppAlert();

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Spark Wallet</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[c.primary]} />
                    }
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Spark Card */}
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.sparkCard}>
                        <LinearGradient
                            colors={['#FF7F50', '#FD6730']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sparkGradient}
                        >
                            <View style={styles.sparkTop}>
                                <Text style={styles.sparkLabel}>TOTAL SPARKS</Text>
                                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFF" />
                            </View>
                            <Animated.Text style={[styles.sparkCount, sparkAnimStyle]}>
                                {stats?.currentBalance || user?.sparks || 0}
                            </Animated.Text>
                            <View style={styles.tierContainer}>
                                <Text style={styles.tierText}>{user?.userType === 'freelancer' ? 'Free-tier Spark' : 'Client Spark'}</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '40%' }]} />
                                </View>
                                <Text style={styles.tierGoal}>Daily Flame Active</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: c.text }]}>{stats?.streakDays || 0}</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Streak</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: '#10B981' }]}>+{stats?.totalEarned || 0}</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Earned</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: '#EF4444' }]}>-{stats?.totalSpent || 0}</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Spent</Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {[
                            { id: 'history', label: 'History' },
                            { id: 'earn', label: 'Earn' },
                            { id: 'referral', label: 'Refer' },
                            { id: 'benefits', label: 'Benefits' },
                        ].map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.tabBtn,
                                    activeTab === tab.id && { backgroundColor: c.primary }
                                ]}
                                onPress={() => setActiveTab(tab.id as any)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: activeTab === tab.id ? '#FFF' : c.subtext }
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Content Section */}
                    {activeTab === 'history' && renderHistory()}
                    {activeTab === 'earn' && renderHowToEarn()}
                    {activeTab === 'referral' && renderReferral()}
                    {activeTab === 'benefits' && renderBenefits()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    scrollContent: { padding: 24, paddingBottom: 100 },
    sparkCard: {
        height: 200,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    sparkGradient: { flex: 1, padding: 24, justifyContent: 'space-between' },
    sparkTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sparkLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
    sparkCount: { color: '#FFF', fontSize: 56, fontWeight: '900', letterSpacing: -2 },
    tierContainer: { gap: 6 },
    tierText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, width: '100%', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },
    tierGoal: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statItem: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 5,
        borderRadius: 15,
        marginBottom: 24
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center'
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700'
    },
    listContainer: { gap: 12 },
    historyItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center'
    },
    historyIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    historyContent: { flex: 1, marginLeft: 16, gap: 2 },
    historyTitle: { fontSize: 15, fontWeight: '700' },
    historyDate: { fontSize: 12, opacity: 0.7 },
    historyAmount: { fontSize: 16, fontWeight: '800' },
    emptyState: { padding: 40, alignItems: 'center', gap: 12 },
    emptyText: { fontSize: 14, fontWeight: '600' },
    infoCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    infoIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    infoContent: { flex: 1, marginLeft: 16, gap: 4 },
    infoTitle: { fontSize: 16, fontWeight: '700' },
    infoDesc: { fontSize: 13, lineHeight: 18, opacity: 0.8 },
    sparkPill: {
        backgroundColor: 'rgba(253, 103, 48, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    sparkPillText: { fontSize: 12, fontWeight: '800' },
    costText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
    referralCard: { padding: 24, borderRadius: 28, borderWidth: 1, alignItems: 'center' },
    referralImage: { width: 100, height: 100, marginBottom: 16 },
    referralTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    referralDesc: { fontSize: 14, textAlign: 'center', opacity: 0.7, lineHeight: 20, marginBottom: 24 },
    codeBox: { flexDirection: 'row', width: '100%', height: 60, borderRadius: 16, borderWidth: 1, alignItems: 'center', paddingLeft: 20, marginBottom: 24 },
    codeText: { flex: 1, fontSize: 18, fontWeight: '900', letterSpacing: 4 },
    copyBtn: { width: 60, height: 60, borderTopRightRadius: 16, borderBottomRightRadius: 16, justifyContent: 'center', alignItems: 'center' },
    referralStats: { flexDirection: 'row', width: '100%', paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.1)' },
    refStatItem: { flex: 1, alignItems: 'center' },
    refStatVal: { fontSize: 18, fontWeight: '800' },
    refStatLabel: { fontSize: 12, opacity: 0.6 },
    refStatDivider: { width: 1, height: '60%', backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center' },
    shareBtn: { flexDirection: 'row', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 },
    shareBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

export default SparkHistoryScreen;
