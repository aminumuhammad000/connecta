import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import aiService from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import * as profileService from '../services/profileService';
import * as userService from '../services/userService';

export default function ClientEditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        companyName: '',
        website: '',
        bio: '',
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading profile data...');

            const [user, profile] = await Promise.all([
                userService.getMe(),
                profileService.getMyProfile()
            ]);

            console.log('✅ User data loaded:', { firstName: user.firstName, lastName: user.lastName, email: user.email });
            console.log('✅ Profile data loaded:', profile);

            setFormData({
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: profile?.phoneNumber || '',
                location: profile?.location || '',
                companyName: profile?.companyName || '',
                website: profile?.website || '',
                bio: profile?.bio || '',
            });
        } catch (error: any) {
            console.error('❌ Failed to load profile:', error);
            showAlert({
                title: 'Error',
                message: error?.message || 'Failed to load profile data',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateAIBio = async () => {
        try {
            setIsGeneratingBio(true);
            const prompt = `Generate a professional company bio for ${formData.companyName || formData.fullName}. The bio should be professional and short, between 10 and 20 words. Return ONLY the bio text, no conversational filler.`;
            const generatedBio = await aiService.sendAIQuery(prompt, user?._id || '', 'client');

            if (generatedBio) {
                // Typing effect for "writing" feel in the input
                let currentText = '';
                const words = generatedBio.split(' ');
                for (let i = 0; i < words.length; i++) {
                    currentText += (i === 0 ? '' : ' ') + words[i];
                    setFormData(prev => ({ ...prev, bio: currentText }));
                    // Small delay between words
                    await new Promise(resolve => setTimeout(resolve, 40));
                }
            }
        } catch (error) {
            console.error('Error generating AI bio:', error);
            showAlert({ title: 'Error', message: 'Failed to generate AI bio', type: 'error' });
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate required fields
            if (!formData.fullName.trim() || !formData.email.trim()) {
                showAlert({
                    title: 'Validation Error',
                    message: 'Full name and email are required',
                    type: 'error',
                });
                setSaving(false);
                return;
            }

            console.log('💾 Saving profile data...', formData);

            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || firstName;

            console.log('👤 Updating user:', { firstName, lastName });

            // Update user data (firstName, lastName)
            const updatedUser = await userService.updateMe({
                firstName,
                lastName,
            });

            console.log('✅ User updated:', updatedUser);

            // Update profile data
            const profileData = {
                phoneNumber: formData.phone.trim(),
                location: formData.location.trim(),
                companyName: formData.companyName.trim(),
                website: formData.website.trim(),
                bio: formData.bio.trim(),
            };

            console.log('📝 Updating profile:', profileData);

            const updatedProfile = await profileService.updateMyProfile(profileData);

            console.log('✅ Profile updated:', updatedProfile);

            // Show success message
            showAlert({
                title: 'Success!',
                message: 'Your profile has been updated successfully',
                type: 'success',
                durationMs: 2500,
            });

            // Wait a moment for the success message to show, then go back
            setTimeout(() => {
                navigation.goBack();
            }, 2500);

        } catch (error: any) {
            console.error('❌ Failed to save profile:', error);
            showAlert({
                title: 'Update Failed',
                message: error?.message || 'Failed to save profile. Please try again.',
                type: 'error',
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
                        <Text style={[styles.label, { color: c.subtext }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.fullName}
                            onChangeText={(text) => handleInputChange('fullName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Phone</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Location</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.location}
                            onChangeText={(text) => handleInputChange('location', text)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Company Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Company Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.companyName}
                            onChangeText={(text) => handleInputChange('companyName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.subtext }]}>Website</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={formData.website}
                            onChangeText={(text) => handleInputChange('website', text)}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.bioHeader}>
                            <Text style={[styles.label, { color: c.subtext, marginBottom: 0 }]}>About / Bio</Text>
                            <TouchableOpacity
                                onPress={generateAIBio}
                                disabled={isGeneratingBio}
                                style={[styles.aiBioBtn, { backgroundColor: c.primary + '10' }]}
                            >
                                {isGeneratingBio ? (
                                    <ActivityIndicator size="small" color={c.primary} />
                                ) : (
                                    <>
                                        <MaterialIcons name="auto-awesome" size={14} color={c.primary} />
                                        <Text style={[styles.aiBioText, { color: c.primary }]}>AI Rewrite</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border, marginTop: 12 }]}
                            value={formData.bio}
                            onChangeText={(text) => handleInputChange('bio', text)}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell freelancers about your company..."
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
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiBioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    aiBioText: {
        fontSize: 12,
        fontWeight: '600',
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
