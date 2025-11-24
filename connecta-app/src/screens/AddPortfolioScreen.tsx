import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function AddPortfolioScreen({ navigation }: any) {
    const c = useThemeColors();
    const [formData, setFormData] = useState({
        projectTitle: '',
        yourRole: '',
        projectDescription: '',
        skillsAndDeliverables: ''
    });

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAsDraft = () => {
        Alert.alert('Draft Saved', 'Your portfolio item has been saved as a draft.');
        navigation.goBack();
    };

    const handlePreview = () => {
        Alert.alert('Preview', 'Preview functionality coming soon.');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Add Portfolio</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.pageTitle, { color: c.text }]}>Add a new portfolio project</Text>
                <Text style={[styles.subtitle, { color: c.subtext }]}>
                    Please complete all required fields unless marked as optional.
                </Text>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Project title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.projectTitle}
                            onChangeText={(text) => handleInputChange('projectTitle', text)}
                            placeholder="Add a clear, concise title"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Your role (optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.yourRole}
                            onChangeText={(text) => handleInputChange('yourRole', text)}
                            placeholder="e.g UI/UX designer"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Project description</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.projectDescription}
                            onChangeText={(text) => handleInputChange('projectDescription', text)}
                            multiline
                            numberOfLines={4}
                            placeholder="Summarize the project's objectives..."
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Skills and deliverables</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.skillsAndDeliverables}
                            onChangeText={(text) => handleInputChange('skillsAndDeliverables', text)}
                            placeholder="Type to add skills"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.mediaSection}>
                        <Text style={[styles.mediaTitle, { color: c.text }]}>Add content</Text>
                        <View style={styles.mediaGrid}>
                            {['image', 'videocam', 'text', 'link', 'document-text', 'musical-notes'].map((icon, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.mediaButton, { backgroundColor: c.card, borderColor: c.border }]}
                                >
                                    <Ionicons name={icon as any} size={24} color={c.text} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.draftButton, { borderColor: c.border }]}
                        onPress={handleSaveAsDraft}
                    >
                        <Text style={[styles.draftButtonText, { color: c.text }]}>Save as draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.previewButton, { backgroundColor: c.primary }]}
                        onPress={handlePreview}
                    >
                        <Text style={styles.previewButtonText}>Preview</Text>
                    </TouchableOpacity>
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
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
    },
    form: {
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    textArea: {
        minHeight: 120,
        borderRadius: 8,
        borderWidth: 1,
        padding: 16,
        textAlignVertical: 'top',
    },
    mediaSection: {
        marginTop: 8,
    },
    mediaTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    mediaButton: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    draftButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
