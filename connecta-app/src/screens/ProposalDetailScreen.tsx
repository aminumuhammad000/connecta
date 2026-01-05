import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProposalDetailScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params as { id: string };
    const [proposal, setProposal] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        loadProposalDetails();
    }, [id]);

    const loadProposalDetails = async () => {
        try {
            setIsLoading(true);
            const data = await import('../services/proposalService').then(m => m.default.getProposalById(id));
            setProposal(data);
        } catch (error) {
            console.error('Error loading proposal details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
            </SafeAreaView>
        );
    }

    if (!proposal) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: c.text }}>Proposal not found</Text>
            </SafeAreaView>
        );
    }

    // Destructure properties
    const { jobId, clientId, budget, dateRange, coverLetter, description, createdAt, status } = proposal;

    // Fallbacks for missing populated data
    const jobTitle = jobId?.title || proposal.title || 'Untitled Job';

    // Client Info strategy: 
    // 1. Direct clientId (if proposal has it)
    // 2. jobId.clientId (deep populated)
    const clientSource = clientId || jobId?.clientId;
    const clientName = clientSource ? `${clientSource.firstName} ${clientSource.lastName}` : 'Unknown Client';
    const clientLocation = clientSource?.location || 'Location not specified';
    const clientAvatar = clientSource?.profileImage;

    // Budget & Duration
    const displayRate = budget?.amount ? budget.amount : (proposal.proposedRate || 0);
    const displayDuration = dateRange
        ? Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) + ' weeks'
        : (proposal.estimatedDuration || 'N/A');
    const displayCoverLetter = description || coverLetter || 'No cover letter provided.';

    const statusColors = {
        accepted: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
        pending: { bg: 'rgba(253,103,48,0.25)', text: '#FD6730' },
        rejected: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
        withdrawn: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
    };

    const statusStyle = statusColors[status as keyof typeof statusColors] || statusColors.pending;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Top App Bar */}
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Proposal Details</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialIcons name="more-vert" size={22} color={c.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    {/* Status Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                        </View>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>Submitted on {new Date(createdAt).toLocaleDateString()}</Text>
                    </View>

                    {/* Job Title */}
                    <Text style={[styles.title, { color: c.text }]}>{jobTitle}</Text>

                    {/* Client Info */}
                    <TouchableOpacity
                        style={[styles.clientCard, { borderColor: c.border, backgroundColor: c.card }]}
                        onPress={() => {
                            if (clientSource?._id) {
                                (navigation as any).navigate('ClientProfile', {
                                    userId: clientSource._id,
                                    initialUser: {
                                        name: clientName,
                                        avatar: clientAvatar,
                                        location: clientLocation,
                                        isPremium: clientSource?.isPremium,
                                        paymentVerified: clientSource?.paymentVerified
                                    }
                                });
                            }
                        }}
                    >
                        {clientAvatar ? (
                            <Image source={{ uri: clientAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{clientName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[styles.clientName, { color: c.text }]}>{clientName}</Text>
                                {clientSource?.isPremium && (
                                    <MaterialIcons name="verified" size={16} color="#F59E0B" />
                                )}
                            </View>
                            <Text style={{ color: c.subtext, fontSize: 11 }}>{clientLocation}</Text>
                            {clientSource?.paymentVerified && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                                    <MaterialIcons name="verified-user" size={12} color="#22C55E" />
                                    <Text style={{ color: '#22C55E', fontSize: 10, fontWeight: '600' }}>Payment Verified</Text>
                                </View>
                            )}
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                    </TouchableOpacity>

                    {/* Proposal Details */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Your Proposal</Text>

                        {/* Budget & Timeline */}
                        <View style={[styles.infoGrid, { borderTopColor: c.border, borderBottomColor: c.border }]}>
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Your Bid</Text>
                                <Text style={[styles.infoValue, { color: c.text }]}>${displayRate}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Timeline</Text>
                                <Text style={[styles.infoValue, { color: c.text }]}>{displayDuration}</Text>
                            </View>
                        </View>

                        {/* Cover Letter */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Cover Letter</Text>
                            <Text style={{ color: c.subtext, lineHeight: 20, fontSize: 13, marginTop: 8 }}>
                                {displayCoverLetter}
                            </Text>
                        </View>

                        {/* Attachments (Placeholder if we had them) */}
                        {/* 
                        <View style={{ marginTop: 16 }}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Attachments</Text>
                             ... 
                        </View> 
                        */}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed CTA */}
            <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
                {status === 'pending' && (
                    <TouchableOpacity style={[styles.secondaryBtn, { borderColor: c.border }]}>
                        <Text style={[styles.secondaryBtnText, { color: c.text }]}>Edit Proposal</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: c.primary }]}
                    onPress={() => {
                        const targetClientId = typeof clientSource === 'object' ? clientSource?._id : clientSource;
                        const targetProjectId = typeof jobId === 'object' ? jobId?._id : jobId;

                        if (targetClientId) {
                            (navigation as any).navigate('MessagesDetail', {
                                receiverId: targetClientId,
                                userName: clientName,
                                userAvatar: clientAvatar,
                                projectId: targetProjectId || id, // Fallback to proposal ID if job ID missing (shouldn't happen)
                                clientId: targetClientId,
                            });
                        }
                    }}
                >
                    <Text style={styles.primaryBtnText}>Message Client</Text>
                </TouchableOpacity>
            </View>
            {(status === 'accepted' || status === 'approved') && (
                <View style={{ position: 'absolute', bottom: 80, left: 16, right: 16 }}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: c.text, height: 48 }]}
                        onPress={() => (navigation as any).navigate('ProjectDetail', { id: jobId?._id || jobId })}
                    >
                        <MaterialIcons name="work" size={20} color={c.background} style={{ marginRight: 8 }} />
                        <Text style={[styles.primaryBtnText, { color: c.background }]}>Go to Project Workspace</Text>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView >
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

    statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },

    title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2, marginBottom: 16 },

    clientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    clientName: { fontSize: 14, fontWeight: '600' },

    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

    infoGrid: {
        marginTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: { width: '50%', paddingVertical: 14 },
    infoLabel: { fontSize: 11, fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

    attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    attachmentLabel: { flex: 1, fontSize: 13, fontWeight: '500' },

    ctaBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        gap: 12,
    },
    primaryBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    secondaryBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    secondaryBtnText: { fontSize: 15, fontWeight: '600' },
});

export default ProposalDetailScreen;
