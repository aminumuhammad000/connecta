import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

// Mock API URL - replace with actual URL or environment variable
const API_URL = 'http://10.0.2.2:5000/api';

export default function EditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: 'Mustapha Hussein',
        email: 'mypaddess@gmail.com',
        phone: '+234 814 678 9087',
        location: 'Kano, Nigeria',
        professionalSummary: '',
        yourSkills: '',
        hardSkills: '',
        educationalSummary: '',
        languages: '',
        employmentHistory: '',
        otherExperience: '',
        certifications: ''
    });

    const [educationForm, setEducationForm] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        // Simulate fetching profile data
        // In a real app, you would fetch from API here
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (name: string, value: string) => {
        setEducationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            Alert.alert('Success', 'Profile saved successfully');
        }, 1500);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Photo Section */}
                <View style={styles.photoSection}>
                    <View style={[styles.photoPlaceholder, { backgroundColor: c.card }]}>
                        <Ionicons name="person" size={40} color={c.textDim} />
                    </View>
                    <TouchableOpacity style={[styles.editPhotoButton, { backgroundColor: c.primary }]}>
                        <Ionicons name="pencil" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.fullName}
                            onChangeText={(text) => handleInputChange('fullName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Phone</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Location</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.location}
                            onChangeText={(text) => handleInputChange('location', text)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Professional Summary</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                        value={formData.professionalSummary}
                        onChangeText={(text) => handleInputChange('professionalSummary', text)}
                        multiline
                        numberOfLines={4}
                        placeholder="Write a brief summary about yourself..."
                        placeholderTextColor={c.textDim}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Your Skills</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.yourSkills}
                            onChangeText={(text) => handleInputChange('yourSkills', text)}
                            placeholder="e.g. React, Node.js"
                            placeholderTextColor={c.textDim}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Hard Skills</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.hardSkills}
                            onChangeText={(text) => handleInputChange('hardSkills', text)}
                            placeholder="e.g. Project Management"
                            placeholderTextColor={c.textDim}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Education</Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Institution</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={educationForm.institution}
                            onChangeText={(text) => handleEducationChange('institution', text)}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Degree</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={educationForm.degree}
                            onChangeText={(text) => handleEducationChange('degree', text)}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.textDim }]}>Field of Study</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={educationForm.fieldOfStudy}
                            onChangeText={(text) => handleEducationChange('fieldOfStudy', text)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Employment History</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                        value={formData.employmentHistory}
                        onChangeText={(text) => handleInputChange('employmentHistory', text)}
                        multiline
                        numberOfLines={4}
                        placeholder="List your past employment..."
                        placeholderTextColor={c.textDim}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: c.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
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
    scrollContent: {
        padding: 24,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
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
        minHeight: 100,
        borderRadius: 8,
        borderWidth: 1,
        padding: 16,
        textAlignVertical: 'top',
    },
    saveButton: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
