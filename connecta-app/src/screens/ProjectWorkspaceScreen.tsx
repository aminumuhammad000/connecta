import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import projectService from '../services/projectService';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

const ProjectWorkspaceScreen = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { id, projectId: paramProjectId } = route.params || {};
    const projectId = id || paramProjectId;

    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'deliverables'>('overview');

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProjectById(projectId);
            setProject(data);
        } catch (error) {
            console.error('Error fetching project:', error);
            Alert.alert('Error', 'Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const isClient = user?.userType === 'client';
    const isProjectOwner = React.useMemo(() => {
        if (!project || !user) return false;
        const clientId = project.clientId?._id || project.clientId;
        return clientId === user._id;
    }, [project, user]);

    // Actions
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

            // Upload
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            } as any);

            const uploadResponse = await uploadFile(API_ENDPOINTS.UPLOAD_FILE, formData);
            const fileUrl = uploadResponse.data?.url;

            if (!fileUrl) throw new Error("Upload failed");

            // Attach
            await projectService.uploadProjectFile(project._id, {
                fileName: asset.name,
                fileUrl: fileUrl,
                fileType: asset.mimeType || 'unknown',
                uploadedBy: user?._id
            });

            Alert.alert('Success', 'File uploaded successfully');
            fetchProjectDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Upload failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitWork = async () => {
        Alert.alert('Submit Work', 'Ready to submit your work for review?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Submit', onPress: async () => {
                    try {
                        setActionLoading(true);
                        await projectService.submitProject(project._id);
                        Alert.alert('Success', 'Project submitted for review');
                        fetchProjectDetails();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to submit work');
                    } finally {
                        setActionLoading(false);
                    }
                }
            }
        ]);
    };

    const handleApprove = async () => {
        Alert.alert('Approve Project', 'Are you satisfied with the work? This will release the funds.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve & Pay', onPress: async () => {
                    try {
                        setActionLoading(true);
                        if (project.payment?.escrowStatus === 'held') {
                            await paymentService.releasePayment(project.payment._id);
                        }
                        await projectService.updateProjectStatus(project._id, 'completed');
                        Alert.alert('Success', 'Project approved and funds released');
                        fetchProjectDetails();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to approve project');
                    } finally {
                        setActionLoading(false);
                    }
                }
            }
        ]);
    };

    const handleChat = () => {
        const receiver = isProjectOwner ? project.freelancerId : project.clientId;
        (navigation as any).navigate('MessagesDetail', {
            receiverId: receiver?._id || receiver,
            userName: receiver?.firstName ? `${receiver.firstName} ${receiver.lastName}` : 'User',
            userAvatar: receiver?.profileImage,
            projectId: project._id
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    if (!project) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Workspace</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <MaterialIcons name="error-outline" size={64} color={c.subtext} />
                    <Text style={{ color: c.text, fontSize: 18, marginTop: 16, fontWeight: '600' }}>Project Not Found</Text>
                    <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                        The project ID "{projectId}" does not exist or you do not have permission to view it.
                    </Text>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: c.primary, marginTop: 24, paddingHorizontal: 24 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.btnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'submitted': return '#F59E0B';
            case 'ongoing': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>{project.title}</Text>
                    <Text style={{ color: getStatusColor(project.status), fontSize: 12, fontWeight: '600' }}>
                        {project.statusLabel || project.status.toUpperCase()}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleChat} style={[styles.chatBtn, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={c.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: c.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && { borderBottomColor: c.primary }]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'overview' ? c.primary : c.subtext }]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'deliverables' && { borderBottomColor: c.primary }]}
                    onPress={() => setActiveTab('deliverables')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'deliverables' ? c.primary : c.subtext }]}>Deliverables & Files</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'overview' ? (
                    <View style={{ gap: 20 }}>
                        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Project Brief</Text>
                            <Text style={{ color: c.subtext, lineHeight: 22 }}>{project.description}</Text>
                        </View>

                        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Timeline & Budget</Text>
                            <View style={styles.row}>
                                <View>
                                    <Text style={{ color: c.subtext, fontSize: 12 }}>Budget</Text>
                                    <Text style={{ color: c.text, fontWeight: '600' }}>${project.budget?.amount}</Text>
                                </View>
                                <View>
                                    <Text style={{ color: c.subtext, fontSize: 12 }}>Deadline</Text>
                                    <Text style={{ color: c.text, fontWeight: '600' }}>{new Date(project.dateRange?.endDate).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ gap: 12 }}>
                            {!isProjectOwner && project.status === 'ongoing' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: c.primary, opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={handleSubmitWork}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Work</Text>}
                                </TouchableOpacity>
                            )}

                            {isProjectOwner && project.status === 'submitted' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#10B981', opacity: actionLoading ? 0.7 : 1 }]}
                                    onPress={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Approve & Release Funds</Text>}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={{ gap: 16 }}>
                        <TouchableOpacity
                            style={[styles.uploadBox, { borderColor: c.primary, backgroundColor: c.card }]}
                            onPress={handleUpload}
                        >
                            <Ionicons name="cloud-upload-outline" size={32} color={c.primary} />
                            <Text style={{ color: c.primary, fontWeight: '600', marginTop: 8 }}>Upload File</Text>
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: c.text }]}>Files ({project.uploads?.length || 0})</Text>
                        {project.uploads?.map((item: any, i: number) => (
                            <View key={i} style={[styles.fileItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="description" size={24} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text style={{ color: c.text, fontWeight: '500' }}>{item.fileName}</Text>
                                        <Text style={{ color: c.subtext, fontSize: 12 }}>{new Date(item.uploadedAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="download" size={20} color={c.subtext} />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 4 },
    chatBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    tabs: { flexDirection: 'row', borderBottomWidth: 1 },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText: { fontWeight: '600', fontSize: 14 },
    content: { padding: 20 },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    actionBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    uploadBox: { height: 120, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
});

export default ProjectWorkspaceScreen;
