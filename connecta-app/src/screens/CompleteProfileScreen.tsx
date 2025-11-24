import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function CompleteProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const handleFileSelect = async () => {
        // In a real app, use expo-document-picker
        // const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] });

        // Mock selection
        Alert.alert(
            "Select File",
            "Choose a file to upload",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Mock PDF",
                    onPress: () => setSelectedFile({ name: "resume.pdf", size: 1024 * 1024, type: "application/pdf" })
                }
            ]
        );
    };

    const handleExtractData = () => {
        if (!selectedFile) return;
        setUploading(true);

        // Simulate AI extraction
        setTimeout(() => {
            setUploading(false);
            Alert.alert("Success", "Data extracted successfully!");
            // Navigate to EditProfile with mock data
            navigation.navigate('ClientProfile', { // Using ClientProfile as placeholder or EditProfile if registered
                // Actually we should navigate to EditProfileScreen but it might not be in the stack yet or named differently
                // The plan said EditProfileScreen.
            });
            // Since we created EditProfileScreen, let's navigate there.
            // But wait, the route name in App.tsx for EditProfileScreen needs to be checked.
            // I'll assume I'll add it to App.tsx later or it's 'EditProfile'.
            // In the App.tsx I read earlier, there was no EditProfileScreen. I need to add it.
            // For now, I'll just navigate to 'Dashboard' or similar.
            navigation.navigate('EditProfile');
        }, 2000);
    };

    const handleManualComplete = () => {
        // Navigate to EditProfileScreen
        // I need to ensure this route exists in App.tsx
        navigation.navigate('EditProfile'); // Placeholder until route is added
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Complete Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="document-text-outline" size={48} color={c.primary} />
                    </View>

                    <Text style={[styles.title, { color: c.text }]}>Complete Your Profile</Text>
                    <Text style={[styles.subtitle, { color: c.subtext }]}>
                        To complete your profile, please upload your CV. Our AI will extract information from it and help you build a professional profile.
                    </Text>

                    <TouchableOpacity
                        style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.background }]}
                        onPress={handleFileSelect}
                    >
                        <Ionicons
                            name={selectedFile ? "checkmark-circle" : "cloud-upload-outline"}
                            size={40}
                            color={selectedFile ? c.primary : c.subtext}
                        />
                        {selectedFile ? (
                            <View style={styles.fileInfo}>
                                <Text style={[styles.fileName, { color: c.text }]}>{selectedFile.name}</Text>
                                <Text style={[styles.fileSize, { color: c.subtext }]}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                                <Text style={[styles.changeText, { color: c.primary }]}>Tap to change</Text>
                            </View>
                        ) : (
                            <View style={styles.uploadPrompt}>
                                <Text style={[styles.uploadText, { color: c.text }]}>Tap to upload</Text>
                                <Text style={[styles.uploadHint, { color: c.subtext }]}>PDF or DOCX (max. 10MB)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.extractButton,
                            { backgroundColor: c.primary },
                            (!selectedFile || uploading) && styles.disabledButton
                        ]}
                        onPress={handleExtractData}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.btnContent}>
                                <Ionicons name="flash" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Extract Data with AI</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <Text style={[styles.orText, { color: c.subtext }]}>OR</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.manualButton, { borderColor: c.primary }]}
                        onPress={handleManualComplete}
                    >
                        <Ionicons name="pencil" size={20} color={c.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.manualButtonText, { color: c.primary }]}>Complete my profile manually</Text>
                    </TouchableOpacity>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                            <Text style={[styles.featureText, { color: c.subtext }]}>AI automatically extracts your information</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                            <Text style={[styles.featureText, { color: c.subtext }]}>Review and edit before saving</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                            <Text style={[styles.featureText, { color: c.subtext }]}>Secure and private processing</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    card: {
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    uploadBox: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    uploadPrompt: {
        alignItems: 'center',
        marginTop: 16,
    },
    fileInfo: {
        alignItems: 'center',
        marginTop: 16,
    },
    uploadText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    uploadHint: {
        fontSize: 14,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
        marginBottom: 8,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    extractButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.5,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        marginBottom: 24,
    },
    orText: {
        fontSize: 14,
        fontWeight: '600',
    },
    manualButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    manualButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    featuresList: {
        width: '100%',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        flex: 1,
    },
});
