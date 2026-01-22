import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

// Components
import LandingHero from '../components/landing/LandingHero';
import LandingStats from '../components/landing/LandingStats';
import LandingFeatures from '../components/landing/LandingFeatures';

const { width } = Dimensions.get('window');

const MobileLandingScreen = () => {
    const navigation = useNavigation<any>();
    const c = useThemeColors();
    const { isAuthenticated } = useAuth();
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Freelancers
            const usersRes = await fetch('https://api.myconnecta.ng/api/users?userType=freelancer&limit=5');
            const usersData = await usersRes.json();
            if (usersData.success) setFreelancers(usersData.data);

            // Fetch Jobs
            const jobsRes = await fetch('https://api.myconnecta.ng/api/jobs?limit=5&sort=posted&status=active');
            const jobsData = await jobsRes.json();
            if (jobsData.success) setJobs(jobsData.data);

        } catch (error) {
            console.error('Error fetching landing data:', error);
        }
    };

    const handleLogin = () => navigation.navigate('Auth', { screen: 'Login' });
    const handleJoin = () => navigation.navigate('Auth', { screen: 'Signup' });
    const handleSearch = () => navigation.navigate('PublicSearch');

    const openSupport = (type: 'whatsapp' | 'phone' | 'email') => {
        if (type === 'whatsapp') Linking.openURL('https://wa.me/2341234567890');
        if (type === 'phone') Linking.openURL('tel:+2341234567890');
        if (type === 'email') Linking.openURL('mailto:support@myconnecta.ng');
    };

    return (
        <View style={[styles.container, { backgroundColor: '#FFF' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* 1. HERO SECTION (Web Clone) */}
                <LandingHero />

                {/* 2. STATS & CATEGORIES (Web Clone) */}
                <LandingStats />

                {/* 3. FREELANCER SPOTLIGHT (Mobile Specific - High Value) */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Talent</Text>
                        <TouchableOpacity onPress={handleJoin}>
                            <Text style={styles.seeAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
                        {freelancers.map((user, i) => (
                            <TouchableOpacity key={user._id || i} style={styles.freelancerCard} activeOpacity={0.9} onPress={handleJoin}>
                                <Image
                                    source={{ uri: user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random` }}
                                    style={styles.avatar}
                                />
                                {user.isVerified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#FD6730" />
                                    </View>
                                )}
                                <Text style={styles.userName} numberOfLines={1}>{user.firstName} {user.lastName}</Text>
                                <Text style={styles.userRole} numberOfLines={1}>{user.profession || 'Freelancer'}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={12} color="#FFD166" />
                                    <Text style={styles.ratingText}>4.9</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. FEATURES (Web Clone) */}
                <LandingFeatures />

                {/* 5. CONNECTA AI BANNER */}
                <TouchableOpacity style={styles.aiBanner} activeOpacity={0.9} onPress={handleJoin}>
                    <LinearGradient
                        colors={['#1A202C', '#2D3748']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiGradient}
                    >
                        <View>
                            <View style={styles.aiBadge}>
                                <Text style={styles.aiBadgeText}>NEW</Text>
                            </View>
                            <Text style={styles.aiTitle}>Connecta AI</Text>
                            <Text style={styles.aiSubtitle}>Let AI find your perfect match in seconds.</Text>
                        </View>
                        <View style={styles.aiIconBox}>
                            <Feather name="cpu" size={32} color="#FD6730" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* 6. JOBS IN DEMAND */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Jobs In Demand</Text>
                    </View>
                    <View style={styles.jobsList}>
                        {jobs.map((job, i) => (
                            <TouchableOpacity key={job._id || i} style={styles.leaderboardCard} activeOpacity={0.9} onPress={handleJoin}>
                                <View style={styles.rankBadge}>
                                    <Text style={styles.rankText}>#{i + 1}</Text>
                                </View>
                                <View style={styles.leaderboardContent}>
                                    <View style={styles.jobHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                                            <Text style={styles.companyName}>{job.company || 'Confidential'}</Text>
                                        </View>
                                        <Text style={styles.jobBudget}>
                                            {job.budget ? `₦${job.budget.toLocaleString()}` : 'Negotiable'}
                                        </Text>
                                    </View>
                                    <View style={styles.tagsRow}>
                                        {job.skills?.slice(0, 3).map((skill: string, idx: number) => (
                                            <View key={idx} style={styles.tag}>
                                                <Text style={styles.tagText}>{skill}</Text>
                                            </View>
                                        ))}
                                        <Text style={styles.postedTime}>🔥 Hot</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 7. HOW IT WORKS */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>How It Works</Text>
                    </View>
                    <View style={styles.stepsRow}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIcon, { backgroundColor: '#FFF5F0' }]}>
                                <Feather name="file-text" size={24} color="#FD6730" />
                            </View>
                            <Text style={styles.stepLabel}>1. Post</Text>
                        </View>
                        <View style={styles.stepLine} />
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIcon, { backgroundColor: '#F0FFF4' }]}>
                                <Feather name="check-circle" size={24} color="#38A169" />
                            </View>
                            <Text style={styles.stepLabel}>2. Match</Text>
                        </View>
                        <View style={styles.stepLine} />
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIcon, { backgroundColor: '#E6F4FF' }]}>
                                <Feather name="credit-card" size={24} color="#0091FF" />
                            </View>
                            <Text style={styles.stepLabel}>3. Pay</Text>
                        </View>
                    </View>
                </View>

                {/* 8. SUPPORT */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle} style={{ textAlign: 'center', width: '100%', marginBottom: 10, color: '#A0AEC0', fontSize: 14 }}>Need Support?</Text>
                    </View>
                    <View style={styles.supportGrid}>
                        <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#25D366' }]} onPress={() => openSupport('whatsapp')}>
                            <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#3182CE' }]} onPress={() => openSupport('phone')}>
                            <Feather name="phone" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#E53E3E' }]} onPress={() => openSupport('email')}>
                            <Feather name="mail" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Sticky Bottom CTA */}
            {isAuthenticated ? (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.dashboardBtn} onPress={() => navigation.navigate(c.role === 'freelancer' ? 'FreelancerMain' : 'ClientMain')}>
                        <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
                        <Feather name="arrow-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[styles.bottomBar, { flexDirection: 'row', gap: 12 }]}>
                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <Text style={styles.loginText}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
                        <Text style={styles.joinText}>Join Now</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionContainer: { marginTop: 32, paddingHorizontal: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
    seeAllText: { fontSize: 14, color: '#FD6730', fontWeight: '600' },

    // Freelancer Card
    cardScroll: { paddingRight: 24, gap: 16 },
    freelancerCard: { width: 140, padding: 12, backgroundColor: '#FFF', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
    verifiedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFF', borderRadius: 10 },
    userName: { fontSize: 14, fontWeight: '700', color: '#2D3748', textAlign: 'center' },
    userRole: { fontSize: 12, color: '#718096', marginBottom: 6, textAlign: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFAF0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#B7791F' },

    // Jobs Leaderboard
    jobsList: { gap: 12 },
    leaderboardCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    rankBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F7FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rankText: { fontSize: 14, fontWeight: '800', color: '#CBD5E0' },
    leaderboardContent: { flex: 1 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginRight: 8 },
    companyName: { fontSize: 12, color: '#718096' },
    jobBudget: { fontSize: 14, fontWeight: '700', color: '#2B6CB0' },
    tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    tag: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    tagText: { fontSize: 10, color: '#4A5568', fontWeight: '600' },
    postedTime: { fontSize: 10, color: '#FD6730', fontWeight: '700', marginLeft: 'auto' },

    // AI Banner
    aiBanner: { marginHorizontal: 24, marginTop: 40, borderRadius: 24, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    aiGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24 },
    aiBadge: { backgroundColor: '#FD6730', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
    aiBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    aiTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
    aiSubtitle: { fontSize: 13, color: '#CBD5E0', maxWidth: 200 },
    aiIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

    // Steps
    stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, gap: 8 },
    stepItem: { alignItems: 'center', gap: 8 },
    stepIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#EDF2F7', marginTop: -20 },

    // Support
    supportGrid: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 40 },
    supportCard: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },

    // Bottom Bar
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 32, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    loginBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7', backgroundColor: '#F7FAFC' },
    loginText: { fontSize: 16, fontWeight: '700', color: '#4A5568' },
    joinBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FD6730', shadowColor: '#FD6730', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
    joinText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    dashboardBtn: { height: 50, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FD6730', gap: 10 },
    dashboardBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});

export default MobileLandingScreen;
