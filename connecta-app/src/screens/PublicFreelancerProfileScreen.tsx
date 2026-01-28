import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, FlatList, Share, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import * as jobService from '../services/jobService';
import * as reviewService from '../services/reviewService';
import * as collaboService from '../services/collaboService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Job } from '../types';
import CustomAlert from '../components/CustomAlert';

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

    // Invite Logic
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
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

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const [profileData, reviewsData, statsData] = await Promise.all([
                profileService.getProfileByUserId(id),
                reviewService.getUserReviews(id),
                reviewService.getUserReviewStats(id)
            ]);
            setProfile(profileData);
            const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || []);
            setReviews(reviewsList);
            setReviewStats(statsData.data || null);
        } catch (error) {
            console.error('Error loading profile:', error);
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
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Signup' });
        } else {
            // Open Invite Modal
            openInviteModal();
        }
    };

    const handleShare = async () => {
        if (!profile) return;
        try {
            await Share.share({
                message: `Check out ${profile.firstName}'s profile on Connecta!`,
                // url: `https://connecta.app/freelancer/${id}`, // Example URL scheme
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
            // Fetch both regular jobs and collabo projects
            const [jobs, collaboProjects] = await Promise.all([
                jobService.getMyJobs(),
                (collaboService as any).getMyProjects()
            ]);

            const formattedJobs = jobs.map((j: any) => ({
                _id: j._id,
                title: j.title,
                budget: j.budget?.min || j.salary?.min || 0,
                type: 'job'
            }));

            const formattedProjects: any[] = [];
            const projectsList = Array.isArray(collaboProjects) ? collaboProjects : (collaboProjects as any)?.projects || [];

            (projectsList || []).forEach((p: any) => {
                // Only include projects that have open roles
                const openRoles = p.roles?.filter((r: any) => r.status === 'open' || !r.freelancerId) || [];
                if (openRoles.length > 0) {
                    formattedProjects.push({
                        _id: p._id,
                        title: p.title,
                        type: 'collabo',
                        roles: openRoles
                    });
                }
            });

            setInviteContexts([...formattedJobs, ...formattedProjects]);
        } catch (error) {
            console.error("Failed to load jobs", error);
            Alert.alert("Error", "Failed to load your jobs.");
        } finally {
            setLoadingJobs(false);
        }
    };

    // Alert State
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
            return;
        }

        try {
            setIsInviting(true);

            if ((selectedJob as any).type === 'collabo') {
                await (collaboService as any).inviteToRole((selectedJob as any)._id, id);
                showAlert('Invitation Sent', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`, 'success');
            } else {
                await (jobService as any).inviteFreelancer(selectedJob._id, id);
                showAlert('Invitation Sent', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`, 'success');
            }

            setInviteModalVisible(false);
            setSelectedJob(null);
        } catch (error: any) {
            console.error('Error sending invite:', error);
            showAlert('Error', error.message || 'Failed to send invitation. Please try again.', 'error');
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
            return;
        }

        try {
            setIsSubmittingReview(true);
            await reviewService.createReview({
                revieweeId: id,
                reviewerType: user?.userType === 'client' ? 'client' : 'freelancer',
                rating,
                comment,
            });
            showAlert('Success', 'Review submitted successfully', 'success');
            setReviewModalVisible(false);
            setComment('');
            setRating(5);
            loadProfile(); // Refresh reviews
        } catch (error: any) {
            showAlert('Error', error.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
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
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Text style={{ color: c.subtext, fontSize: 16 }}>Freelancer not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Modern Header */}
            <View style={[styles.appBar, { borderBottomColor: 'transparent', paddingHorizontal: 16 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.iconBtn, { backgroundColor: c.card }]}
                >
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card, marginRight: 8 }]} onPress={handleShare}>
                    <MaterialIcons name="share" size={20} color={c.text} />
                </TouchableOpacity>
                {isAuthenticated && user?._id !== id && (
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: c.card }]}
                        onPress={() => setReviewModalVisible(true)}
                    >
                        <MaterialIcons name="rate-review" size={20} color={c.text} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Section */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                        <View>
                            <Image
                                source={{ uri: profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` }}
                                style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: c.card }}
                            />
                            {profile?.isPremium && (
                                <View style={{
                                    position: 'absolute', bottom: -6, right: -6,
                                    backgroundColor: '#F59E0B', borderRadius: 12, width: 24, height: 24,
                                    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.background
                                }}>
                                    <MaterialIcons name="star" size={14} color="#FFF" />
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1, paddingTop: 4 }}>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, lineHeight: 30 }}>
                                {profile?.firstName} {profile?.lastName}
                            </Text>
                            <Text style={{ fontSize: 16, color: c.primary, fontWeight: '600', marginTop: 4 }}>
                                {profile?.profession || 'Freelancer'}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                <MaterialIcons name="location-on" size={14} color={c.subtext} />
                                <Text style={{ fontSize: 14, color: c.subtext }}>{profile?.country || 'Remote'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
                        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '600' }}>Success</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <MaterialIcons name="verified" size={18} color={profile?.jobSuccessScore >= 90 ? '#10B981' : c.subtext} />
                                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{profile?.jobSuccessScore || 100}%</Text>
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '600' }}>Rating</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <MaterialIcons name="star" size={18} color="#F59E0B" />
                                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{profile?.rating || '5.0'}</Text>
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '600' }}>Reviews</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <MaterialIcons name="rate-review" size={18} color={c.primary} />
                                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{reviewStats?.totalReviews || 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
                    <Text style={{ fontSize: 15, lineHeight: 24, color: c.subtext }}>
                        {profile?.bio || 'No bio added yet.'}
                    </Text>
                </View>

                {/* Skills Section */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {profile?.skills?.length > 0 ? (
                            profile.skills.map((s: string) => (
                                <View key={s} style={{
                                    paddingHorizontal: 14, paddingVertical: 8,
                                    borderRadius: 12,
                                    backgroundColor: c.card,
                                    borderWidth: 1, borderColor: c.border
                                }}>
                                    <Text style={{ color: c.text, fontSize: 14, fontWeight: '600' }}>{s}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: c.subtext }}>No skills listed.</Text>
                        )}
                    </View>
                </View>

                {/* Experience Section */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Experience</Text>
                    {profile?.employment?.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {profile.employment.map((job: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={{ width: 2, backgroundColor: c.border, position: 'relative', marginLeft: 8 }}>
                                        <View style={{
                                            width: 12, height: 12, borderRadius: 6,
                                            backgroundColor: c.primary, position: 'absolute', left: -5, top: 0
                                        }} />
                                    </View>
                                    <View style={{ flex: 1, paddingBottom: 8 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{job.position}</Text>
                                        <Text style={{ fontSize: 14, color: c.primary, fontWeight: '600', marginTop: 2 }}>{job.company}</Text>
                                        <Text style={{ fontSize: 13, color: c.subtext, marginTop: 4 }}>
                                            {formatDate(job.startDate)} - {formatDate(job.endDate)}
                                        </Text>
                                        {job.description && (
                                            <Text style={{ fontSize: 14, color: c.subtext, marginTop: 6, lineHeight: 20 }}>{job.description}</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No work experience listed.</Text>
                    )}
                </View>

                {/* Portfolio Section */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Portfolio</Text>
                    {profile?.portfolio?.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }}>
                            {profile.portfolio.map((item: any, i: number) => (
                                <View key={i} style={{ width: 280, backgroundColor: c.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.border }}>
                                    <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300' }} style={{ width: '100%', height: 160 }} />
                                    <View style={{ padding: 16 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                                        <Text style={{ color: c.subtext, fontSize: 13, marginTop: 4 }} numberOfLines={2}>{item.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={{ color: c.subtext }}>No portfolio items.</Text>
                    )}
                </View>

                {/* Reviews Section */}
                <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Reviews</Text>
                    {reviews.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {reviews.map((review: any) => (
                                <View key={review._id} style={{ backgroundColor: c.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{review.projectId?.title || 'Project'}</Text>
                                        <View style={{ flexDirection: 'row', gap: 2 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <MaterialIcons key={star} name="star" size={14} color={star <= review.rating ? "#F59E0B" : c.border} />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 14, color: c.subtext, lineHeight: 20, fontStyle: 'italic' }}>"{review.comment}"</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No reviews yet.</Text>
                    )}
                </View>

            </ScrollView>

            {/* Floating CTA */}
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 16, paddingBottom: 16 + insets.bottom,
                backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.border
            }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: c.primary, height: 56, borderRadius: 16,
                        alignItems: 'center', justifyContent: 'center',
                        shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
                    }}
                    onPress={handleHire}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                        {isAuthenticated ? "Invite to Job" : "Login to Hire"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Invite Modal */}
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
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {inviteStep === 2 && (
                                    <TouchableOpacity onPress={() => setInviteStep(1)} style={{ padding: 4 }}>
                                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                                    </TouchableOpacity>
                                )}
                                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>
                                    {inviteStep === 1 ? `Invite ${profile.firstName}` : 'Select Role'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => {
                                setInviteModalVisible(false);
                                setInviteStep(1);
                                setSelectedContext(null);
                                setSelectedJob(null);
                            }} style={{ padding: 4 }}>
                                <MaterialIcons name="close" size={24} color={c.subtext} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 15, color: c.subtext, marginBottom: 20 }}>
                            {inviteStep === 1
                                ? "Select a job or project to invite this freelancer to:"
                                : `Select a role in "${selectedContext?.title}" for this freelancer:`
                            }
                        </Text>

                        {loadingJobs ? (
                            <ActivityIndicator size="large" color={c.primary} style={{ padding: 40 }} />
                        ) : (
                            <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 12 }}>
                                {inviteStep === 1 ? (
                                    // Step 1: List Jobs and Projects
                                    inviteContexts.length > 0 ? (
                                        inviteContexts.map((item: any) => {
                                            const isSelected = selectedContext?._id === item._id;
                                            return (
                                                <TouchableOpacity
                                                    key={`${item.type}-${item._id}`}
                                                    onPress={() => {
                                                        setSelectedContext(item);
                                                        if (item.type === 'job') {
                                                            setSelectedJob(item); // Auto-select for job
                                                        } else {
                                                            setSelectedJob(null); // Reset for project
                                                        }
                                                    }}
                                                    activeOpacity={0.8}
                                                    style={{
                                                        padding: 16,
                                                        borderRadius: 16,
                                                        borderWidth: isSelected ? 2 : 1,
                                                        borderColor: isSelected ? c.primary : c.border,
                                                        backgroundColor: isSelected ? c.primary + '08' : c.background,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 12
                                                    }}
                                                >
                                                    <View style={{
                                                        width: 40, height: 40, borderRadius: 12,
                                                        backgroundColor: item.type === 'collabo' ? '#8B5CF620' : '#10B98120',
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <MaterialIcons
                                                            name={item.type === 'collabo' ? 'groups' : 'work'}
                                                            size={20}
                                                            color={item.type === 'collabo' ? '#8B5CF6' : '#10B981'}
                                                        />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }} numberOfLines={1}>{item.title}</Text>
                                                        <Text style={{ fontSize: 13, color: c.subtext }} numberOfLines={1}>
                                                            {item.type === 'collabo' ? 'Project • Multiple Roles' : `Job • ₦${item.budget?.toLocaleString() || 'Negotiable'}`}
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
                                        <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <MaterialIcons name="work-off" size={40} color={c.border} />
                                            <Text style={{ textAlign: 'center', color: c.subtext }}>No active jobs or projects found.</Text>
                                        </View>
                                    )
                                ) : (
                                    // Step 2: List Roles for Selected Project
                                    selectedContext?.roles?.length > 0 ? (
                                        selectedContext.roles.map((role: any) => {
                                            const isSelected = selectedJob?._id === role._id;
                                            return (
                                                <TouchableOpacity
                                                    key={role._id}
                                                    onPress={() => setSelectedJob({ ...role, type: 'collabo', projectId: selectedContext._id, title: role.title })}
                                                    activeOpacity={0.8}
                                                    style={{
                                                        padding: 16,
                                                        borderRadius: 16,
                                                        borderWidth: isSelected ? 2 : 1,
                                                        borderColor: isSelected ? c.primary : c.border,
                                                        backgroundColor: isSelected ? c.primary + '08' : c.background,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 12
                                                    }}
                                                >
                                                    <View style={{
                                                        width: 40, height: 40, borderRadius: 12,
                                                        backgroundColor: '#8B5CF620',
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <MaterialIcons name="person" size={20} color="#8B5CF6" />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }} numberOfLines={1}>{role.title}</Text>
                                                        <Text style={{ fontSize: 13, color: c.subtext }} numberOfLines={1}>
                                                            Budget: ₦{role.budget?.toLocaleString() || 'Negotiable'}
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
                                        <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <MaterialIcons name="person-off" size={40} color={c.border} />
                                            <Text style={{ textAlign: 'center', color: c.subtext }}>No open roles in this project.</Text>
                                        </View>
                                    )
                                )}
                            </ScrollView>
                        )}

                        <View style={{ marginTop: 24, gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (inviteStep === 1 && selectedContext?.type === 'collabo') {
                                        setInviteStep(2);
                                    } else {
                                        handleSendInvite();
                                    }
                                }}
                                disabled={!selectedContext || (inviteStep === 2 && !selectedJob) || isInviting}
                                style={{
                                    backgroundColor: (selectedContext && (inviteStep === 1 || selectedJob)) ? c.primary : c.border,
                                    padding: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 8,
                                    opacity: (!selectedContext || (inviteStep === 2 && !selectedJob) || isInviting) ? 0.7 : 1
                                }}
                            >
                                {isInviting ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
                                            {inviteStep === 1 && selectedContext?.type === 'collabo' ? 'Next: Select Role' : 'Send Invitation'}
                                        </Text>
                                        <MaterialIcons name={inviteStep === 1 && selectedContext?.type === 'collabo' ? "arrow-forward" : "send"} size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Review Modal */}
            <Modal
                visible={reviewModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: c.card, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>Add Review</Text>
                            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                                <Ionicons name="close" size={24} color={c.subtext} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12 }}>Rating</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={32}
                                        color={star <= rating ? "#F59E0B" : c.border}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 12 }}>Your Comment</Text>
                        <View style={{
                            backgroundColor: c.background,
                            borderRadius: 12,
                            padding: 16,
                            height: 120,
                            borderWidth: 1,
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
                            style={{
                                backgroundColor: c.primary,
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                opacity: isSubmittingReview ? 0.7 : 1
                            }}
                            onPress={handleAddReview}
                            disabled={isSubmittingReview}
                        >
                            {isSubmittingReview ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    appBarTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    statCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
    sectionContainer: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
});

export default PublicFreelancerProfileScreen;
