import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import Animated, {
    FadeInDown,
    FadeInRight,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as rewardService from '../services/rewardService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const RewardsScreen: React.FC = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [actions, setActions] = useState<rewardService.RewardAction[]>([]);
    const [localSparks, setLocalSparks] = useState(user?.sparks || 0);

    // Animation for the Spark Counter
    const sparkScale = useSharedValue(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [actionsData, balance] = await Promise.all([
            rewardService.getRewardActions(),
            rewardService.getRewardBalance()
        ]);
        setActions(actionsData);
        setLocalSparks(balance);

        if (user && balance !== user.sparks) {
            updateUser({ ...user, sparks: balance });
        }
    };

    const handleClaim = async (action: rewardService.RewardAction) => {
        if (action.completed) return;

        try {
            // Visual feedback
            sparkScale.value = withSequence(withTiming(1.2, { duration: 100 }), withSpring(1));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Real API call
            const newTotal = await rewardService.claimReward(action.id);
            setLocalSparks(newTotal);

            // Update UI list (mock completion for now as backend doesn't return updated list)
            setActions(prev => prev.map(a => a.id === action.id ? { ...a, completed: true } : a));

            // Sync with auth context
            if (user) {
                updateUser({ ...user, sparks: newTotal });
            }
        } catch (error) {
            console.error('Claim failed:', error);
            // Error handling UI could go here
        }
    };

    const sparkAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sparkScale.value }]
    }));

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />

            <LinearGradient
                colors={[c.primary + '15', 'transparent']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Professional Growth</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Spark Card */}
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.sparkCard}>
                        <LinearGradient
                            colors={[c.primary, '#FF8C00']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sparkGradient}
                        >
                            <View style={styles.sparkTop}>
                                <Text style={styles.sparkLabel}>TOTAL SPARKS</Text>
                                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFF" />
                            </View>
                            <Animated.Text style={[styles.sparkCount, sparkAnimStyle]}>
                                {localSparks}
                            </Animated.Text>
                            <View style={styles.tierContainer}>
                                <Text style={styles.tierText}>Pro Tier</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '65%' }]} />
                                </View>
                                <Text style={styles.tierGoal}>50 to Expert</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: c.text }]}>12</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Streaks</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: c.text }]}>85%</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Trust Score</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: c.card }]}>
                            <Text style={[styles.statVal, { color: c.text }]}>4</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Badges</Text>
                        </View>
                    </View>

                    {/* Quests Section */}
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Active Quests</Text>

                    <View style={styles.questGrid}>
                        {actions.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInRight.delay(400 + index * 100).springify()}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleClaim(item)}
                                    style={[
                                        styles.questCard,
                                        { backgroundColor: c.card, borderColor: item.completed ? c.primary + '40' : c.border }
                                    ]}
                                >
                                    <View style={[styles.questIconBox, { backgroundColor: c.background }]}>
                                        <MaterialIcons name={item.icon as any} size={28} color={item.completed ? c.primary : c.subtext} />
                                    </View>
                                    <View style={styles.questContent}>
                                        <Text style={[styles.questTitle, { color: c.text }]}>{item.title}</Text>
                                        <Text style={[styles.questDesc, { color: c.subtext }]}>{item.description}</Text>

                                        <View style={styles.questFooter}>
                                            <View style={styles.sparkPill}>
                                                <MaterialCommunityIcons name="lightning-bolt" size={12} color={c.primary} />
                                                <Text style={[styles.sparkAmount, { color: c.primary }]}>+{item.sparks}</Text>
                                            </View>
                                            {item.completed && (
                                                <View style={styles.completedBadge}>
                                                    <Ionicons name="checkmark-circle" size={16} color={c.primary} />
                                                    <Text style={[styles.completedText, { color: c.primary }]}>Earned</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
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
        height: 220,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 10,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    sparkGradient: { flex: 1, padding: 28, justifyContent: 'space-between' },
    sparkTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sparkLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
    sparkCount: { color: '#FFF', fontSize: 64, fontWeight: '900', letterSpacing: -2 },
    tierContainer: { gap: 8 },
    tierText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, width: '100%', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
    tierGoal: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statItem: { flex: 1, padding: 16, borderRadius: 24, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, marginLeft: 4 },
    questGrid: { gap: 16 },
    questCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    questIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    questContent: { flex: 1, marginLeft: 16, gap: 4 },
    questTitle: { fontSize: 16, fontWeight: '700' },
    questDesc: { fontSize: 13, lineHeight: 18, opacity: 0.8 },
    questFooter: { flexDirection: 'row', marginTop: 8, gap: 12, alignItems: 'center' },
    sparkPill: {
        flexDirection: 'row',
        backgroundColor: 'rgba(253, 103, 48, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignItems: 'center',
        gap: 4
    },
    sparkAmount: { fontSize: 12, fontWeight: '800' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    completedText: { fontSize: 12, fontWeight: '700' }
});

export default RewardsScreen;
