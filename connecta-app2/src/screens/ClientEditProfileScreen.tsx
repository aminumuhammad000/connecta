import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import aiService from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import * as profileService from '../services/profileService';
import * as userService from '../services/userService';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, uploadAvatar, uploadPortfolioImage } from '../services/uploadService';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import LocationPicker from '../components/LocationPicker';
import Button from '../components/Button';
import * as Haptics from 'expo-haptics';
import { PortfolioItem, Education, Experience } from '../types';

export default function ClientEditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
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

    // Portfolio State
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [editingPortfolioIndex, setEditingPortfolioIndex] = useState<number | null>(null);
    const [portfolioForm, setPortfolioForm] = useState({
        title: '', description: '', imageUrl: '', projectUrl: '', tags: ''
    });

    // Education State
    const [education, setEducation] = useState<Education[]>([]);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
    const [educationForm, setEducationForm] = useState({
        institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', category: 'University'
    });

    // Work Experience State
    const [employment, setEmployment] = useState<Experience[]>([]);
    const [showEmploymentModal, setShowEmploymentModal] = useState(false);
    const [editingEmploymentIndex, setEditingEmploymentIndex] = useState<number | null>(null);
    const [employmentForm, setEmploymentForm] = useState({
        company: '', title: '', startDate: '', endDate: '', description: ''
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
            setPortfolio(profile?.portfolio || []);
            setEducation(profile?.education || []);
            setEmployment(profile?.employment || []);

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

    const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

    const handlePickImage = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setPendingImageUri(imageUri);
                showAlert({
                    title: 'Image Selected',
                    message: 'Image will be uploaded when you save',
                    type: 'success'
                });
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

    // Portfolio Handlers
    const handleAddPortfolio = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPortfolioForm({ title: '', description: '', imageUrl: '', projectUrl: '', tags: '' });
        setEditingPortfolioIndex(null);
        setShowPortfolioModal(true);
    };

    const handleSavePortfolioItem = () => {
        if (!portfolioForm.title || !portfolioForm.description) {
            showAlert({ title: 'Error', message: 'Title and description are required', type: 'error' });
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const newItem: PortfolioItem = {
            title: portfolioForm.title,
            description: portfolioForm.description,
            imageUrl: portfolioForm.imageUrl || undefined,
            projectUrl: portfolioForm.projectUrl || undefined,
            tags: portfolioForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        };

        if (editingPortfolioIndex !== null) {
            setPortfolio(prev => prev.map((item, i) => i === editingPortfolioIndex ? newItem : item));
        } else {
            setPortfolio(prev => [...prev, newItem]);
        }
        setShowPortfolioModal(false);
    };

    const handlePickPortfolioImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as any,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                // Show local preview immediately
                setPortfolioForm(prev => ({ ...prev, imageUrl: imageUri }));
                setUploadingImage(true);

                try {
                    const uploadedUrl = await uploadPortfolioImage(imageUri);
                    // Update with final remote URL
                    setPortfolioForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
                } catch (uploadError: any) {
                    showAlert({ title: 'Error', message: 'Failed to upload image', type: 'error' });
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to pick image', type: 'error' });
        }
    };

    // Education Handlers
    const handleAddEducation = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEducationForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', category: 'University' });
        setEditingEducationIndex(null);
        setShowEducationModal(true);
    };

    const handleSaveEducation = () => {
        if (!educationForm.institution || !educationForm.degree) {
            showAlert({ title: 'Error', message: 'Institution and degree are required', type: 'error' });
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingEducationIndex !== null) {
            setEducation(prev => prev.map((item, i) => i === editingEducationIndex ? educationForm : item));
        } else {
            setEducation(prev => [...prev, educationForm]);
        }
        setShowEducationModal(false);
    };

    // Employment Handlers
    const handleAddEmployment = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEmploymentForm({ company: '', title: '', startDate: '', endDate: '', description: '' });
        setEditingEmploymentIndex(null);
        setShowEmploymentModal(true);
    };

    const handleSaveEmployment = () => {
        if (!employmentForm.company || !employmentForm.title) {
            showAlert({ title: 'Error', message: 'Company and title are required', type: 'error' });
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingEmploymentIndex !== null) {
            setEmployment(prev => prev.map((item, i) => i === editingEmploymentIndex ? employmentForm : item));
        } else {
            setEmployment(prev => [...prev, employmentForm]);
        }
        setShowEmploymentModal(false);
    };

    const generateAIBio = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsGeneratingBio(true);
            const prompt = `Generate a professional company bio for ${formData.companyName || formData.firstName}. The bio should be professional and short, between 10 and 20 words. Return ONLY the bio text.`;
            const generatedBio = await aiService.sendAIQuery(prompt, user?._id || '', 'client');

            if (generatedBio) {
                let currentText = '';
                const words = generatedBio.split(' ');
                for (let i = 0; i < words.length; i++) {
                    currentText += (i === 0 ? '' : ' ') + words[i];
                    setFormData(prev => ({ ...prev, bio: currentText }));
                    await new Promise(resolve => setTimeout(resolve, 40));
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to generate AI bio', type: 'error' });
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleSave = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setSaving(true);

            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
                showAlert({ title: 'Validation Error', message: 'Name and email are required', type: 'error' });
                setSaving(false);
                return;
            }

            let finalImageUrl = profileImage;
            if (pendingImageUri) {
                setUploadingImage(true);
                try {
                    finalImageUrl = await uploadAvatar(pendingImageUri);
                    setProfileImage(finalImageUrl);
                    setPendingImageUri(null);
                } catch (uploadError) {
                    showAlert({ title: 'Error', message: 'Failed to upload profile picture', type: 'error' });
                    setUploadingImage(false);
                    setSaving(false);
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }

            await userService.updateMe({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                profileImage: finalImageUrl || undefined,
            });

            if (user) {
                updateUser({
                    ...user,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    profileImage: finalImageUrl || user.profileImage,
                });
            }

            const profileData = {
                phoneNumber: formData.phone.trim(),
                location: formData.location.trim(),
                companyName: formData.companyName.trim(),
                website: formData.website.trim(),
                bio: formData.bio.trim(),
                avatar: finalImageUrl || undefined,

            };

            await profileService.updateMyProfile(profileData);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({ title: 'Success!', message: 'Profile updated successfully', type: 'success', durationMs: 2500 });

            setTimeout(() => {
                navigation.goBack();
            }, 1000);

        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showAlert({ title: 'Update Failed', message: error?.message || 'Failed to save profile', type: 'error' });
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
                    {/* Profile Photo */}
                    <View style={styles.photoSection}>
                        <View style={styles.avatarWrapper}>
                            <Avatar uri={pendingImageUri || profileImage || undefined} name={formData.firstName} size={110} />
                            <TouchableOpacity
                                style={[styles.editPhotoButton, { backgroundColor: c.primary }]}
                                onPress={handlePickImage}
                                disabled={uploadingImage || saving}
                            >
                                {uploadingImage ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="camera" size={22} color="white" />}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.photoHint, { color: c.text }]}>
                            {pendingImageUri ? 'New photo selected - save to update' : 'Tap to change profile picture'}
                        </Text>
                    </View>

                    {/* Personal Info */}
                    <Card variant="outlined" style={styles.sectionCard}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: c.subtext }]}>First Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={formData.firstName}
                                    onChangeText={(text) => handleInputChange('firstName', text)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: c.subtext }]}>Last Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={formData.lastName}
                                    onChangeText={(text) => handleInputChange('lastName', text)}
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
                            <LocationPicker
                                value={formData.location}
                                onValueChange={(location) => handleInputChange('location', location)}
                                label="LOCATION"
                            />
                        </View>
                    </Card>

                    {/* Company Details */}
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
                                    {isGeneratingBio ? <ActivityIndicator size="small" color={c.primary} /> : (
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



                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Sticky Save Button */}
                <View style={[styles.stickyFooter, { backgroundColor: c.background, borderTopColor: c.border }]}>
                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={saving}
                        size="large"
                    />
                </View>
            </View>



        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    photoSection: { alignItems: 'center', marginBottom: 24 },
    avatarWrapper: { position: 'relative' },
    editPhotoButton: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
    photoHint: { fontSize: 12, marginTop: 8, fontWeight: '600' },
    sectionCard: { marginBottom: 20, padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    row: { flexDirection: 'row', marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
    input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
    textArea: { minHeight: 100, borderRadius: 12, borderWidth: 1, padding: 16, textAlignVertical: 'top', fontSize: 15 },
    bioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    aiBioBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
    aiBioText: { fontSize: 12, fontWeight: '600' },
    stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1, elevation: 10 },

    // New Prominent Button Styles
    sectionHeaderRow: { marginBottom: 16 },
    sectionSubtitle: { fontSize: 13, marginTop: 2 },
    addButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', marginBottom: 16, gap: 12 },
    addButtonIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    addButtonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    addButtonSubtitle: { fontSize: 12 },

    // Item Styles
    itemCard: { padding: 12, borderRadius: 12, borderWidth: 1, position: 'relative' },
    itemTitle: { fontSize: 15, fontWeight: '600' },
    itemSubtitle: { fontSize: 13, marginTop: 2 },
    itemDesc: { fontSize: 13, marginTop: 4 },
    deleteIcon: { position: 'absolute', top: 12, right: 12, padding: 4 },
});
