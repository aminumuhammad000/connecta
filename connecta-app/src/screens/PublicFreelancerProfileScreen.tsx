import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, FlatList } from 'react-native';
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
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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
            setReviews(reviewsData.data || []);
            setReviewStats(statsData.data || null);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHire = () => {
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Signup' });
        } else {
            // Open Invite Modal
            openInviteModal();
        }
    };

    const openInviteModal = async () => {
        setInviteModalVisible(true);
        setLoadingJobs(true);
        try {
            // Fetch both regular jobs and collabo projects
            const [jobs, collaboProjects] = await Promise.all([
                jobService.getMyJobs(),
                (collaboService as any).getMyProjects()
            ]);

            const formattedJobs = jobs.map((j: any) => ({
                _id: j._id,
                title: j.title,
                subtitle: 'Individual Job',
                budget: j.budget?.min || j.salary?.min || 0,
                type: 'job'
            }));

            const formattedCollaboRoles: any[] = [];

            // Handle if response is wrapped in data or projects property
            const projectsList = Array.isArray(collaboProjects) ? collaboProjects : (collaboProjects as any)?.projects || [];

            (projectsList || []).forEach((p: any) => {
                if (p.roles && p.roles.length > 0) {
                    p.roles.forEach((r: any) => {
                        // Show role if it's open or doesn't have a freelancer assigned yet
                        if (r.status === 'open' || !r.freelancerId) {
                            formattedCollaboRoles.push({
                                _id: r._id,
                                title: r.title,
                                subtitle: `${p.title} (Team Role)`,
                                budget: r.budget,
                                type: 'collabo',
                                projectId: p._id
                            });
                        }
                    });
                }
            });

            setMyJobs([...formattedJobs, ...formattedCollaboRoles]);
        } catch (error) {
            console.error("Failed to load jobs", error);
            Alert.alert("Error", "Failed to load your jobs.");
        } finally {
            setLoadingJobs(false);
        }
    };

    const handleSendInvite = async () => {
        if (!selectedJob) {
            Alert.alert("Select a Job", "Please select a job to invite the freelancer to.");
            return;
        }

        try {
            setIsInviting(true);

            if ((selectedJob as any).type === 'collabo') {
                await (collaboService as any).inviteToRole((selectedJob as any)._id, id);
                Alert.alert('Success', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`);
            } else {
                await (jobService as any).inviteFreelancer(selectedJob._id, id);
                Alert.alert('Success', `Invitation sent to ${profile.firstName} for "${selectedJob.title}"`);
            }

            setInviteModalVisible(false);
            setSelectedJob(null);
        } catch (error: any) {
            console.error('Error sending invite:', error);
            Alert.alert('Error', error.message || 'Failed to send invitation. Please try again.');
        } finally {
            setIsInviting(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
                        <MaterialIcons name="arrow-back" size={22} color={c.text} />
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
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Freelancer Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
                {/* Profile Header */}
                <View style={[styles.sectionPad, profile?.isPremium && { backgroundColor: c.isDark ? '#3D2800' : '#FFFBEB', paddingBottom: 24, paddingTop: 20 }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.avatarContainer, profile?.isPremium && styles.premiumBorder]}>
                                <Image source={{ uri: profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` }} style={styles.avatar} />
                                {profile?.isPremium && (
                                    <View style={styles.premiumIconBadge}>
                                        <MaterialIcons name="workspace-premium" size={14} color="#FFF" />
                                    </View>
                                )}
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>
                                    {profile?.isVerified && (
                                        <MaterialIcons name="verified" size={20} color="#F59E0B" style={{ marginLeft: 4 }} />
                                    )}
                                </View>
                                {profile?.isPremium && (
                                    <View style={styles.premiumBadge}>
                                        <MaterialIcons name="star" size={12} color="#FFF" />
                                        <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
                                    </View>
                                )}
                                <Text style={[styles.role, { color: c.subtext }]}>{profile?.profession || 'Freelancer'}</Text>
                                <View style={styles.verifiedRow}>
                                    <MaterialIcons name="location-on" size={14} color={c.subtext} />
                                    <Text style={[styles.location, { color: c.subtext }]}>{profile?.country || 'Remote'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reputation & Badges */}
                <View style={[styles.sectionPad, { marginTop: 12 }]}>
                    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 20 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={{ color: c.subtext, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Job Success</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: profile?.jobSuccessScore >= 90 ? '#DCFCE7' : '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="verified-user" size={28} color={profile?.jobSuccessScore >= 90 ? '#16A34A' : c.subtext} />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={{ fontSize: 28, fontWeight: '800', color: c.text }}>{profile?.jobSuccessScore || 100}%</Text>
                                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>Client Satisfaction</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: c.subtext, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rating</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#B45309', marginRight: 4 }}>{profile?.rating || '5.0'}</Text>
                                    <MaterialIcons name="star" size={20} color="#F59E0B" />
                                </View>
                                <Text style={{ fontSize: 12, color: c.subtext, marginTop: 4 }}>
                                    {reviewStats?.totalReviews || 0} reviews
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* About */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
                    <Text style={[styles.about, { color: c.subtext }]}>{profile?.bio || 'No bio added yet.'}</Text>
                </View>

                {/* Skills */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                    <View style={styles.skillsRow}>
                        {profile?.skills?.length > 0 ? (
                            profile.skills.map((s: string) => (
                                <View key={s} style={[styles.skillChip, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>
                                    <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700' }}>{s}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: c.subtext }}>No skills listed.</Text>
                        )}
                    </View>
                </View>

                {/* Employment History */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Work Experience</Text>
                    {profile?.employment?.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {profile.employment.map((job: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border }}>
                                        <MaterialIcons name="business" size={20} color={c.subtext} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.cardTitle, { color: c.text }]}>{job.position}</Text>
                                        <Text style={{ fontSize: 14, color: c.text, fontWeight: '500' }}>{job.company}</Text>
                                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>
                                            {formatDate(job.startDate)} - {formatDate(job.endDate)}
                                        </Text>
                                        {job.description && (
                                            <Text style={{ fontSize: 13, color: c.subtext, marginTop: 4, lineHeight: 20 }}>{job.description}</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No work experience listed.</Text>
                    )}
                </View>

                {/* Education */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Education</Text>
                    {profile?.education?.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {profile.education.map((edu: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border }}>
                                        <MaterialIcons name="school" size={20} color={c.subtext} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.cardTitle, { color: c.text }]}>{edu.institution}</Text>
                                        <Text style={{ fontSize: 14, color: c.text, fontWeight: '500' }}>{edu.degree} in {edu.fieldOfStudy}</Text>
                                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No education listed.</Text>
                    )}
                </View>

                {/* Portfolio */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Portfolio</Text>
                    {profile?.portfolio?.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {profile.portfolio.map((item: any, i: number) => (
                                <View key={i} style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
                                    <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300' }} style={{ width: '100%', height: 160 }} />
                                    <View style={{ padding: 12 }}>
                                        <Text style={[styles.cardTitle, { color: c.text }]}>{item.title || 'Untitled'}</Text>
                                        <Text style={{ color: c.subtext, fontSize: 12 }}>{item.description}</Text>
                                        {item.projectUrl && (
                                            <TouchableOpacity onPress={() => { /* Open URL */ }}>
                                                <Text style={{ color: c.primary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>View Project</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No portfolio items publicly visible.</Text>
                    )}
                </View>

                {/* Reviews Section */}
                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Client Reviews</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialIcons name="star" size={16} color="#F59E0B" />
                            <Text style={{ fontWeight: '700', color: c.text }}>{reviewStats?.averageRating || '0.0'}</Text>
                            <Text style={{ color: c.subtext }}>({reviewStats?.totalReviews || 0})</Text>
                        </View>
                    </View>

                    {reviews.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {reviews.map((review: any) => (
                                <View key={review._id} style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 16 }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{review.projectId?.title || 'General Review'}</Text>
                                        <View style={{ flexDirection: 'row', gap: 2 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <MaterialIcons
                                                    key={star}
                                                    name={star <= review.rating ? "star" : "star-border"}
                                                    size={14}
                                                    color="#F59E0B"
                                                />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>"{review.comment}"</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
                                        <Image
                                            source={{ uri: review.reviewerId?.profileImage || `https://ui-avatars.com/api/?name=${review.reviewerId?.firstName}+${review.reviewerId?.lastName}` }}
                                            style={{ width: 24, height: 24, borderRadius: 12 }}
                                        />
                                        <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600' }}>
                                            {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: c.subtext }}>• {formatDate(review.createdAt)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={{ padding: 20, alignItems: 'center', backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border }}>
                            <Text style={{ color: c.subtext }}>No reviews yet.</Text>
                        </View>
                    )}
                </View>

                {/* Login CTA */}
                {!isAuthenticated && (
                    <View style={{ margin: 16, padding: 24, backgroundColor: c.isDark ? '#2C2C2E' : '#ebf8ff', borderRadius: 16, alignItems: 'center', gap: 12 }}>
                        <MaterialIcons name="lock-outline" size={32} color={c.primary} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, textAlign: 'center' }}>
                            Hire {profile.firstName} for your project
                        </Text>
                        <Text style={{ fontSize: 14, color: c.subtext, textAlign: 'center' }}>
                            Sign up to message, interview, and hire top talent securely.
                        </Text>
                    </View>
                )}

            </ScrollView>

            {/* Fixed CTA */}
            <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: c.primary }]}
                    onPress={handleHire}
                >
                    <Text style={styles.applyText}>
                        {isAuthenticated ? "Invite to Job" : "Login to Hire"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Invite Modal */}
            <Modal
                visible={inviteModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setInviteModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Invite {profile.firstName}</Text>
                            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={c.subtext} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 16 }}>
                            Select a job to invite this freelancer to:
                        </Text>

                        {loadingJobs ? (
                            <ActivityIndicator size="large" color={c.primary} />
                        ) : (
                            <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 12 }}>
                                {myJobs.length > 0 ? (
                                    myJobs.map((item: any) => (
                                        <TouchableOpacity
                                            key={`${item.type}-${item._id}`}
                                            onPress={() => setSelectedJob(item)}
                                            style={{
                                                padding: 16,
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                borderColor: selectedJob?._id === item._id ? c.primary : c.border,
                                                backgroundColor: selectedJob?._id === item._id ? c.primary + '08' : c.card,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.05,
                                                shadowRadius: 2,
                                                elevation: 1
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <View style={{
                                                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                                                        backgroundColor: item.type === 'collabo' ? '#8B5CF6' + '20' : '#10B981' + '20',
                                                        borderWidth: 1,
                                                        borderColor: item.type === 'collabo' ? '#8B5CF6' : '#10B981'
                                                    }}>
                                                        <Text style={{
                                                            color: item.type === 'collabo' ? '#8B5CF6' : '#10B981',
                                                            fontSize: 10, fontWeight: '800', letterSpacing: 0.5
                                                        }}>
                                                            {item.type === 'collabo' ? 'COLLABO' : 'JOB'}
                                                        </Text>
                                                    </View>
                                                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, flex: 1 }} numberOfLines={1}>
                                                        {item.title}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <MaterialIcons name={item.type === 'collabo' ? 'groups' : 'work'} size={14} color={c.subtext} />
                                                    <Text style={{ fontSize: 13, color: c.subtext, flex: 1 }} numberOfLines={1}>
                                                        {item.subtitle}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    <MaterialIcons name="payments" size={14} color={c.primary} />
                                                    <Text style={{ fontSize: 13, color: c.primary, fontWeight: '600' }}>
                                                        {item.budget ? `₦${item.budget.toLocaleString()}` : 'Budget Negotiable'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ marginLeft: 12 }}>
                                                <View style={{
                                                    width: 24, height: 24, borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: selectedJob?._id === item._id ? c.primary : c.border,
                                                    alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: selectedJob?._id === item._id ? c.primary : 'transparent'
                                                }}>
                                                    {selectedJob?._id === item._id && <MaterialIcons name="check" size={16} color="#FFF" />}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.border + '30', alignItems: 'center', justifyContent: 'center' }}>
                                            <MaterialIcons name="work-off" size={28} color={c.subtext} />
                                        </View>
                                        <Text style={{ textAlign: 'center', color: c.text, fontSize: 16, fontWeight: '600' }}>
                                            No Active Jobs or Projects
                                        </Text>
                                        <Text style={{ textAlign: 'center', color: c.subtext, fontSize: 14, maxWidth: 240 }}>
                                            You need to post a job or create a Collabo project before you can invite freelancers.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}

                        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border, gap: 12 }}>
                            <TouchableOpacity
                                onPress={handleSendInvite}
                                disabled={!selectedJob || isInviting}
                                style={{
                                    backgroundColor: selectedJob ? c.primary : c.border,
                                    padding: 16,
                                    borderRadius: 12,
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
                                        <MaterialIcons name="send" size={20} color="#FFF" />
                                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Send Invitation</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setInviteModalVisible(false);
                                    navigation.navigate('PostJob');
                                }}
                                style={{
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 8
                                }}
                            >
                                <MaterialIcons name="add-circle-outline" size={20} color={c.primary} />
                                <Text style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>Post New Job</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    appBarTitle: { fontSize: 16, fontWeight: '600' },
    sectionPad: { paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ddd' },
    name: { fontSize: 20, fontWeight: '800' },
    role: { fontSize: 14, marginTop: 2, fontWeight: '500' },
    location: { fontSize: 13, marginLeft: 4 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },

    avatarContainer: { position: 'relative' },
    premiumBorder: { borderWidth: 3, borderColor: '#F59E0B', borderRadius: 999, padding: 2 },
    premiumIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F59E0B', borderRadius: 999, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
    premiumText: { color: '#FFF', fontSize: 10, fontWeight: '700', marginLeft: 2 },

    card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    about: { fontSize: 14, lineHeight: 22 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 13, fontWeight: '700' },
    cardTitle: { fontSize: 16, fontWeight: '700' },

    ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 8 },
    applyBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    applyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default PublicFreelancerProfileScreen;
