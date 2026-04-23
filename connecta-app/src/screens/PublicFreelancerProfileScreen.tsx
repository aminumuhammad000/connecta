import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, FlatList, Share, TextInput, useWindowDimensions, Animated, Platform, Dimensions, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import profileService from '../services/profileService';
import * as jobService from '../services/jobService';
import * as reviewService from '../services/reviewService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Job } from '../types';
import { useInAppAlert } from '../components/InAppAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PublicFreelancerProfileScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { showAlert } = useInAppAlert();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id, jobId } = route.params || {};
    const { user, isAuthenticated } = useAuth();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [activeTab, setActiveTab] = useState<'experience' | 'portfolio' | 'reviews'>('experience');
    const [imageViewerVisible, setImageViewerVisible] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewStats, setReviewStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    // Invite Logic
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any>(null);
    const [inviteStep, setInviteStep] = useState(1);
    const [inviteContexts, setInviteContexts] = useState<any[]>([]);
    const [selectedContext, setSelectedContext] = useState<any | null>(null);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isInviting, setIsInviting] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false);

    useEffect(() => {
        if (id) {
            loadProfile();
        }
    }, [id]);

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, [profile]);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const [profileData, reviewsData, statsData] = await Promise.all([
                profileService.getProfileByUserId(id),
                reviewService.getUserReviews(id),
                reviewService.getUserReviewStats(id)
            ]);
            setProfile(profileData);
            const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || []);
            setReviews(reviewsList);
            // Note: getUserReviewStats already unwraps response.data in the service layer
            setReviewStats(statsData || null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error loading profile:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleHire = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'RoleSelection' });
        } else if (jobId) {
            // Direct invite if jobId is present
            try {
                setIsInviting(true);
                await (jobService as any).inviteFreelancer(jobId, id);
                Alert.alert('Success! 🕊️', `Your invitation has been sent to ${profile.firstName}.`);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
                console.error('Error sending invite:', error);
                Alert.alert('Error', error.message || 'Failed to send invitation.');
            } finally {
                setIsInviting(false);
            }
        } else {
            openInviteModal();
        }
    };

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!profile) return;
        try {
            await Share.share({
                message: `Check out ${profile.firstName}'s profile on Connecta!`,
                title: `${profile.firstName}'s Profile`
            });
        } catch (error) {
            console.error('Error sharing profile:', error);
        }
    };

    const openInviteModal = async () => {
        setInviteModalVisible(true);
        setLoadingJobs(true);
        setInviteStep(1);
        setSelectedContext(null);
        setSelectedJob(null);

        try {
            const jobs = await jobService.getMyJobs();

            const formattedJobs = (jobs || []).map((j: any) => ({
                _id: j._id,
                title: j.title,
                budget: j.budget?.min || j.salary?.min || 0,
                type: 'job',
                subtitle: 'Individual Job'
            }));

            setInviteContexts(formattedJobs);
        } catch (error) {
            console.error("Failed to load jobs", error);
            Alert.alert("Error", "Failed to load your jobs.");
        } finally {
            setLoadingJobs(false);
        }
    };

    // Success handling

    const handleSendInvite = async () => {
        if (!selectedJob) {
            showAlert({ title: "Select a Job", message: "Please select a job to invite the freelancer to.", type: 'warning' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }

        try {
            setIsInviting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            await (jobService as any).inviteFreelancer(selectedJob._id, id);
            
            Alert.alert(
                'Success! 🕊️',
                `Your invitation for "${selectedJob.title}" has been sent to ${profile.firstName}.`
            );

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setInviteModalVisible(false);
            setSelectedJob(null);
            setIsInviting(false);
        } catch (error: any) {
            console.error('Error sending invite:', error);
            if (error?.status === 403) {
                Alert.alert(
                    'Job Not Approved',
                    error.message || 'You cannot invite freelancers until your job has been approved by admin.'
                );
                setInviteModalVisible(false);
            } else {
                showAlert({ title: 'Error', message: error.message || 'Failed to send invitation. Please try again.', type: 'error' });
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsInviting(false);
        }
    };

    // Review Logic
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleAddReview = async () => {
        if (!comment.trim()) {
            showAlert({ title: 'Error', message: 'Please enter a comment', type: 'error' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        try {
            setIsSubmittingReview(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await reviewService.createReview({
                revieweeId: id,
                reviewerType: user?.userType === 'client' ? 'client' : 'freelancer',
                rating,
                comment,
            });
            Alert.alert(
                'Review Posted!',
                'Your feedback has been shared with the community. Thank you!'
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setReviewModalVisible(false);
            setComment('');
            setRating(5);
            loadProfile();
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to submit review', type: 'error' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Animated scroll header
    const headerScale = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -20],
        extrapolate: 'clamp',
    });

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={{ color: c.subtext, marginTop: 16, fontSize: 15 }}>Loading profile...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
                <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: c.text }]}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    {/* Empty State Illustration */}
                    <View style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: c.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        borderWidth: 2,
                        borderColor: c.border,
                        borderStyle: 'dashed'
                    }}>
                        <MaterialIcons name="person-off" size={48} color={c.border} />
                    </View>
                    <Text style={{ color: c.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Profile Not Found</Text>
                    <Text style={{ color: c.subtext, fontSize: 15, textAlign: 'center' }}>We couldn't find this freelancer's profile.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={{ flex: 1, maxWidth: 1000, alignSelf: 'center', width: '100%' }}>
                {/* Modern Header */}
                <Animated.View style={[
                    styles.appBar,
                    {
                        borderBottomColor: 'transparent',
                        paddingHorizontal: 16,
                        opacity: fadeAnim
                    }
                ]}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.goBack();
                        }}
                        style={[styles.iconBtn, { backgroundColor: c.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={22} color={c.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                </Animated.View>

                <Animated.ScrollView
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* === HERO: Cover + Card === */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Cover Gradient */}
                        <View style={{ height: 160, width: '100%' }}>
                            <LinearGradient
                                colors={c.isDark ? ['#2D2D2D', '#1A1A1A'] : ['#F0F4FF', '#E9ECEF']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={{ flex: 1 }}
                            />
                        </View>

                        {/* Profile Card */}
                        <View style={{ paddingHorizontal: 16, marginTop: -40 }}>
                            <View style={[styles.profileCard, { backgroundColor: c.card }]}>
                                {/* Avatar — clickable to open full-screen */}
                                <View style={{ marginBottom: 14, marginTop: -46 + 14 }}>
                                    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setImageViewerVisible(true); }}
                                        >
                                            <View style={{ width: 84, height: 84, borderRadius: 42, overflow: 'hidden', borderWidth: 3, borderColor: c.background, backgroundColor: c.primary }}>
                                                <Image
                                                    source={{ uri: profile?.profileImage || profile?.avatar || profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=FD6730&color=fff&size=200` }}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        {profile?.isVerified && (
                                            <View style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: '#1D9BF0', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.background, zIndex: 10 }}>
                                                <MaterialIcons name="verified" size={12} color="#FFF" />
                                            </View>
                                        )}
                                        {profile?.isPremium && (
                                            <LinearGradient colors={['#F59E0B', '#F97316']} style={{ position: 'absolute', top: 0, right: -4, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.background }}>
                                                <MaterialIcons name="star" size={12} color="#FFF" />
                                            </LinearGradient>
                                        )}
                                    </View>
                                </View>

                                {/* Name & Title */}
                                <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>
                                    {profile?.firstName} {profile?.lastName}
                                </Text>
                                <Text style={{ fontSize: 15, color: c.primary, fontWeight: '600', marginTop: 2, marginBottom: 12 }}>
                                    {profile?.jobTitle || profile?.profession || 'Freelancer'}
                                </Text>

                                {/* Badges */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.primary + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                                        <MaterialIcons name="location-on" size={13} color={c.primary} />
                                        <Text style={{ fontSize: 12, color: c.primary, fontWeight: '600' }}>{profile?.location || profile?.country || 'Remote'}</Text>
                                    </View>
                                    {profile?.yearsOfExperience !== undefined && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                                            <Ionicons name="ribbon-outline" size={13} color={c.subtext} />
                                            <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600' }}>{profile.yearsOfExperience}+ yrs exp</Text>
                                        </View>
                                    )}
                                    {(profile?.engagementTypes || []).slice(0, 2).map((type: string, i: number) => {
                                        const engMap: any = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship' };
                                        return (
                                            <View key={i} style={{ backgroundColor: c.primary + '10', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                                                <Text style={{ fontSize: 12, color: c.primary, fontWeight: '700', textTransform: 'uppercase' }}>{engMap[type] || type}</Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                {/* Stats Row */}
                                <View style={{ flexDirection: 'row', backgroundColor: c.background, borderRadius: 12, padding: 14 }}>
                                    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Ionicons name="star" size={14} color="#F59E0B" />
                                            <Text style={{ fontSize: 18, fontWeight: '800', color: reviewStats?.averageRating ? '#B45309' : c.text }}>
                                                {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : '—'}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 11, color: c.subtext }}>Rating</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: c.border }} />
                                    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{reviewStats?.totalReviews ?? reviews.length}</Text>
                                        <Text style={{ fontSize: 11, color: c.subtext }}>Reviews</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: c.border }} />
                                    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{profile?.skills?.length || 0}</Text>
                                        <Text style={{ fontSize: 11, color: c.subtext }}>Skills</Text>
                                    </View>
                                </View>
                                {/* Star bar — only shown when there's a rating */}
                                {reviewStats?.averageRating > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10 }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Ionicons
                                                key={star}
                                                name={star <= Math.round(reviewStats.averageRating) ? 'star' : 'star-outline'}
                                                size={18}
                                                color={star <= Math.round(reviewStats.averageRating) ? '#F59E0B' : c.border}
                                            />
                                        ))}
                                        <Text style={{ fontSize: 12, color: c.subtext, marginLeft: 4 }}>
                                            ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* === ABOUT (modern card with bio + skills inline) === */}
                    <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 20, marginBottom: 8 }}>
                        {profile?.bio ? (
                            <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.border }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: c.primary }} />
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.8 }}>About</Text>
                                </View>
                                <Text style={{ fontSize: 15, lineHeight: 25, color: c.text }}>{profile.bio}</Text>
                            </View>
                        ) : null}

                        {/* Skills inline */}
                        {profile?.skills?.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {profile.skills.map((s: string, index: number) => (
                                        <View key={index} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: c.isDark ? '#2A2A2A' : '#F3F4F6', borderWidth: 1, borderColor: c.primary + '25' }}>
                                            <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>{s}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </Animated.View>

                    {/* === TABS: Experience / Portfolio / Reviews === */}
                    <Animated.View style={{ opacity: fadeAnim, marginTop: 16 }}>
                        {/* Tab Bar — text only, no icons */}
                        <View style={[styles.tabBar, { borderBottomColor: c.border }]}>
                            {(['experience', 'portfolio', 'reviews'] as const).map(tab => {
                                const labels = { experience: 'Experience', portfolio: 'Portfolio', reviews: 'Reviews' };
                                const active = activeTab === tab;
                                return (
                                    <TouchableOpacity
                                        key={tab}
                                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
                                        style={[styles.tabItem, active && { borderBottomColor: c.primary }]}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.tabText, { color: active ? c.primary : c.subtext }]}>{labels[tab]}</Text>
                                        {tab === 'reviews' && reviews.length > 0 && (
                                            <View style={{ backgroundColor: c.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                                                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>{reviews.length}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Tab Content */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>

                            {/* --- EXPERIENCE TAB --- */}
                            {activeTab === 'experience' && (
                                profile?.employment?.length > 0 ? (
                                    <View style={{ gap: 16 }}>
                                        {profile.employment.map((job: any, i: number) => (
                                            <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
                                                <View style={{ alignItems: 'center', width: 18 }}>
                                                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.primary, borderWidth: 2, borderColor: c.background, marginTop: 4 }} />
                                                    {i < profile.employment.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: c.border, marginTop: 4 }} />}
                                                </View>
                                                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, flex: 1 }]}>
                                                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{job.position}</Text>
                                                    <Text style={{ fontSize: 14, color: c.primary, fontWeight: '600', marginTop: 2 }}>{job.company}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start', backgroundColor: c.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                                        <MaterialIcons name="calendar-today" size={12} color={c.subtext} />
                                                        <Text style={{ fontSize: 12, color: c.subtext }}>{formatDate(job.startDate)} – {formatDate(job.endDate)}</Text>
                                                    </View>
                                                    {job.description && <Text style={{ fontSize: 13, color: c.subtext, marginTop: 10, lineHeight: 20 }}>{job.description}</Text>}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <MaterialIcons name="work-off" size={40} color={c.border} />
                                        <Text style={{ color: c.text, fontSize: 15, fontWeight: '600', marginTop: 12 }}>No experience listed</Text>
                                    </View>
                                )
                            )}

                            {/* --- PORTFOLIO TAB --- */}
                            {activeTab === 'portfolio' && (
                                profile?.portfolio?.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 4 }}>
                                        {profile.portfolio.map((item: any, i: number) => (
                                            <TouchableOpacity
                                                key={i}
                                                activeOpacity={0.9}
                                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedPortfolioItem(item); }}
                                                style={{ width: 260, backgroundColor: c.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}
                                            >
                                                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300' }} style={{ width: '100%', height: 150 }} />
                                                <View style={{ padding: 12 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                                                    <Text style={{ color: c.subtext, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{item.description}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <MaterialIcons name="collections" size={40} color={c.border} />
                                        <Text style={{ color: c.text, fontSize: 15, fontWeight: '600', marginTop: 12 }}>No portfolio items</Text>
                                    </View>
                                )
                            )}

                            {/* --- REVIEWS TAB --- */}
                            {activeTab === 'reviews' && (
                                reviews.length > 0 ? (
                                    <View style={{ gap: 14 }}>
                                        {reviewStats?.averageRating > 0 && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBEB', padding: 14, borderRadius: 14, marginBottom: 4 }}>
                                                <Ionicons name="star" size={20} color="#F59E0B" />
                                                <Text style={{ fontSize: 22, fontWeight: '800', color: '#B45309' }}>{reviewStats.averageRating.toFixed(1)}</Text>
                                                <Text style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>avg · {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}</Text>
                                            </View>
                                        )}
                                        {reviews.map((review: any) => (
                                            <View key={review._id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontSize: 15, fontWeight: '700', color: c.primary }}>{(review.reviewerId?.firstName || 'A').charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                                                                {review.reviewerId ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}` : 'Anonymous'}
                                                            </Text>
                                                            <Text style={{ fontSize: 11, color: c.subtext }}>{review.projectId?.title || 'Project Review'}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                                        <Ionicons name="star" size={12} color="#F59E0B" />
                                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#B45309' }}>{review.rating?.toFixed(1)}</Text>
                                                    </View>
                                                </View>
                                                <Text style={{ fontSize: 14, color: c.text, lineHeight: 22, fontStyle: 'italic', marginBottom: 10 }}>"{review.comment}"</Text>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 }}>
                                                    <Text style={{ fontSize: 11, color: c.subtext }}>{new Date(review.createdAt || Date.now()).toLocaleDateString()}</Text>
                                                    {review.projectId?.budget && <Text style={{ fontSize: 11, fontWeight: '600', color: c.primary }}>₦{review.projectId.budget.toLocaleString()}</Text>}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <Ionicons name="chatbubble-outline" size={40} color={c.border} style={{ marginBottom: 8 }} />
                                        <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>No reviews yet</Text>
                                        <Text style={{ color: c.subtext, textAlign: 'center', marginTop: 4, fontSize: 13 }}>Complete projects to earn reviews.</Text>
                                    </View>
                                )
                            )}
                        </View>
                    </Animated.View>


                </Animated.ScrollView>

                {/* Enhanced Floating CTA with Gradient */}
                <Animated.View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: Math.max(16, insets.bottom),
                    backgroundColor: c.background,
                    borderTopWidth: 1,
                    borderTopColor: c.border,
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, -1) }]
                }}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleHire}
                        style={{ width: '100%' }}
                    >
                        <LinearGradient
                            colors={[c.primary, c.primary + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: 54,
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: 10,
                                width: '100%',
                                shadowColor: c.primary,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 10,
                                elevation: 8
                            }}
                        >
                            <MaterialIcons name="work" size={22} color="#FFF" />
                            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 }}>
                                {isAuthenticated ? (jobId ? "Invite to this Job" : "Invite to Job") : "Login to Hire"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Invite Modal - Same as before but with haptic improvements */}
                <Modal
                    visible={inviteModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setInviteModalVisible(false);
                        setInviteStep(1);
                        setSelectedContext(null);
                        setSelectedJob(null);
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                        <Animated.View
                            style={{
                                backgroundColor: c.card,
                                borderTopLeftRadius: 28,
                                borderTopRightRadius: 28,
                                padding: 24,
                                maxHeight: '85%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                elevation: 10
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>
                                    Invite {profile.firstName}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setInviteModalVisible(false);
                                        setSelectedJob(null);
                                    }}
                                    style={{ padding: 4 }}
                                >
                                    <MaterialIcons name="close" size={24} color={c.subtext} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 15, color: c.subtext, marginBottom: 20 }}>
                                Select a job or project role to invite this freelancer to:
                            </Text>

                            {loadingJobs ? (
                                <ActivityIndicator size="large" color={c.primary} style={{ padding: 40 }} />
                            ) : (
                                <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ gap: 12 }}>
                                    {inviteContexts.length > 0 ? (
                                        inviteContexts.map((item: any, index: number) => {
                                            const isSelected = selectedJob?._id === item._id;

                                            return (
                                                <TouchableOpacity
                                                    key={item._id || index}
                                                    onPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        setSelectedJob(item);
                                                    }}
                                                    activeOpacity={0.7}
                                                    style={{
                                                        padding: 16,
                                                        backgroundColor: isSelected ? c.primary + '10' : c.background,
                                                        borderRadius: 16,
                                                        marginBottom: 12,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        borderWidth: 1.5,
                                                        borderColor: isSelected ? c.primary : c.border,
                                                        shadowColor: isSelected ? c.primary : '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: isSelected ? 0.1 : 0.05,
                                                        shadowRadius: 8,
                                                        elevation: 2
                                                    }}
                                                >
                                                    <View style={{
                                                        width: 48, height: 48, borderRadius: 12,
                                                        backgroundColor: isSelected ? c.primary : c.border + '30',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        marginRight: 16
                                                    }}>
                                                        <MaterialIcons
                                                            name="work"
                                                            size={24}
                                                            color={isSelected ? "#FFF" : c.subtext}
                                                        />
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{
                                                            fontSize: 16,
                                                            fontWeight: isSelected ? '700' : '600',
                                                            color: isSelected ? c.primary : c.text,
                                                            marginBottom: 4
                                                        }}>
                                                            {item.title}
                                                        </Text>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Text style={{ fontSize: 13, color: c.subtext }} numberOfLines={1}>
                                                                {item.status || 'Active'} • {item.budget ? `₦${item.budget.toLocaleString()}` : 'Negotiable'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{
                                                        width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                                                        borderColor: isSelected ? c.primary : c.border,
                                                        alignItems: 'center', justifyContent: 'center',
                                                        backgroundColor: isSelected ? c.primary : 'transparent'
                                                    }}>
                                                        {isSelected && <MaterialIcons name="check" size={14} color="#FFF" />}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })
                                    ) : (
                                        <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <MaterialIcons name="work-off" size={48} color={c.border} />
                                            <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 15 }}>No active jobs or projects found.</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            )}

                            <View style={{ marginTop: 24, gap: 12 }}>
                                <TouchableOpacity
                                    onPress={handleSendInvite}
                                    disabled={!selectedJob || isInviting}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={
                                            selectedJob
                                                ? [c.primary, c.primary + 'DD']
                                                : [c.border, c.border]
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            padding: 18,
                                            borderRadius: 16,
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            gap: 8,
                                            opacity: (!selectedJob || isInviting) ? 0.7 : 1
                                        }}
                                    >
                                        {isInviting ? (
                                            <ActivityIndicator color="#FFF" size="small" />
                                        ) : (
                                            <>
                                                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 17 }}>
                                                    Send Invitation
                                                </Text>
                                                <MaterialIcons name="send" size={20} color="#FFF" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Review Modal - Enhanced */}
                <Modal
                    visible={reviewModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setReviewModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
                        <Animated.View style={{
                            backgroundColor: c.card,
                            borderRadius: 24,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.2,
                            shadowRadius: 20,
                            elevation: 10
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Add Review</Text>
                                <TouchableOpacity onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setReviewModalVisible(false);
                                }}>
                                    <Ionicons name="close" size={24} color={c.subtext} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12, fontWeight: '600' }}>Rating</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setRating(star);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={36}
                                            color={star <= rating ? "#F59E0B" : c.border}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12, fontWeight: '600' }}>Your Comment</Text>
                            <View style={{
                                backgroundColor: c.background,
                                borderRadius: 14,
                                padding: 16,
                                height: 130,
                                borderWidth: 1.5,
                                borderColor: c.border,
                                marginBottom: 24
                            }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlignVertical: 'top',
                                        color: c.text,
                                        fontSize: 16
                                    }}
                                    placeholder="Share your experience working with this freelancer..."
                                    placeholderTextColor={c.subtext}
                                    multiline
                                    value={comment}
                                    onChangeText={setComment}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleAddReview}
                                disabled={isSubmittingReview}
                            >
                                <LinearGradient
                                    colors={[c.primary, c.primary + 'DD']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        paddingVertical: 18,
                                        borderRadius: 14,
                                        alignItems: 'center',
                                        opacity: isSubmittingReview ? 0.7 : 1
                                    }}
                                >
                                    {isSubmittingReview ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 17 }}>Submit Review</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Profile Image Full-Screen Viewer */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 }}
                            onPress={() => setImageViewerVisible(false)}
                        >
                            <MaterialIcons name="close" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: profile?.profileImage || profile?.avatar || profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&background=FD6730&color=fff&size=400` }}
                            style={{ width: '90%', height: '60%', borderRadius: 16 }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 20 }}>{profile?.firstName} {profile?.lastName}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>{profile?.jobTitle || profile?.profession || 'Freelancer'}</Text>
                    </View>
                </Modal>

                {/* Portfolio Viewer Modal */}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={!!selectedPortfolioItem}
                    onRequestClose={() => setSelectedPortfolioItem(null)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' }}>
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}
                            onPress={() => setSelectedPortfolioItem(null)}
                        >
                            <MaterialIcons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>

                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                            <Image
                                source={{ uri: selectedPortfolioItem?.imageUrl || 'https://via.placeholder.com/800x600' }}
                                style={{ width: '100%', height: 300, borderRadius: 12, backgroundColor: '#333' }}
                                resizeMode="contain"
                            />

                            <View style={{ marginTop: 24 }}>
                                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', textAlign: 'center' }}>
                                    {selectedPortfolioItem?.title}
                                </Text>

                                {selectedPortfolioItem?.description && (
                                    <Text style={{ color: '#DDD', fontSize: 16, marginTop: 12, lineHeight: 24, textAlign: 'center' }}>
                                        {selectedPortfolioItem.description}
                                    </Text>
                                )}

                                {selectedPortfolioItem?.projectUrl && (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(selectedPortfolioItem.projectUrl)}
                                        style={{
                                            marginTop: 24,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: c.primary,
                                            paddingVertical: 12,
                                            paddingHorizontal: 24,
                                            borderRadius: 30,
                                            alignSelf: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>View Project</Text>
                                        <MaterialIcons name="open-in-new" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>



            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14
    },
    appBarTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12
    },
    statCard: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden'
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginBottom: 28
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    sectionIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(249,113,48,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800'
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginHorizontal: 16,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
        borderBottomWidth: 2.5,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '700',
    },
});

export default PublicFreelancerProfileScreen;
