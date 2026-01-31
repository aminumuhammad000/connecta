import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, FlatList, Share, TextInput, Animated, Platform, Dimensions, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import profileService from '../services/profileService';
import * as jobService from '../services/jobService';
import * as reviewService from '../services/reviewService';
import * as collaboService from '../services/collaboService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Job } from '../types';
import CustomAlert from '../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PublicFreelancerProfileScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || {};
    const { user, isAuthenticated } = useAuth();

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
            setReviewStats(statsData.data || null);
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

    const handleHire = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Signup' });
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
            const [jobs, collaboProjects] = await Promise.all([
                jobService.getMyJobs(),
                (collaboService as any).getMyProjects()
            ]);

            const formattedJobs = jobs.map((j: any) => ({
                _id: j._id,
                title: j.title,
                budget: j.budget?.min || j.salary?.min || 0,
                type: 'job',
                subtitle: 'Individual Job'
            }));

            const flattenedItems: any[] = [...formattedJobs];
            const projectsList = Array.isArray(collaboProjects) ? collaboProjects : (collaboProjects as any)?.projects || [];

            (projectsList || []).forEach((p: any) => {
                const isFunded = p.status !== 'planning';
                const openRoles = p.roles?.filter((r: any) => r.status === 'open' || !r.freelancerId) || [];
                if (openRoles.length > 0) {
                    openRoles.forEach((r: any) => {
                        flattenedItems.push({
                            _id: r._id,
                            title: r.title,
                            subtitle: isFunded ? `${p.title} (Team Role)` : `${p.title} - Payment Required`,
                            budget: r.budget,
                            type: 'collabo',
                            projectId: p._id,
                            disabled: !isFunded
                        });
                    });
                } else {
                    flattenedItems.push({
                        _id: p._id,
                        title: p.title,
                        subtitle: 'No open roles',
                        type: 'empty-collabo',
                        projectId: p._id
                    });
                }
            });

            setInviteContexts(flattenedItems);
        } catch (error) {
            console.error("Failed to load jobs", error);
            Alert.alert("Error", "Failed to load your jobs.");
        } finally {
            setLoadingJobs(false);
        }
    };

    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
        visible: false,
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const handleSendInvite = async () => {
        if (!selectedJob) {
            showAlert("Select a Job", "Please select a job to invite the freelancer to.", 'warning');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }

        try {
            setIsInviting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            if ((selectedJob as any).type === 'collabo') {
                await (collaboService as any).inviteToRole((selectedJob as any)._id, id);
                showAlert('Invitation Sent', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`, 'success');
            } else {
                await (jobService as any).inviteFreelancer(selectedJob._id, id);
                showAlert('Invitation Sent', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`, 'success');
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setInviteModalVisible(false);
            setSelectedJob(null);
        } catch (error: any) {
            console.error('Error sending invite:', error);
            showAlert('Error', error.message || 'Failed to send invitation. Please try again.', 'error');
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
            showAlert('Error', 'Please enter a comment', 'error');
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
            showAlert('Success', 'Review submitted successfully', 'success');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setReviewModalVisible(false);
            setComment('');
            setRating(5);
            loadProfile();
        } catch (error: any) {
            showAlert('Error', error.message || 'Failed to submit review', 'error');
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
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: c.card, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="share" size={20} color={c.text} />
                </TouchableOpacity>
                {isAuthenticated && user?._id !== id && (
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: c.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setReviewModalVisible(true);
                        }}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="rate-review" size={20} color={c.text} />
                    </TouchableOpacity>
                )}
            </Animated.View>

            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section with Gradient */}
                <Animated.View style={{
                    paddingHorizontal: 20,
                    paddingTop: 10,
                    paddingBottom: 32,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                        <View style={{
                            position: 'relative',
                            shadowColor: c.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 6
                        }}>
                            <Image
                                source={{ uri: profile?.profileImage || profile?.avatar || profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=FD6730&color=fff&size=200` }}
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: 28,
                                    backgroundColor: c.card,
                                    borderWidth: 3,
                                    borderColor: c.background,
                                }}
                            />
                            {profile?.isPremium && (
                                <LinearGradient
                                    colors={['#F59E0B', '#F97316']}
                                    style={{
                                        position: 'absolute', bottom: -4, right: -4,
                                        borderRadius: 14, width: 28, height: 28,
                                        alignItems: 'center', justifyContent: 'center',
                                        borderWidth: 3, borderColor: c.background,
                                        shadowColor: '#F59E0B',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 4,
                                        elevation: 4
                                    }}
                                >
                                    <MaterialIcons name="star" size={14} color="#FFF" />
                                </LinearGradient>
                            )}
                            {profile?.isVerified && (
                                <View style={{
                                    position: 'absolute', top: -4, right: -4,
                                    backgroundColor: '#10B981',
                                    borderRadius: 12, width: 24, height: 24,
                                    alignItems: 'center', justifyContent: 'center',
                                    borderWidth: 3, borderColor: c.background,
                                    shadowColor: '#10B981',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 4
                                }}>
                                    <MaterialIcons name="verified" size={12} color="#FFF" />
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1, paddingTop: 4 }}>
                            <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, lineHeight: 32, letterSpacing: -0.5 }}>
                                {profile?.firstName} {profile?.lastName}
                            </Text>
                            <Text style={{ fontSize: 17, color: c.primary, fontWeight: '600', marginTop: 4 }}>
                                {profile?.profession || 'Freelancer'}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                <View style={{
                                    backgroundColor: c.primary + '15',
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    <MaterialIcons name="location-on" size={14} color={c.primary} />
                                    <Text style={{ fontSize: 13, color: c.primary, fontWeight: '600' }}>{profile?.country || 'Remote'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Stats Row */}
                    <View style={{ flexDirection: 'row', marginTop: 28, gap: 10 }}>
                        <Animated.View style={[styles.statCard, {
                            backgroundColor: c.card,
                            borderColor: c.border,
                            transform: [{ scale: fadeAnim }]
                        }]}>
                            <LinearGradient
                                colors={profile?.jobSuccessScore >= 90 ? ['#10B981', '#059669'] : [c.card, c.card]}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 16,
                                    opacity: profile?.jobSuccessScore >= 90 ? 0.15 : 1
                                }}
                            />
                            <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600', marginBottom: 6 }}>Success</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialIcons name="verified" size={20} color={profile?.jobSuccessScore >= 90 ? '#10B981' : c.subtext} />
                                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>{profile?.jobSuccessScore || 100}%</Text>
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.statCard, {
                            backgroundColor: c.card,
                            borderColor: c.border,
                            transform: [{ scale: fadeAnim }]
                        }]}>
                            <LinearGradient
                                colors={['#F59E0B', '#F59E0B']}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 16,
                                    opacity: 0.1
                                }}
                            />
                            <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600', marginBottom: 6 }}>Rating</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialIcons name="star" size={20} color="#F59E0B" />
                                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>{profile?.rating || '5.0'}</Text>
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.statCard, {
                            backgroundColor: c.card,
                            borderColor: c.border,
                            transform: [{ scale: fadeAnim }]
                        }]}>
                            <LinearGradient
                                colors={[c.primary, c.primary]}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 16,
                                    opacity: 0.1
                                }}
                            />
                            <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600', marginBottom: 6 }}>Reviews</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialIcons name="rate-review" size={20} color={c.primary} />
                                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, letterSpacing: -0.5 }}>{reviewStats?.totalReviews || 0}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* About Section */}
                <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: c.primary + '15',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MaterialIcons name="person" size={20} color={c.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>About</Text>
                    </View>
                    <View style={{
                        backgroundColor: c.card,
                        padding: 16,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: c.border
                    }}>
                        <Text style={{ fontSize: 15, lineHeight: 24, color: c.text }}>
                            {profile?.bio || 'No bio added yet.'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Skills Section */}
                <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: c.primary + '15',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MaterialIcons name="code" size={20} color={c.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Skills</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {profile?.skills?.length > 0 ? (
                            profile.skills.map((s: string, index: number) => (
                                <Animated.View
                                    key={s}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 14,
                                        backgroundColor: c.card,
                                        borderWidth: 1.5,
                                        borderColor: c.primary + '30',
                                        shadowColor: c.primary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 2,
                                        transform: [{ scale: fadeAnim }]
                                    }}
                                >
                                    <Text style={{ color: c.text, fontSize: 14, fontWeight: '600' }}>{s}</Text>
                                </Animated.View>
                            ))
                        ) : (
                            <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                                <MaterialIcons name="code-off" size={32} color={c.border} />
                                <Text style={{ color: c.subtext, marginTop: 8 }}>No skills listed</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Experience Section */}
                <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: c.primary + '15',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MaterialIcons name="work" size={20} color={c.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Experience</Text>
                    </View>
                    {profile?.employment?.length > 0 ? (
                        <View style={{ gap: 20 }}>
                            {profile.employment.map((job: any, i: number) => (
                                <Animated.View
                                    key={i}
                                    style={{
                                        flexDirection: 'row',
                                        gap: 16,
                                        opacity: fadeAnim,
                                        transform: [{ scale: fadeAnim }]
                                    }}
                                >
                                    <View style={{ width: 2, backgroundColor: c.border, position: 'relative', marginLeft: 8 }}>
                                        <LinearGradient
                                            colors={[c.primary, c.primary + '50']}
                                            style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: 8,
                                                position: 'absolute',
                                                left: -7,
                                                top: 0,
                                                borderWidth: 3,
                                                borderColor: c.background,
                                                shadowColor: c.primary,
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 4,
                                                elevation: 3
                                            }}
                                        />
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: c.card,
                                        padding: 16,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: c.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 3,
                                        elevation: 1
                                    }}>
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>{job.position}</Text>
                                        <Text style={{ fontSize: 15, color: c.primary, fontWeight: '600', marginTop: 4 }}>{job.company}</Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 8,
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            backgroundColor: c.background,
                                            borderRadius: 8,
                                            alignSelf: 'flex-start'
                                        }}>
                                            <MaterialIcons name="calendar-today" size={12} color={c.subtext} />
                                            <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '500' }}>
                                                {formatDate(job.startDate)} - {formatDate(job.endDate)}
                                            </Text>
                                        </View>
                                        {job.description && (
                                            <Text style={{ fontSize: 14, color: c.subtext, marginTop: 12, lineHeight: 22 }}>{job.description}</Text>
                                        )}
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    ) : (
                        <View style={{ padding: 30, alignItems: 'center' }}>
                            <MaterialIcons name="work-off" size={40} color={c.border} />
                            <Text style={{ color: c.subtext, marginTop: 12 }}>No work experience listed</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Portfolio Section */}
                <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: c.primary + '15',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MaterialIcons name="collections" size={20} color={c.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Portfolio</Text>
                    </View>
                    {profile?.portfolio?.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }}>
                            {profile.portfolio.map((item: any, i: number) => (
                                <TouchableOpacity
                                    key={i}
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedPortfolioItem(item);
                                    }}
                                    style={{
                                        width: 300,
                                        backgroundColor: c.card,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: c.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300' }}
                                        style={{ width: '100%', height: 180 }}
                                    />
                                    <View style={{ padding: 16 }}>
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                                        <Text style={{ color: c.subtext, fontSize: 14, marginTop: 6, lineHeight: 20 }} numberOfLines={2}>{item.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ padding: 30, alignItems: 'center' }}>
                            <MaterialIcons name="collections" size={40} color={c.border} />
                            <Text style={{ color: c.subtext, marginTop: 12 }}>No portfolio items</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Reviews Section */}
                <Animated.View style={[styles.sectionContainer, { marginBottom: 20, opacity: fadeAnim }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: c.primary + '15',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MaterialIcons name="rate-review" size={20} color={c.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Reviews</Text>
                    </View>
                    {reviews.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {reviews.map((review: any) => (
                                <Animated.View
                                    key={review._id}
                                    style={{
                                        backgroundColor: c.card,
                                        padding: 18,
                                        borderRadius: 18,
                                        borderWidth: 1,
                                        borderColor: c.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 2,
                                        transform: [{ scale: fadeAnim }]
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{review.projectId?.title || 'Project'}</Text>
                                        <View style={{ flexDirection: 'row', gap: 3 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <MaterialIcons key={star} name="star" size={16} color={star <= review.rating ? "#F59E0B" : c.border} />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 14, color: c.subtext, lineHeight: 22, fontStyle: 'italic' }}>"{review.comment}"</Text>
                                </Animated.View>
                            ))}
                        </View>
                    ) : (
                        <View style={{ padding: 30, alignItems: 'center' }}>
                            <MaterialIcons name="rate-review" size={40} color={c.border} />
                            <Text style={{ color: c.subtext, marginTop: 12 }}>No reviews yet</Text>
                        </View>
                    )}
                </Animated.View>

            </Animated.ScrollView>

            {/* Enhanced Floating CTA with Gradient */}
            <Animated.View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                paddingBottom: 16 + insets.bottom,
                backgroundColor: c.background,
                borderTopWidth: 1,
                borderTopColor: c.border,
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, -1) }]
            }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleHire}
                >
                    <LinearGradient
                        colors={[c.primary, c.primary + 'DD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            height: 58,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 10,
                            shadowColor: c.primary,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.35,
                            shadowRadius: 10,
                            elevation: 8
                        }}
                    >
                        <MaterialIcons name="work" size={22} color="#FFF" />
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 }}>
                            {isAuthenticated ? "Invite to Job" : "Login to Hire"}
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
                                    inviteContexts.map((item: any) => {
                                        const isSelected = selectedJob?._id === item._id;

                                        if (item.type === 'empty-collabo') {
                                            return (
                                                <View key={item._id} style={{ padding: 16, borderRadius: 16, backgroundColor: c.background, borderWidth: 1, borderColor: c.border, gap: 12 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.6 }}>
                                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#8B5CF620', alignItems: 'center', justifyContent: 'center' }}>
                                                            <MaterialIcons name="groups" size={20} color="#8B5CF6" />
                                                        </View>
                                                        <View>
                                                            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{item.title}</Text>
                                                            <Text style={{ fontSize: 13, color: c.subtext }}>No open roles</Text>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setInviteModalVisible(false);
                                                            navigation.navigate('CollaboWorkspace', {
                                                                projectId: item.projectId,
                                                                openAddRole: true,
                                                                inviteFreelancerId: profile._id
                                                            });
                                                        }}
                                                        style={{ padding: 12, backgroundColor: c.primary + '15', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: c.primary }}
                                                    >
                                                        <Text style={{ color: c.primary, fontWeight: '700', fontSize: 14 }}>Create New Role</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={item._id}
                                                disabled={item.disabled}
                                                onPress={() => {
                                                    if (item.disabled) return;
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setSelectedJob(isSelected ? null : item);
                                                }}
                                                activeOpacity={item.disabled ? 1 : 0.8}
                                                style={{
                                                    padding: 16,
                                                    borderRadius: 16,
                                                    backgroundColor: isSelected ? c.primary + '10' : (item.disabled ? c.card + '80' : c.card),
                                                    borderWidth: 1.5,
                                                    borderColor: isSelected ? c.primary : c.border,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    opacity: item.disabled ? 0.6 : 1
                                                }}
                                            >
                                                <View style={{
                                                    width: 40, height: 40, borderRadius: 12,
                                                    backgroundColor: item.type === 'collabo' ? '#8B5CF620' : '#10B98120',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <MaterialIcons
                                                        name={item.type === 'collabo' ? 'person' : 'work'}
                                                        size={20}
                                                        color={item.type === 'collabo' ? '#8B5CF6' : '#10B981'}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }} numberOfLines={1}>{item.title}</Text>
                                                    <Text style={{ fontSize: 13, color: c.subtext }} numberOfLines={1}>
                                                        {item.subtitle} • {item.budget ? `₦${item.budget.toLocaleString()}` : 'Negotiable'}
                                                    </Text>
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

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
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
        marginBottom: 32
    },
    sectionTitle: {
        fontSize: 21,
        fontWeight: '800'
    },
});

export default PublicFreelancerProfileScreen;
