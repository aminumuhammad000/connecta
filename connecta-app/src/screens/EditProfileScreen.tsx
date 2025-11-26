import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import * as profileService from '../services/profileService';

export default function EditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { user, updateUser } = useAuth();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        skills: [] as string[],
        skillsText: '',
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const profile = await profileService.getMyProfile();

            // Populate form with user data
            setFormData({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                skillsText: (profile.skills || []).join(', '),
            });
        } catch (error: any) {
            console.error('Error loading profile:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to load profile data',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert skills text to array
            const skillsArray = formData.skillsText
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            // Update profile
            await profileService.updateMyProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                skills: skillsArray,
            });

            // Update local user data
            if (user) {
                updateUser({
                    ...user,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                });
            }

            showAlert({
                title: 'Success',
                message: 'Profile updated successfully!',
                type: 'success'
            });

            // Go back after a short delay
            setTimeout(() => navigation.goBack(), 1000);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            showAlert({
                title: 'Error',
                message: error.message || 'Failed to save profile',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
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
                        <Ionicons name="person" size={40} color={c.subtext} />
                    </View>
                    <TouchableOpacity style={[styles.editPhotoButton, { backgroundColor: c.primary }]}>
                        <Ionicons name="pencil" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>First Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.firstName}
                            onChangeText={(text) => handleInputChange('firstName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Last Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.lastName}
                            onChangeText={(text) => handleInputChange('lastName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border, opacity: 0.7 }]}
                            value={formData.email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Phone</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                            placeholder="+1234567890"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Location</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.location}
                            onChangeText={(text) => handleInputChange('location', text)}
                            placeholder="City, Country"
                            placeholderTextColor={c.subtext}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Professional Summary</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                        value={formData.bio}
                        onChangeText={(text) => handleInputChange('bio', text)}
                        multiline
                        numberOfLines={4}
                        placeholder="Write a brief summary about yourself..."
                        placeholderTextColor={c.subtext}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Your Skills (comma separated)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.skillsText}
                            onChangeText={(text) => handleInputChange('skillsText', text)}
                            placeholder="e.g. React, Node.js, Design"
                            placeholderTextColor={c.subtext}
                        />
                    </View>
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
