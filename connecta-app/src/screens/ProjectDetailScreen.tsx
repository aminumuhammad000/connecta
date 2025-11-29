import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { API_BASE_URL } from '../utils/constants';

const API_URL = `${API_BASE_URL}/api`;

export default function ProjectDetailScreen({ navigation, route }: any) {
    const c = useThemeColors();
    const { projectId } = route.params || { projectId: 'mock-id' };
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            // Simulate fetch
            setTimeout(() => {
                setProject({
                    _id: projectId,
                    title: 'E-commerce Website Redesign',
                    status: 'ongoing',
                    statusLabel: 'Ongoing',
                    clientName: 'John Doe',
                    clientVerified: true,
                    budget: { amount: 5000, currency: 'USD', type: 'fixed' },
                    summary: 'Redesign the homepage and product pages for better conversion.',
                    description: 'We need a modern look and feel...',
                    dateRange: { endDate: '2025-12-31' },
                    deliverables: ['Figma Designs', 'React Code', 'Documentation'],
                    activity: [
                        { date: '2025-11-01', description: 'Project started' }
                    ],
                    uploads: []
                });
                setLoading(false);
            }, 1000);

            // Real fetch would be:
            // const response = await fetch(`${API_URL}/projects/${projectId}`);
            // const data = await response.json();
            // if (data.success) setProject(data.data);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleChatClient = () => {
        navigation.navigate('Messages', {
            userName: project?.clientName
        });
    };

    const handleUpload = () => {
        Alert.alert('Upload', 'File upload functionality would open here.');
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    if (!project) {
        return (
            <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: c.text }}>Project not found</Text>
            </View>
        );
    }

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
                    <View style={[styles.statusBadge, { backgroundColor: project.status === 'ongoing' ? '#e6f7ff' : '#f6ffed' }]}>
                        <Text style={[styles.statusText, { color: project.status === 'ongoing' ? '#1890ff' : '#52c41a' }]}>
                            {project.statusLabel}
                        </Text>
                    </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Client:</Text>
                        <View style={styles.clientInfo}>
                            <Text style={[styles.infoValue, { color: c.text }]}>{project.clientName}</Text>
                            {project.clientVerified && <Ionicons name="checkmark-circle" size={16} color={c.primary} style={{ marginLeft: 4 }} />}
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Budget:</Text>
                        <Text style={[styles.infoValue, { color: c.text }]}>
                            ${project.budget.amount} {project.budget.currency} ({project.budget.type})
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.subtext }]}>Deadline:</Text>
                        <Text style={[styles.infoValue, { color: c.text }]}>{project.dateRange.endDate}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Summary</Text>
                    <Text style={[styles.sectionText, { color: c.subtext }]}>{project.summary}</Text>
                    {project.description && (
                        <Text style={[styles.sectionText, { color: c.subtext, marginTop: 8 }]}>{project.description}</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Deliverables</Text>
                    {project.deliverables.map((item: string, index: number) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="ellipse" size={8} color={c.primary} style={{ marginTop: 6, marginRight: 8 }} />
                            <Text style={[styles.listText, { color: c.text }]}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Activity</Text>
                    {project.activity.map((item: any, index: number) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={[styles.listText, { color: c.text }]}>
                                <Text style={{ fontWeight: 'bold' }}>{item.date}:</Text> {item.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {project.status === 'ongoing' && (
                    <TouchableOpacity
                        style={[styles.uploadButton, { borderColor: c.primary, borderStyle: 'dashed' }]}
                        onPress={handleUpload}
                    >
                        <Ionicons name="cloud-upload-outline" size={24} color={c.primary} />
                        <Text style={[styles.uploadButtonText, { color: c.primary }]}>Upload Deliverables</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.chatButton, { backgroundColor: c.primary }]}
                    onPress={handleChatClient}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.chatButtonText}>Chat with Client</Text>
                </TouchableOpacity>

            </ScrollView>
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
});
