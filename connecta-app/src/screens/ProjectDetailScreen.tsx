import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import projectService from '../services/projectService';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import { useInAppAlert } from '../components/InAppAlert';

export default function ProjectDetailScreen({ navigation, route }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    // Support both id and projectId params
    const projectId = route.params?.id || route.params?.projectId;
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submissionSummary, setSubmissionSummary] = useState('');
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionFeedback, setRevisionFeedback] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        } else {
            setError("No project ID provided");
            setLoading(false);
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjectById(projectId);
            setProject(data);
        } catch (error) {
            console.error(error);
            setError("Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth();
    const isClient = user?.userType === 'client';

    // Determine ownership
    const isProjectOwner = React.useMemo(() => {
        if (!project || !user) return false;
        // Project.clientId can be object or string
        const projectClientId = project.clientId?._id || project.clientId;
        return projectClientId === user._id;
    }, [project, user]);

    const handleChat = () => {
        if (isProjectOwner) {
            // Client chatting with Freelancer
            navigation.navigate('MessagesDetail', {
                receiverId: project.freelancerId?._id || project.freelancerId,
                userName: project.freelancerId?.firstName
                    ? `${project.freelancerId.firstName} ${project.freelancerId.lastName}`
                    : (project.freelancerName || 'Freelancer'),
                userAvatar: project.freelancerAvatar, // Optional
                projectId: project._id,
                clientId: project.clientId?._id || project.clientId,
                freelancerId: project.freelancerId?._id || project.freelancerId
            });
        } else {
            // Freelancer chatting with Client
            navigation.navigate('MessagesDetail', {
                receiverId: project.clientId?._id || project.clientId,
                userName: project.clientId?.firstName
                    ? `${project.clientId.firstName} ${project.clientId.lastName}`
                    : (project.clientName || 'Client'),
                userAvatar: project.clientAvatar, // Optional
                projectId: project._id,
                clientId: project.clientId?._id || project.clientId,
                freelancerId: project.freelancerId?._id || project.freelancerId
            });
        }
    };

    const handleApproveWork = async () => {
        Alert.alert('Approve Work', 'Are you satisfied with the work? This will release funds to the freelancer and mark the project as completed.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes, Approve & Release',
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        // Releases funds and marks as completed on backend
                        await projectService.acceptProjectSubmission(project._id);
                        
                        // If payment record exists and is in escrow, release it specifically if backend doesn't handle it automatically
                        // But our acceptProjectSubmission controller handles the status change and activity.
                        // Usually the backend should also trigger the payment release.
                        
                        showAlert({ title: 'Success', message: 'Work approved! Funds released.', type: 'success' });
                        fetchProjectDetails(); // Refresh
                    } catch (err: any) {
                        showAlert({ title: 'Error', message: err.message || 'Failed to approve work', type: 'error' });
                    } finally {
                        setActionLoading(false);
                    }
                }
            }
        ]);
    };

    const handleConfirmSubmit = async () => {
        if (!submissionSummary.trim()) {
            showAlert({ title: 'Error', message: 'Please provide a summary of your work.', type: 'error' });
            return;
        }

        try {
            setActionLoading(true);
            await projectService.submitProject(project._id, {
                summary: submissionSummary,
                files: [] // In a full implementation, files from uploads section would be here
            });
            setShowSubmitModal(false);
            setSubmissionSummary('');
            showAlert({ title: 'Success', message: 'Work submitted for review!', type: 'success' });
            fetchProjectDetails();
        } catch (err: any) {
            showAlert({ title: 'Error', message: err.message || 'Failed to submit work', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmRevision = async () => {
        if (!revisionFeedback.trim()) {
            showAlert({ title: 'Error', message: 'Please provide feedback for the revision.', type: 'error' });
            return;
        }

        try {
            setActionLoading(true);
            await projectService.requestRevision(project._id, revisionFeedback);
            setShowRevisionModal(false);
            setRevisionFeedback('');
            showAlert({ title: 'Success', message: 'Revision requested.', type: 'success' });
            fetchProjectDetails();
        } catch (err: any) {
            showAlert({ title: 'Error', message: err.message || 'Failed to request revision', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndContract = () => {
        Alert.alert('End Contract', 'Are you sure you want to end this contract? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End Contract',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        await projectService.updateProjectStatus(project._id, 'completed');
                        showAlert({ title: 'Success', message: 'Contract ended.', type: 'success' });
                        // Optionally navigate to review screen
                        navigation.navigate('ClientWriteReview', {
                            projectId: project._id,
                            revieweeId: project.freelancerId?._id || project.freelancerId,
                            projectTitle: project.title,
                            freelancerName: project.freelancerName || (project.freelancerId?.firstName ? `${project.freelancerId.firstName} ${project.freelancerId.lastName}` : 'Freelancer'),
                            freelancerAvatar: project.freelancerAvatar || project.freelancerId?.profileImage
                        });
                    } catch (err: any) {
                        showAlert({ title: 'Error', message: err.message || 'Failed to end contract', type: 'error' });
                    } finally {
                        setActionLoading(false);
                        fetchProjectDetails();
                    }
                }
            }
        ]);
    };

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            if (!asset) return;

            setActionLoading(true);

            // 1. Upload file
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            } as any);

            const uploadResponse = await uploadFile(API_ENDPOINTS.UPLOAD_FILE, formData);
            const fileUrl = uploadResponse.data?.url;

            if (!fileUrl) throw new Error("File upload failed to return URL");

            if (!user) return;

            // 2. Attach to project
            await projectService.uploadProjectFile(project._id, {
                fileName: asset.name,
                fileUrl: fileUrl,
                fileType: asset.mimeType || 'unknown',
                uploadedBy: user._id
            });

            showAlert({ title: 'Success', message: 'Deliverables uploaded successfully!', type: 'success' });
            fetchProjectDetails();
        } catch (err: any) {
            console.error(err);
            showAlert({ title: 'Error', message: err.message || 'Upload failed', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Check if funds are in escrow
    const fundsInEscrow = project?.payment?.escrowStatus === 'held';
    const canRelease = fundsInEscrow && isProjectOwner;

    if (loading) {
        return (
            <SafeAreaView style={[styles.loadingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </SafeAreaView>
        );
    }

    if (error || !project) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: c.text, marginBottom: 12 }}>{error || 'Project not found'}</Text>
                <TouchableOpacity onPress={fetchProjectDetails} style={[styles.retryBtn, { backgroundColor: c.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: c.primary }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Safely access properties as they might vary
    const budgetAmount = project.budget?.amount || project.budget || 0;
    const budgetCurrency = project.budget?.currency || '₦';
    const budgetType = project.budget?.type || 'fixed';

    // Format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Project Detail</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.projectTitle, { color: c.text }]}>{project.title}</Text>

                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: 
                            project.status === 'ongoing' ? '#e6f7ff' : 
                            project.status === 'completed' ? '#f6ffed' : 
                            project.status === 'submitted' ? '#fff7e6' :
                            project.status === 'revision_requested' ? '#fff1f0' :
                            '#fff1f0' 
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: 
                                project.status === 'ongoing' ? '#1890ff' : 
                                project.status === 'completed' ? '#52c41a' : 
                                project.status === 'submitted' ? '#faad14' :
                                project.status === 'revision_requested' ? '#f5222d' :
                                '#f5222d' 
                        }]}>
                            {project.statusLabel || project.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>{isProjectOwner ? 'Freelancer:' : 'Client:'}</Text>
                        <TouchableOpacity
                            style={styles.clientInfo}
                            onPress={() => {
                                if (isProjectOwner) {
                                    // Client viewing Freelancer
                                    const fid = project.freelancerId?._id || project.freelancerId;
                                    if (fid) navigation.navigate('FreelancerPublicProfile', { id: fid });
                                } else {
                                    // Freelancer viewing Client
                                    const cid = project.clientId?._id || project.clientId;
                                    if (cid) navigation.navigate('ClientProfile', { userId: cid });
                                }
                            }}
                        >
                            <Text style={[styles.infoValue, { color: c.primary, textDecorationLine: 'underline' }]}>
                                {isProjectOwner ? (project.freelancerName || 'Freelancer') : project.clientName}
                            </Text>
                            {project.clientVerified && !isProjectOwner && <Ionicons name="checkmark-circle" size={16} color={c.primary} style={{ marginLeft: 4 }} />}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Budget:</Text>
                        <Text style={[styles.infoValue, { color: c.text }]}>
                            {budgetCurrency}{budgetAmount} ({budgetType})
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Payment Status:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons
                                name={project.payment?.escrowStatus === 'held' ? "lock-closed" : "ellipse"}
                                size={14}
                                color={project.payment?.escrowStatus === 'held' ? "#10B981" : (project.payment?.status === 'completed' ? "#10B981" : "#F59E0B")}
                            />
                            <Text style={[styles.infoValue, { color: c.text }]}>
                                {project.payment?.escrowStatus === 'held' ? 'Escrow Funded' : (project.payment?.status === 'completed' ? 'Paid' : 'Pending')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Start Date:</Text>
                        <Text style={[styles.infoValue, { color: c.text }]}>{formatDate(project.dateRange?.startDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Deadline:</Text>
                        <Text style={[styles.infoValue, { color: c.text }]}>{formatDate(project.dateRange?.endDate)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Summary</Text>
                    <Text style={[styles.sectionText, { color: c.subtext }]}>{project.summary}</Text>
                    {project.description && (
                        <Text style={[styles.sectionText, { color: c.subtext, marginTop: 8 }]}>{project.description}</Text>
                    )}
                </View>

                {project.deliverables && project.deliverables.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Deliverables</Text>
                        {project.deliverables.map((item: string, index: number) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="ellipse" size={8} color={c.primary} style={{ marginTop: 6, marginRight: 8 }} />
                                <Text style={[styles.listText, { color: c.text }]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {project.activity && project.activity.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Activity</Text>
                        {project.activity.slice(-5).reverse().map((item: any, index: number) => (
                            <View key={index} style={styles.listItem}>
                                <Text style={[styles.listText, { color: c.text }]}>
                                    <Text style={{ fontWeight: 'bold' }}>{formatDate(item.date)}:</Text> {item.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {project.submission && (
                    <View style={[styles.section, styles.submissionBox, { backgroundColor: c.isDark ? '#1E293B' : '#F1F5F9', borderColor: c.border }]}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Submission Details</Text>
                        <Text style={[styles.infoLabel, { color: c.subtext, marginBottom: 4 }]}>Submitted On: {formatDate(project.submission.submittedAt)}</Text>
                        <Text style={[styles.sectionText, { color: c.text, fontWeight: '500' }]}>{project.submission.summary}</Text>
                        
                        {project.submission.files && project.submission.files.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={[styles.infoLabel, { color: c.subtext, marginBottom: 8 }]}>Attached Files:</Text>
                                {project.submission.files.map((file: any, index: number) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.fileItem}
                                        onPress={() => Linking.openURL(file.fileUrl)}
                                    >
                                        <Ionicons name="document-attach" size={16} color={c.primary} />
                                        <Text style={[styles.fileText, { color: c.primary }]}>{file.fileName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {project.status === 'revision_requested' && (
                    <View style={[styles.section, styles.revisionBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.sectionTitle, { color: '#D97706' }]}>Revision Requested</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Ionicons name="alert-circle" size={20} color="#D97706" />
                            <Text style={{ color: '#92400E', flex: 1 }}>
                                The client has requested changes to the submitted work. Please review the feedback and resubmit.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Freelancer Actions: Upload & Submit */}
                {!isProjectOwner && (project.status === 'ongoing' || project.status === 'submitted' || project.status === 'revision_requested') && (
                    <View style={{ gap: 12, marginBottom: 16 }}>
                        {(project.status === 'ongoing' || project.status === 'revision_requested') && (
                            <>
                                <TouchableOpacity
                                    style={[styles.uploadButton, { borderColor: c.primary, borderStyle: 'dashed', marginBottom: 0 }]}
                                    onPress={handleUpload}
                                >
                                    <Ionicons name="cloud-upload-outline" size={24} color={c.primary} />
                                    <Text style={[styles.uploadButtonText, { color: c.primary }]}>Upload Deliverables</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chatButton, { backgroundColor: c.primary, opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={() => setShowSubmitModal(true)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={20} color="white" style={{ marginRight: 8 }} />}
                                    <Text style={styles.chatButtonText}>Submit Work</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {project.status === 'submitted' && (
                            <View style={{ padding: 16, backgroundColor: '#FFFBEB', borderRadius: 8, alignItems: 'center' }}>
                                <Text style={{ color: '#D97706', fontWeight: '600' }}>Work submitted for review.</Text>
                                <Text style={{ color: '#D97706', fontSize: 12 }}>Waiting for client approval.</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Client Actions: Payment & End Contract */}
                {isProjectOwner && (project.status === 'ongoing' || project.status === 'submitted' || project.status === 'revision_requested') && (
                    <View style={{ gap: 12, marginBottom: 16 }}>
                        {/* If Submitted, show Approve/Reject */}
                        {project.status === 'submitted' && (
                            <>
                                <View style={{ padding: 12, backgroundColor: '#EFF6FF', borderRadius: 8, marginBottom: 8 }}>
                                    <Text style={{ color: '#1E40AF', fontSize: 14 }}>Freelancer has submitted work. Please review and approve.</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.chatButton, { backgroundColor: '#10B981', opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={handleApproveWork}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />}
                                    <Text style={styles.chatButtonText}>Satisfied (Approve & Release)</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chatButton, { backgroundColor: '#F59E0B', opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={() => setShowRevisionModal(true)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />}
                                    <Text style={styles.chatButtonText}>Request Revision</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* If Ongoing, allow manual release or end */}
                        {project.status === 'ongoing' && (
                            <>
                                {canRelease && (
                                    <TouchableOpacity
                                        style={[styles.chatButton, { backgroundColor: '#059669', opacity: actionLoading ? 0.7 : 1 }]}
                                        onPress={handleApproveWork}
                                        disabled={actionLoading}
                                    >
                                        <Text style={styles.chatButtonText}>Release Payment</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.chatButton, { backgroundColor: '#EF4444', opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={handleEndContract}
                                    disabled={actionLoading}
                                >
                                    <Text style={styles.chatButtonText}>End Contract</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.chatButton, { backgroundColor: c.primary }]}
                    onPress={handleChat}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.chatButtonText}>{isProjectOwner ? 'Chat with Freelancer' : 'Chat with Client'}</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Submission Modal */}
            <Modal
                visible={showSubmitModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSubmitModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.card }]}>
                        <Text style={[styles.modalTitle, { color: c.text }]}>Submit Project</Text>
                        <Text style={[styles.modalLabel, { color: c.subtext }]}>Upload final files, add a short summary, and submit for client review.</Text>
                        
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
                            placeholder="Add a short summary of what you've completed..."
                            placeholderTextColor={c.subtext}
                            multiline
                            numberOfLines={4}
                            value={submissionSummary}
                            onChangeText={setSubmissionSummary}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: c.border }]} 
                                onPress={() => {
                                    setShowSubmitModal(false);
                                    setSubmissionSummary('');
                                }}
                            >
                                <Text style={[styles.modalButtonText, { color: c.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: c.primary }]} 
                                onPress={handleConfirmSubmit}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Submit as Completed</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Revision Modal */}
            <Modal
                visible={showRevisionModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRevisionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.card }]}>
                        <Text style={[styles.modalTitle, { color: c.text }]}>Request Revision</Text>
                        <Text style={[styles.modalLabel, { color: c.subtext }]}>The freelancer has submitted the project. Ask for changes if needed.</Text>
                        
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
                            placeholder="Describe what needs to be changed..."
                            placeholderTextColor={c.subtext}
                            multiline
                            numberOfLines={4}
                            value={revisionFeedback}
                            onChangeText={setRevisionFeedback}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: c.border }]} 
                                onPress={() => {
                                    setShowRevisionModal(false);
                                    setRevisionFeedback('');
                                }}
                            >
                                <Text style={[styles.modalButtonText, { color: c.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: '#F59E0B' }]} 
                                onPress={handleConfirmRevision}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Request Revision</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    listText: {
        fontSize: 16,
    },
    uploadButton: {
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        padding: 24,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalLabel: {
        fontSize: 14,
        lineHeight: 20,
    },
    modalInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        height: 120,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    submissionBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    revisionBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    fileText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
