import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as jobService from '../services/jobService';
import * as dashboardService from '../services/dashboardService';
import SuccessModal from '../components/SuccessModal';

const ClientRecommendedScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { jobId } = route.params || {};

    const [job, setJob] = useState<any>(null);
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviting, setIsInviting] = useState<string | null>(null);
    const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        loadData();
    }, [jobId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [jobData, freelancersData] = await Promise.all([
                jobId ? jobService.getJobById(jobId) : Promise.resolve(null),
                dashboardService.getRecommendedFreelancers().catch(() => [])
            ]);

            setJob(jobData);
            setFreelancers(freelancersData);
        } catch (error) {
            console.error('Error loading recommended freelancers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (freelancer: any) => {
        if (!jobId) {
            Alert.alert("Error", "No job selected for invitation.");
            return;
        }

        try {
            setIsInviting(freelancer._id || freelancer.id);
            await jobService.inviteFreelancer(jobId, freelancer._id || freelancer.id);
            
            setSuccessModal({
                visible: true,
                title: 'Invitation Sent! 🕊️',
                message: `You've invited ${freelancer.firstName} to your job "${job?.title || 'Job'}".`
            });
        } catch (error: any) {
            console.error('Error sending invite:', error);
            Alert.alert('Error', error.message || 'Failed to send invitation. Please try again.');
        } finally {
            setIsInviting(null);
        }
    };

    const filteredFreelancers = useMemo(() => {
        if (!searchQuery.trim()) return freelancers;
        const q = searchQuery.toLowerCase();
        return freelancers.filter(f => 
            `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
            (f.jobTitle || '').toLowerCase().includes(q) ||
            (f.skills || []).some((s: string) => s.toLowerCase().includes(q))
        );
    }, [freelancers, searchQuery]);

    const renderFreelancerItem = ({ item: f }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('FreelancerPublicProfile', { id: f._id || f.id, jobId })}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
        >
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Image
                    source={{ uri: f.avatar || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                                {f.firstName} {f.lastName}
                            </Text>
                            <Text style={[styles.profession, { color: c.subtext }]} numberOfLines={1}>
                                {f.jobTitle || 'Freelancer'}
                            </Text>
                        </View>
                        <Text style={[styles.rate, { color: c.text }]}>₦{f.hourlyRate || '5,000'}<Text style={{ fontSize: 11, color: c.subtext }}>/hr</Text></Text>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MaterialIcons name="star" size={16} color="#F59E0B" />
                            <Text style={[styles.metaText, { color: c.text }]}>{(f.rating || 0).toFixed(1)}</Text>
                        </View>
                        {f.location && (
                            <View style={styles.metaItem}>
                                <MaterialIcons name="place" size={14} color={c.subtext} />
                                <Text style={[styles.metaText, { color: c.subtext }]} numberOfLines={1}>{f.location}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.skillsRow}>
                {f.skills?.slice(0, 3).map((s: string, i: number) => (
                    <Text key={i} style={[styles.skill, { color: c.subtext, backgroundColor: c.isDark ? '#374151' : '#F3F4F6' }]}>
                        {s}
                    </Text>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.inviteBtn, { backgroundColor: c.primary }]}
                onPress={() => handleInvite(f)}
                disabled={isInviting === (f._id || f.id)}
            >
                {isInviting === (f._id || f.id) ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <>
                        <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
                        <Text style={styles.inviteBtnText}>Invite to Job</Text>
                    </>
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { color: c.text }]}>Invite Freelancers</Text>
                        {job && (
                            <Text style={[styles.headerSubtitle, { color: c.subtext }]} numberOfLines={1}>
                                For: {job.title}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchWrap}>
                    <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
                        <Ionicons name="search-outline" size={20} color={c.subtext} />
                        <TextInput
                            style={[styles.input, { color: c.text }]}
                            placeholder="Search freelancers..."
                            placeholderTextColor={c.subtext}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredFreelancers}
                    renderItem={renderFreelancerItem}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="people-outline" size={48} color={c.border} />
                            <Text style={{ color: c.subtext, marginTop: 12 }}>No freelancers found</Text>
                        </View>
                    }
                />
            </View>

            <SuccessModal
                visible={successModal.visible}
                title={successModal.title}
                message={successModal.message}
                onClose={() => setSuccessModal({ ...successModal, visible: false })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    searchWrap: {
        padding: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    profession: {
        fontSize: 13,
        marginTop: 2,
    },
    rate: {
        fontSize: 15,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '600',
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    skill: {
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        overflow: 'hidden',
    },
    inviteBtn: {
        marginTop: 16,
        height: 44,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    inviteBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
});

export default ClientRecommendedScreen;
