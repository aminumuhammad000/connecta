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
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, uploadAvatar } from '../services/uploadService';
import Card from '../components/Card';
import Avatar from '../components/Avatar';

export default function ClientEditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const { user, updateUser } = useAuth();

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
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

            const [userData, profile] = await Promise.all([
                userService.getMe(),
                profileService.getMyProfile()
            ]);

            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: profile?.phoneNumber || '',
                location: profile?.location || '',
                companyName: profile?.companyName || '',
                website: profile?.website || '',
                bio: profile?.bio || '',
            });

            setProfileImage(profile?.avatar || userData?.profileImage || null);

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

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setUploadingImage(true);

                try {
                    const uploadedUrl = await uploadAvatar(imageUri);
                    setProfileImage(uploadedUrl);
                    showAlert({
                        title: 'Success',
                        message: 'Profile picture uploaded!',
                        type: 'success'
                    });
                } catch (uploadError: any) {
                    console.error('Upload error:', uploadError);
                    showAlert({
                        title: 'Error',
                        message: 'Failed to upload image',
                        type: 'error'
                    });
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error: any) {
            console.error('Image picker error:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to pick image',
                type: 'error'
            });
        }
    };

    const generateAIBio = async () => {
        try {
            setIsGeneratingBio(true);
            const prompt = `Generate a professional company bio for ${formData.companyName || formData.firstName}. The bio should be professional and short, between 10 and 20 words. Return ONLY the bio text, no conversational filler.`;
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
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
                showAlert({
                    title: 'Validation Error',
                    message: 'Name and email are required',
                    type: 'error',
                });
                setSaving(false);
                return;
            }

            // Update user data
            const updatedUser = await userService.updateMe({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                profileImage: profileImage || undefined,
            });

            if (user) {
                updateUser({
                    ...user,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    profileImage: profileImage || user.profileImage,
                });
            }

            // Update profile data
            const profileData = {
                phoneNumber: formData.phone.trim(),
                location: formData.location.trim(),
                companyName: formData.companyName.trim(),
                website: formData.website.trim(),
                bio: formData.bio.trim(),
                avatar: profileImage || undefined,
            };

            await profileService.updateMyProfile(profileData);

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
            }, 1000);

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
            <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
                <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Edit Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Profile Photo Section */}
                    <View style={styles.photoSection}>
                        <View style={styles.avatarWrapper}>
                            <Avatar uri={profileImage || undefined} name={formData.firstName} size={110} />
                            <TouchableOpacity
                                style={[styles.editPhotoButton, { backgroundColor: c.primary }]}
                                onPress={handlePickImage}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="camera" size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.photoHint, { color: c.subtext }]}>Tap to change profile picture</Text>
                    </View>

                    <Card variant="outlined" style={styles.sectionCard}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Information</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: c.subtext }]}>First Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={formData.firstName}
                                    onChangeText={(text) => handleInputChange('firstName', text)}
                                    placeholder="First Name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: c.subtext }]}>Last Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={formData.lastName}
                                    onChangeText={(text) => handleInputChange('lastName', text)}
                                    placeholder="Last Name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Phone</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Location</Text>
                            <View style={[styles.inputWithIcon, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                <Ionicons name="location-outline" size={20} color={c.subtext} style={{ marginLeft: 12 }} />
                                <TextInput
                                    style={[styles.inputNoBorder, { color: c.text }]}
                                    value={formData.location}
                                    onChangeText={(text) => handleInputChange('location', text)}
                                    placeholder="City, Country"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>
                        </View>
                    </Card>

                    <Card variant="outlined" style={styles.sectionCard}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Company Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Company Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.companyName}
                                onChangeText={(text) => handleInputChange('companyName', text)}
                                placeholder="e.g. Acme Corp"
                                placeholderTextColor={c.subtext}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Website</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.website}
                                onChangeText={(text) => handleInputChange('website', text)}
                                autoCapitalize="none"
                                placeholder="https://example.com"
                                placeholderTextColor={c.subtext}
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
                                style={[styles.textArea, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border, marginTop: 12 }]}
                                value={formData.bio}
                                onChangeText={(text) => handleInputChange('bio', text)}
                                multiline
                                numberOfLines={4}
                                placeholder="Tell freelancers about your company..."
                                placeholderTextColor={c.subtext}
                            />
                        </View>
                    </Card>

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
            </View>
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
        padding: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    photoHint: {
        fontSize: 12,
        marginTop: 8,
    },
    sectionCard: {
        marginBottom: 20,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
    },
    inputNoBorder: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 15,
    },
    textArea: {
        minHeight: 100,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        textAlignVertical: 'top',
        fontSize: 15,
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
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        elevation: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
