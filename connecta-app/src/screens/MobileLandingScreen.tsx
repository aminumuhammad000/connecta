import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';

// Components
import LandingHero from '../components/landing/LandingHero';
import LandingStats from '../components/landing/LandingStats';
import LandingFeatures from '../components/landing/LandingFeatures';

const { width: windowWidth } = Dimensions.get('window'); // Fallback

import { useWindowDimensions } from 'react-native';

const MobileLandingScreen = () => {
    console.log('MobileLandingScreen V2 Loaded');
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const navigation = useNavigation<any>();
    const c = useThemeColors();
    const { isAuthenticated, user } = useAuth();
    const insets = useSafeAreaInsets();
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Freelancers
            const usersRes = await fetch(`${API_BASE_URL}/api/users?userType=freelancer&limit=5`);
            const usersData = await usersRes.json();
            if (usersData.success) setFreelancers(usersData.data);

            // Fetch Jobs
            const jobsRes = await fetch(`${API_BASE_URL}/api/jobs?limit=5&sort=posted&status=active`);
            const jobsData = await jobsRes.json();
            if (jobsData.success) setJobs(jobsData.data);

        } catch (error) {
            console.error('Error fetching landing data:', error);
        }
    };

    const handleLogin = () => navigation.navigate('Auth', { screen: 'Login' });
    const handleJoin = () => navigation.navigate('Auth', { screen: 'RoleSelection' });

    // Navigation Handlers
    const handleFreelancerPress = (id: string) => {
        if (isAuthenticated) {
            // Navigate to authenticated profile screen
            navigation.navigate('FreelancerProfile', { userId: id });
        } else {
            navigation.navigate('PublicFreelancerProfile', { id });
        }
    };

    const handleJobPress = (id: string) => {
        if (isAuthenticated) {
            // Navigate to authenticated job detail screen
            navigation.navigate('JobDetail', { jobId: id });
        } else {
            navigation.navigate('PublicJobDetail', { id });
        }
    };

    const handleViewAllFreelancers = () => {
        navigation.navigate('PublicFreelancerSearch');
    };

    const handleViewAllJobs = () => {
        navigation.navigate('PublicSearch');
    };

    const openSupport = (type: 'whatsapp' | 'phone' | 'email') => {
        if (type === 'whatsapp') Linking.openURL('whatsapp://send?phone=2348128655555');
        if (type === 'phone') Linking.openURL('tel:08128655555');
        if (type === 'email') Linking.openURL('mailto:support@myconnecta.ng');
    };

    return (
        <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Top Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} />

                {isAuthenticated ? (
                    <TouchableOpacity
                        style={styles.headerBtnPrimary}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(user?.userType === 'freelancer' ? 'FreelancerMain' : 'ClientMain')}
                    >
                        <Text style={styles.headerBtnTextPrimary}>Dashboard</Text>
                        <Feather name="arrow-right" size={16} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={handleLogin} style={styles.headerBtnSecondary} activeOpacity={0.7}>
                            <Text style={styles.headerBtnTextSecondary}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleJoin} style={styles.headerBtnPrimary} activeOpacity={0.8}>
                            <Text style={styles.headerBtnTextPrimary}>Join</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>

                    {/* 1. HERO SECTION */}
                    <LandingHero isDesktop={isDesktop} />

                    {/* 2. STATS & CATEGORIES */}
                    <LandingStats isDesktop={isDesktop} />

                    {/* 3. FREELANCER SPOTLIGHT */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Talent</Text>
                            <TouchableOpacity onPress={handleViewAllFreelancers} activeOpacity={0.6}>
                                <Text style={styles.seeAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} contentContainerStyle={isDesktop ? styles.desktopGrid : styles.cardScroll}>
                            {freelancers.map((user, i) => (
                                <TouchableOpacity
                                    key={user._id || i}
                                    style={[styles.freelancerCard, isDesktop && styles.desktopCard]}
                                    activeOpacity={0.9}
                                    onPress={() => handleFreelancerPress(user._id)}
                                >
                                    <View style={styles.cardHeaderBg} />
                                    <Image
                                        source={{ uri: user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random` }}
                                        style={styles.avatar}
                                    />
                                    {user.isVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#FD6730" />
                                        </View>
                                    )}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.userName} numberOfLines={1}>{user.firstName} {user.lastName}</Text>
                                        <Text style={styles.userRole} numberOfLines={1}>{user.profession || 'Freelancer'}</Text>
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={14} color="#FFD166" />
                                            <Text style={styles.ratingText}>{user.rating || '5.0'}</Text>
                                            <Text style={styles.reviewCount}>({user.reviewCount || 0})</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 4. FEATURES */}
                    <LandingFeatures isDesktop={isDesktop} />

                    {/* 5. CONNECTA AI BANNER (Non-clickable) */}
                    <View style={styles.aiBanner}>
                        <LinearGradient
                            colors={['#1A202C', '#2D3748']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aiGradient}
                        >
                            <View style={{ flex: 1 }}>
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
                    </View>

                    {/* 6. JOBS IN DEMAND */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Jobs In Demand</Text>
                            <TouchableOpacity onPress={handleViewAllJobs} activeOpacity={0.6}>
                                <Text style={styles.seeAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.jobsList, isDesktop && styles.desktopJobsGrid]}>
                            {jobs.map((job, i) => (
                                <TouchableOpacity
                                    key={job._id || i}
                                    style={[styles.jobCard, isDesktop && styles.desktopJobCard]}
                                    activeOpacity={0.9}
                                    onPress={() => handleJobPress(job._id)}
                                >
                                    <View style={styles.jobCardTop}>
                                        <View style={styles.jobIcon}>
                                            <Feather name="briefcase" size={20} color="#FD6730" />
                                        </View>
                                        <View style={styles.jobBudgetBadge}>
                                            <Text style={styles.jobBudgetText}>
                                                {job.budget ? `₦${job.budget.toLocaleString()}` : 'Negotiable'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                                    <Text style={styles.companyName}>{job.company || 'Confidential'}</Text>

                                    <View style={styles.jobFooter}>
                                        <View style={styles.tagsRow}>
                                            {job.skills?.slice(0, 2).map((skill: string, idx: number) => (
                                                <View key={idx} style={styles.tag}>
                                                    <Text style={styles.tagText}>{skill}</Text>
                                                </View>
                                            ))}
                                            {job.skills?.length > 2 && (
                                                <Text style={styles.moreTags}>+{job.skills.length - 2}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.postedTime}>Just now</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>



                    {/* 8. SUPPORT */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { textAlign: 'center', width: '100%', marginBottom: 10, color: '#A0AEC0', fontSize: 14 }]}>Need Support?</Text>
                        </View>
                        <View style={styles.supportGrid}>
                            <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#25D366' }]} onPress={() => openSupport('whatsapp')} activeOpacity={0.8}>
                                <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#3182CE' }]} onPress={() => openSupport('phone')} activeOpacity={0.8}>
                                <Feather name="phone" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#E53E3E' }]} onPress={() => openSupport('email')} activeOpacity={0.8}>
                                <Feather name="mail" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        elevation: 2,
        ...Platform.select({
            web: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
            }
        }),
        zIndex: 100,
    },
    headerBtnPrimary: {
        backgroundColor: '#FD6730',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        ...Platform.select({
            web: { boxShadow: '0 4px 8px rgba(253, 103, 48, 0.2)' },
            default: {
                shadowColor: '#FD6730',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            }
        }),
        elevation: 3,
    },
    headerBtnSecondary: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFF',
    },
    headerBtnTextPrimary: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    headerBtnTextSecondary: {
        color: '#4A5568',
        fontWeight: '700',
        fontSize: 14,
    },
    sectionContainer: { marginTop: 32, paddingHorizontal: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
    seeAllText: { fontSize: 14, color: '#FD6730', fontWeight: '700' },

    // Freelancer Card
    cardScroll: { paddingRight: 24, gap: 16 },
    freelancerCard: {
        width: 160,
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            web: { boxShadow: '0 8px 12px rgba(100, 116, 139, 0.05)' },
            default: {
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
            }
        }),
        elevation: 4,
        marginBottom: 8, // For shadow
    },
    cardHeaderBg: { height: 48, backgroundColor: '#FFF5F0', position: 'absolute', top: 0, left: 0, right: 0 },
    avatar: { width: 72, height: 72, borderRadius: 36, marginTop: 12, alignSelf: 'center', borderWidth: 4, borderColor: '#FFF' },
    verifiedBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FFF', borderRadius: 12, padding: 2 },
    cardContent: { padding: 12, alignItems: 'center' },
    userName: { fontSize: 15, fontWeight: '700', color: '#2D3748', textAlign: 'center', marginBottom: 2 },
    userRole: { fontSize: 12, color: '#718096', marginBottom: 8, textAlign: 'center', fontWeight: '500' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F7FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
    reviewCount: { fontSize: 12, color: '#A0AEC0' },

    // Jobs Card
    jobsList: { gap: 16 },
    jobCard: {
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            web: { boxShadow: '0 4px 12px rgba(100, 116, 139, 0.04)' },
            default: {
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
            }
        }),
        elevation: 2
    },
    jobCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    jobIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF5F0', alignItems: 'center', justifyContent: 'center' },
    jobBudgetBadge: { backgroundColor: '#F0FFF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    jobBudgetText: { fontSize: 13, fontWeight: '700', color: '#2F855A' },
    jobTitle: { fontSize: 17, fontWeight: '700', color: '#2D3748', marginBottom: 4, lineHeight: 24 },
    companyName: { fontSize: 13, color: '#718096', fontWeight: '500', marginBottom: 16 },
    jobFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tag: { backgroundColor: '#F7FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EDF2F7' },
    tagText: { fontSize: 11, color: '#4A5568', fontWeight: '600' },
    moreTags: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
    postedTime: { fontSize: 12, color: '#A0AEC0', fontWeight: '500' },

    // AI Banner
    aiBanner: {
        marginHorizontal: 24,
        marginTop: 40,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        ...Platform.select({
            web: { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            }
        })
    },
    aiGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 28 },
    aiBadge: { backgroundColor: '#FD6730', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
    aiBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
    aiTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
    aiSubtitle: { fontSize: 14, color: '#CBD5E0', maxWidth: 220, lineHeight: 20 },
    aiIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },




    // Support
    supportGrid: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 60 },
    supportCard: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        }),
        elevation: 3
    },

    // Desktop Responsive Styles
    mainContainer: {
        width: '100%',
    },
    desktopContainer: {
        maxWidth: 1440,
        alignSelf: 'center',
        paddingHorizontal: 0,
    },
    desktopGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'space-between',
    },
    desktopCard: {
        width: '23%',
    },
    desktopJobsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'space-between',
    },
    desktopJobCard: {
        width: '48%',
    },
});

export default MobileLandingScreen;
