import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '../theme/theme';
import { useInAppAlert } from '../components/InAppAlert';
import { useAuth } from '../context/AuthContext';
import * as profileService from '../services/profileService';
import * as userService from '../services/userService';
import * as uploadService from '../services/uploadService';

export default function ClientEditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        companyName: '',
        website: '',
        bio: '',
        avatar: '',
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);

            // Try to get user data from API, but use AuthContext as fallback
            let user = null;
            try {
                user = await userService.getMe();
            } catch (userError: any) {
                console.warn('⚠️ User API not found, using auth context data:', userError?.message);
                user = authUser; // Use the authenticated user from context
            }

            const profile = await profileService.getMyProfile();

            // Prioritize data sources: API user > Auth context > Profile
            const fullName = user 
                ? `${user.firstName} ${user.lastName}`.trim()
                : `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
            
            const email = user?.email || profile?.email || '';

            // Log the loaded data for debugging
            console.log('📊 Loaded profile data:', { 
                user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : 'null',
                profile: profile ? { firstName: profile.firstName, lastName: profile.lastName, email: profile.email } : 'null',
                fullName,
                email
            });

            setFormData({
                fullName: fullName || '',
                email: email || '',
                phone: profile?.phoneNumber || '',
                location: profile?.location || '',
                companyName: profile?.companyName || '',
                website: profile?.website || '',
                bio: profile?.bio || '',
                avatar: profile?.avatar || user?.profileImage || '',
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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, avatar: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate required fields
            const fullNameTrimmed = formData.fullName.trim();
            const emailTrimmed = formData.email.trim();

            if (!fullNameTrimmed || !emailTrimmed) {
                showAlert({
                    title: 'Required Fields',
                    message: 'Please enter your full name and email to continue',
                    type: 'warning',
                });
                setSaving(false);
                return;
            }

            // Upload image if changed (local URI)
            let avatarUrl = formData.avatar;
            if (formData.avatar && formData.avatar.startsWith('file://')) {
                try {
                    console.log('📤 Uploading avatar...');
                    avatarUrl = await uploadService.uploadImage(formData.avatar);
                    console.log('✅ Avatar uploaded:', avatarUrl);
                } catch (uploadError) {
                    console.error('❌ Avatar upload failed:', uploadError);
                    showAlert({
                        title: 'Upload Failed',
                        message: 'Failed to upload profile image, but saving other data.',
                        type: 'warning',
                    });
                    // Continue saving other data even if image upload fails
                }
            }

            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || firstName;

            // Update user data
            await userService.updateMe({
                firstName,
                lastName,
                profileImage: avatarUrl,
            });

            // Update profile data
            const profileData = {
                phoneNumber: formData.phone.trim(),
                location: formData.location.trim(),
                companyName: formData.companyName.trim(),
                website: formData.website.trim(),
                bio: formData.bio.trim(),
                avatar: avatarUrl,
            };

            await profileService.updateMyProfile(profileData);

            showAlert({
                title: 'Success!',
                message: 'Profile updated successfully',
                type: 'success',
                durationMs: 2500,
            });

            setTimeout(() => {
                navigation.goBack();
            }, 2500);

        } catch (error: any) {
            console.error('❌ Failed to save profile:', error);
            showAlert({
                title: 'Update Failed',
                message: error?.message || 'Failed to save profile.',
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
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={[styles.photoPlaceholder, { backgroundColor: c.card }]}>
                        {formData.avatar ? (
                            <Image source={{ uri: formData.avatar }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={40} color={c.subtext} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={[styles.editPhotoButton, { backgroundColor: c.primary }]}>
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
                            editable={false} // Email usually shouldn't be editable easily
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
                        <Text style={[styles.label, { color: c.subtext }]}>About / Bio</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
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
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 24 },
    photoSection: { alignItems: 'center', marginBottom: 32 },
    photoPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    editPhotoButton: { position: 'absolute', bottom: 0, right: '35%', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, marginBottom: 8 },
    input: { height: 48, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16 },
    textArea: { minHeight: 100, borderRadius: 8, borderWidth: 1, padding: 16, textAlignVertical: 'top' },
    saveButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
