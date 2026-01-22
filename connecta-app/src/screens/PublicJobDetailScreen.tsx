import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import jobService from '../services/jobService';

const PublicJobDetailScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || {};

    const [job, setJob] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isExpanded, setIsExpanded] = React.useState(false);

    React.useEffect(() => {
        if (id) {
            loadJobDetails();
        }
    }, [id]);

    const loadJobDetails = async () => {
        try {
            setIsLoading(true);
            const data = await jobService.getJobById(id).catch(() => null);
            setJob(data);
        } catch (error) {
            console.error('Error loading job details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        navigation.navigate('Auth', { screen: 'Signup' });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
                <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={22} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: c.text }]}>Job Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Text style={{ color: c.subtext, fontSize: 16 }}>Job not found or failed to load.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Top App Bar */}
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Job Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    {/* Header */}
                    <Text style={[styles.title, { color: c.text }]}>{job.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialIcons name="schedule" size={14} color={c.subtext} />
                            <Text style={{ color: c.subtext, fontSize: 12 }}>Posted {new Date(job.createdAt || job.posted).toLocaleDateString()}</Text>
                        </View>
                        {job.paymentVerified && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <MaterialIcons name="verified" size={14} color="#22C55E" />
                                <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '600' }}>Payment Verified</Text>
                            </View>
                        )}
                        {!job.paymentVerified && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,165,0,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <MaterialIcons name="info-outline" size={14} color="orange" />
                                <Text style={{ color: 'orange', fontSize: 11, fontWeight: '600' }}>Payment Unverified</Text>
                            </View>
                        )}
                    </View>

                    {/* Key Info */}
                    <View style={[styles.keyInfoWrap, { borderTopColor: c.border, borderBottomColor: c.border }]}>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Budget</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>${job.budget}</Text>
                            <Text style={{ fontSize: 10, color: c.subtext }}>{job.budgetType === 'hourly' ? '/hr' : 'Fixed Price'}</Text>
                        </View>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Duration</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>{job.duration || 'N/A'}</Text>
                        </View>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Experience</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>{job.experienceLevel || job.experience || 'Intermediate'}</Text>
                        </View>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Location</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>{job.location || 'Remote'}</Text>
                        </View>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Type</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>{job.jobType || 'Full Time'}</Text>
                        </View>
                        <View style={styles.keyInfoItem}>
                            <Text style={[styles.keyLabel, { color: c.subtext }]}>Applicants</Text>
                            <Text style={[styles.keyValue, { color: c.text }]}>{job.applicants || 0}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Job Description</Text>
                        <Text style={{ color: c.subtext, lineHeight: 22, fontSize: 14 }}>
                            {isExpanded ? job.description : (job.description?.substring(0, 150) + '...')}
                            {!isExpanded && job.description?.length > 150 && (
                                <Text
                                    style={{ color: c.primary, fontWeight: '600' }}
                                    onPress={() => setIsExpanded(true)}
                                >
                                    {' '}Read More
                                </Text>
                            )}
                        </Text>
                    </View>

                    {/* Skills */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Required Skills</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {job.skills?.map((s: string) => (
                                <Text key={s} style={[styles.skill, { color: c.primary, backgroundColor: c.isDark ? 'rgba(253,103,48,0.15)' : 'rgba(253,103,48,0.08)' }]}>{s}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Client Info (Limited) */}
                    <View style={{ marginTop: 24, padding: 16, backgroundColor: c.card, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 12 }]}>About the Client</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                                    {(job.clientId?.firstName || job.clientName || 'C').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={[styles.clientName, { color: c.text }]}>
                                        {job.clientId ? `${job.clientId.firstName} ${job.clientId.lastName}` : (job.clientName || (job.isExternal ? 'External Client' : 'Unknown Client'))}
                                    </Text>
                                    {job.paymentVerified && <MaterialIcons name="verified" size={14} color="#22C55E" />}
                                </View>
                                <Text style={{ color: c.subtext, fontSize: 12, marginTop: 2 }}>
                                    {job.locationType === 'remote' ? 'Remote Client' : (job.clientLocation || job.location)}
                                </Text>
                                <Text style={{ color: c.subtext, fontSize: 11, marginTop: 4 }}>
                                    Email: {job.clientId?.email ? 'Verified' : 'Unverified'} • Joined {new Date(job.createdAt).getFullYear()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Login CTA */}
                    <View style={{ marginTop: 32, padding: 24, backgroundColor: c.isDark ? '#2C2C2E' : '#ebf8ff', borderRadius: 16, alignItems: 'center', gap: 12 }}>
                        <MaterialIcons name="lock-outline" size={32} color={c.primary} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, textAlign: 'center' }}>
                            Sign up to see full details
                        </Text>
                        <Text style={{ fontSize: 14, color: c.subtext, textAlign: 'center' }}>
                            View attachments, tailored AI insights, and submit your proposal.
                        </Text>
                    </View>

                </View>
            </ScrollView>

            {/* Fixed CTA */}
            <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: c.primary }]}
                    onPress={handleApply}
                >
                    <Text style={styles.applyText}>Login to Apply</Text>
                </TouchableOpacity>
            </View>
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

    title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

    keyInfoWrap: {
        marginTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    keyInfoItem: { width: '50%', paddingVertical: 14 },
    keyLabel: { fontSize: 11, fontWeight: '500' },
    keyValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

    skill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 11, fontWeight: '500' },
    clientName: { fontSize: 14, fontWeight: '600' },

    ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 8 },
    applyBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    applyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default PublicJobDetailScreen;
