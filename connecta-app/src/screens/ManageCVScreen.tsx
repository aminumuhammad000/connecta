import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useInAppAlert } from '../components/InAppAlert';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as profileService from '../services/profileService';
import { WebView } from 'react-native-webview';
import { getToken } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ManageCVScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();

    const [importingResume, setImportingResume] = useState(false);
    const [parsedResumeData, setParsedResumeData] = useState<any>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);

    // Preview State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewAuthToken, setPreviewAuthToken] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    const handlePreviewResume = async () => {
        try {
            const API_URL = API_BASE_URL;
            showAlert({ title: 'Processing', message: 'Preparing document preview...', type: 'info' });

            const resumeUrl = await profileService.downloadResume();
            if (!resumeUrl) throw new Error("Could not get resume URL");

            const fullUrl = `${API_URL}${resumeUrl}`;
            const token = await getToken();

            setPreviewUrl(fullUrl);
            setPreviewAuthToken(token);

            if (Platform.OS === 'web') {
                const response = await fetch(fullUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                setShowPreviewModal(true);
            } else if (Platform.OS === 'android') {
                // Android WebView doesn't support PDF. Download and open instead.
                const fileUri = `${FileSystem.cacheDirectory}Connecta_Resume_Preview.pdf`;
                const downloadRes = await FileSystem.downloadAsync(
                    fullUrl,
                    fileUri,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (downloadRes.status === 200) {
                    await Sharing.shareAsync(downloadRes.uri, {
                        mimeType: 'application/pdf',
                        UTI: 'com.adobe.pdf'
                    });
                } else {
                    throw new Error("Failed to download preview");
                }
            } else {
                // iOS handles PDF in WebView natively
                setShowPreviewModal(true);
            }

        } catch (error: any) {
            console.error('Preview error:', error);
            showAlert({ title: 'Error', message: 'Failed to preview resume', type: 'error' });
        }
    };

    const handleDownloadFile = async () => {
        if (!previewUrl) return;

        if (Platform.OS === 'web' && blobUrl) {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'Connecta_Verified_Resume.pdf';
            link.click();
            showAlert({ title: 'Success', message: 'Resume download started!', type: 'success' });
            return;
        }

        try {
            showAlert({ title: 'Downloading', message: 'Saving resume to your device...', type: 'info' });

            const fileUri = `${FileSystem.documentDirectory}Connecta_Verified_Resume.pdf`;
            console.log('Downloading resume from:', previewUrl);

            const downloadRes = await FileSystem.downloadAsync(
                previewUrl,
                fileUri,
                {
                    headers: {
                        'Authorization': `Bearer ${previewAuthToken}`
                    }
                }
            );

            if (downloadRes.status !== 200) {
                console.error('Download server error:', downloadRes.status);
                throw new Error(`Failed to download (Server error: ${downloadRes.status})`);
            }

            console.log('File saved to:', downloadRes.uri);

            if (!(await Sharing.isAvailableAsync())) {
                showAlert({ title: 'Error', message: 'Sharing/Saving is not available on this device', type: 'error' });
                return;
            }

            await Sharing.shareAsync(downloadRes.uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Your Connecta Verified Resume',
                UTI: 'com.adobe.pdf'
            });

            showAlert({ title: 'Success', message: 'Resume saved!', type: 'success' });

        } catch (error: any) {
            console.error('Download error:', error);
            showAlert({ title: 'Error', message: `Download failed: ${error.message || 'Unknown error'}`, type: 'error' });
        }
    };

    const handleImportResume = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            if (!asset) return;

            setImportingResume(true);
            showAlert({ title: 'Processing', message: 'Analyzing your resume with AI...', type: 'info' });

            const formData = new FormData();
            if (Platform.OS === 'web') {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                const file = new File([blob], asset.name, { type: asset.mimeType || 'application/pdf' });
                formData.append('resume', file);
            } else {
                formData.append('resume', {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/pdf',
                } as any);
            }

            const parsedData = await profileService.parseResume(formData);

            if (parsedData) {
                setParsedResumeData(parsedData);
                setShowResumeModal(true);
                showAlert({ title: 'Success', message: 'Resume analyzed! Review the data below.', type: 'success' });
            }

        } catch (error: any) {
            console.error('Resume import error:', error);
            const errorMessage = error.message || error.error || (typeof error === 'string' ? error : 'Unknown error');
            showAlert({ title: 'Error', message: 'Failed to parse resume: ' + errorMessage, type: 'error' });
        } finally {
            setImportingResume(false);
        }
    };

    const applyParsedResume = async () => {
        if (!parsedResumeData) return;

        try {
            console.log('Original Parsed Data:', parsedResumeData);

            // Explicitly map LLM keys to Backend Profile keys
            const mappedProfileData = {
                // Personal Info
                firstName: parsedResumeData.firstName,
                lastName: parsedResumeData.lastName,
                phoneNumber: parsedResumeData.phone || parsedResumeData.phoneNumber,
                location: parsedResumeData.location,
                bio: parsedResumeData.bio,

                // Professional Info
                jobTitle: parsedResumeData.jobTitle,
                skills: parsedResumeData.skills || [],

                // History (Map 'title' from AI to 'position' for Backend)
                // Fix: Ensure startDate is present for Mongoose validation
                // History (Map 'title' from AI to 'position' for Backend)
                education: (parsedResumeData.education || []).map((edu: any) => {
                    const isValidStartDate = edu.startDate && !isNaN(new Date(edu.startDate).getTime());
                    let finalEndDate = undefined;

                    if (edu.endDate === 'Present') {
                        finalEndDate = undefined; // Current logic treats undefined as 'Present'
                    } else if (edu.endDate && !isNaN(new Date(edu.endDate).getTime())) {
                        finalEndDate = new Date(edu.endDate).toISOString();
                    }

                    return {
                        institution: edu.institution || 'Unknown Institution',
                        degree: edu.degree || 'Certificate',
                        fieldOfStudy: edu.fieldOfStudy || 'General',
                        startDate: isValidStartDate ? new Date(edu.startDate).toISOString() : new Date().toISOString(),
                        endDate: finalEndDate,
                        description: edu.description || ''
                    };
                }),

                employment: (parsedResumeData.employment || []).map((job: any) => {
                    const isValidStartDate = job.startDate && !isNaN(new Date(job.startDate).getTime());
                    let finalEndDate = undefined;

                    if (job.endDate === 'Present') {
                        finalEndDate = undefined;
                    } else if (job.endDate && !isNaN(new Date(job.endDate).getTime())) {
                        finalEndDate = new Date(job.endDate).toISOString();
                    }

                    return {
                        company: job.company || 'Unknown Company',
                        position: job.position || job.title || 'Team Member',
                        startDate: isValidStartDate ? new Date(job.startDate).toISOString() : new Date().toISOString(),
                        endDate: finalEndDate,
                        description: job.description || ''
                    };
                }),

                // Ensure we don't accidentally wipe existing fields if new data is empty
                ...((parsedResumeData.website) && { website: parsedResumeData.website }),
            };

            console.log('🚀 Sending Mapped Payload to Backend:', JSON.stringify(mappedProfileData, null, 2));

            if (!mappedProfileData.firstName || !mappedProfileData.lastName) {
                console.warn('⚠️ Warning: Name is missing from parsed data!', parsedResumeData);
            }
            if (mappedProfileData.education.length === 0 && mappedProfileData.employment.length === 0) {
                showAlert({ title: 'Warning', message: 'No education or employment found in resume. Please check the file.', type: 'warning' });
            }

            showAlert({ title: 'Saving', message: 'Updating your profile...', type: 'info' });

            await profileService.updateMyProfile(mappedProfileData);

            setShowResumeModal(false);
            setParsedResumeData(null);

            showAlert({ title: 'Success', message: 'Profile updated from resume!', type: 'success' });
        } catch (error: any) {
            console.error('Error applying resume data:', error);
            showAlert({ title: 'Error', message: 'Failed to update profile', type: 'error' });
        }
    };

    const renderResumeSection = (title: string, data: any[], renderItem: (item: any, index: number) => React.ReactNode) => {
        if (!data || data.length === 0) return null;
        return (
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 }}>{title}</Text>
                {data.map(renderItem)}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Manage CV</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Feature 1: Smart Import */}
                <Card variant="outlined" style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: c.primary + '15' }]}>
                            <MaterialIcons name="auto-fix-high" size={28} color={c.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={[styles.cardTitle, { color: c.text }]}>Smart Import</Text>
                            <Text style={[styles.cardSubtitle, { color: c.subtext }]}>
                                Upload your PDF resume and let our AI automatically fill your profile details.
                            </Text>
                        </View>
                    </View>
                    <Button
                        title={importingResume ? "Analyzing..." : "Import from PDF"}
                        onPress={handleImportResume}
                        disabled={importingResume}
                        style={{ marginTop: 16 }}
                    />
                </Card>

                {/* Feature 2: Verified Resume (Placeholder) */}
                <Card variant="outlined" style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '15' }]}>
                            <Ionicons name="shield-checkmark" size={28} color="#10B981" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={[styles.cardTitle, { color: c.text }]}>Verified Resume</Text>
                            <Text style={[styles.cardSubtitle, { color: c.subtext }]}>
                                Download a professionally designed, verified version of your Connecta profile.
                            </Text>
                        </View>
                    </View>
                    <Button
                        title="Preview & Download"
                        variant="outline"
                        onPress={handlePreviewResume}
                        style={{ marginTop: 16 }}
                    />
                </Card>

                {/* Feature 3: Video Cover Letter (Placeholder) */}
                <Card variant="outlined" style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' + '15' }]}>
                            <Ionicons name="videocam" size={28} color="#F59E0B" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={[styles.cardTitle, { color: c.text }]}>Video Intro</Text>
                            <Text style={[styles.cardSubtitle, { color: c.subtext }]}>
                                Record a 60-second video introduction to stand out to potential clients.
                            </Text>
                        </View>
                    </View>
                    <Button
                        title="Record Video"
                        variant="outline"
                        onPress={() => Alert.alert('Coming Soon', 'This feature will be available shortly!')}
                        style={{ marginTop: 16 }}
                    />
                </Card>

            </ScrollView>

            {/* Resume Review Modal */}
            <Modal visible={showResumeModal} animationType="slide" transparent>
                <View style={[styles.modalOverlay]}>
                    <View style={[styles.modalContent, { backgroundColor: c.card, maxHeight: '85%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={[styles.modalTitle, { color: c.text, marginBottom: 0 }]}>Resume Data Found</Text>
                            <TouchableOpacity onPress={() => setShowResumeModal(false)}>
                                <Ionicons name="close" size={24} color={c.subtext} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ marginBottom: 16 }} showsVerticalScrollIndicator={false}>
                            <Text style={{ color: c.subtext, marginBottom: 16 }}>
                                We extracted the following information. Please review before applying.
                            </Text>

                            {/* Info Section */}
                            <View style={[styles.sectionContainer, { backgroundColor: c.background }]}>
                                <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Info</Text>
                                {parsedResumeData?.firstName && <Text style={[styles.dataText, { color: c.text }]}>Name: {parsedResumeData.firstName} {parsedResumeData.lastName}</Text>}
                                {parsedResumeData?.email && <Text style={[styles.dataText, { color: c.text }]}>Email: {parsedResumeData.email}</Text>}
                                {parsedResumeData?.phone && <Text style={[styles.dataText, { color: c.text }]}>Phone: {parsedResumeData.phone}</Text>}
                                {parsedResumeData?.location && <Text style={[styles.dataText, { color: c.text }]}>Location: {parsedResumeData.location}</Text>}
                                {parsedResumeData?.jobTitle && <Text style={[styles.dataText, { color: c.text }]}>Title: {parsedResumeData.jobTitle}</Text>}
                            </View>

                            {/* Bio */}
                            {parsedResumeData?.bio && (
                                <View style={[styles.sectionContainer, { backgroundColor: c.background }]}>
                                    <Text style={[styles.sectionTitle, { color: c.text }]}>Bio</Text>
                                    <Text style={{ color: c.subtext, fontStyle: 'italic' }}>{parsedResumeData.bio}</Text>
                                </View>
                            )}

                            {/* Skills */}
                            {parsedResumeData?.skills?.length > 0 && (
                                <View style={[styles.sectionContainer, { backgroundColor: c.background }]}>
                                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills ({parsedResumeData.skills.length})</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {parsedResumeData.skills.map((skill: string, i: number) => (
                                            <View key={i} style={{ backgroundColor: c.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                                <Text style={{ color: c.primary, fontSize: 12 }}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Employment */}
                            {renderResumeSection('Employment', parsedResumeData?.employment, (item, i) => (
                                <View key={i} style={{ marginBottom: 12, borderLeftWidth: 2, borderLeftColor: c.primary, paddingLeft: 10 }}>
                                    <Text style={{ color: c.text, fontWeight: '600' }}>{item.title}</Text>
                                    <Text style={{ color: c.subtext }}>{item.company} | {item.startDate} - {item.endDate || 'Present'}</Text>
                                    {item.description && <Text style={{ color: c.subtext, fontSize: 12, marginTop: 4 }}>{item.description}</Text>}
                                </View>
                            ))}

                            {/* Education */}
                            {renderResumeSection('Education', parsedResumeData?.education, (item, i) => (
                                <View key={i} style={{ marginBottom: 12, borderLeftWidth: 2, borderLeftColor: c.secondary, paddingLeft: 10 }}>
                                    <Text style={{ color: c.text, fontWeight: '600' }}>{item.degree} in {item.fieldOfStudy}</Text>
                                    <Text style={{ color: c.subtext }}>{item.institution}</Text>
                                    <Text style={{ color: c.subtext, fontSize: 12 }}>{item.startDate} - {item.endDate}</Text>
                                </View>
                            ))}

                        </ScrollView>

                        <View style={styles.modalActions}>
                            <Button title="Apply to Profile" onPress={applyParsedResume} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
            {/* PDF Preview Modal */}
            <Modal visible={showPreviewModal} animationType="fade" onRequestClose={() => setShowPreviewModal(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
                    <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowPreviewModal(false);
                                if (blobUrl && Platform.OS === 'web') {
                                    URL.revokeObjectURL(blobUrl);
                                    setBlobUrl(null);
                                }
                            }}
                            style={styles.backButton}
                        >
                            <Ionicons name="close" size={24} color={c.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: c.text }]}>Resume Preview</Text>
                        <TouchableOpacity onPress={handleDownloadFile}>
                            <Ionicons name="download-outline" size={24} color={c.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        {Platform.OS === 'web' ? (
                            blobUrl ? (
                                <iframe
                                    src={blobUrl}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Resume Preview"
                                />
                            ) : (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={c.primary} />
                                    <Text style={{ marginTop: 16, color: c.subtext }}>Loading preview...</Text>
                                </View>
                            )
                        ) : previewUrl && previewAuthToken ? (
                            <WebView
                                source={{
                                    uri: previewUrl,
                                    headers: { 'Authorization': `Bearer ${previewAuthToken}` }
                                }}
                                style={{ flex: 1 }}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }] }}>
                                        <ActivityIndicator size="large" color={c.primary} />
                                    </View>
                                )}
                            />
                        ) : (
                            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 50 }} />
                        )}
                    </View>

                    <View style={{ padding: 16, backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border }}>
                        <Button
                            title="Download & Share PDF"
                            onPress={handleDownloadFile}
                            icon={<Ionicons name="share-outline" size={20} color="white" />}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 16,
        padding: 20,
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    sectionContainer: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    dataText: {
        fontSize: 14,
        marginBottom: 4,
    }
});
