import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useInAppAlert } from '../components/InAppAlert';
import * as profileService from '../services/profileService';
import * as userService from '../services/userService';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/uploadService';
import { PortfolioItem } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

export default function EditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { user, updateUser } = useAuth();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Portfolio state
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [editingPortfolioIndex, setEditingPortfolioIndex] = useState<number | null>(null);
    const [portfolioForm, setPortfolioForm] = useState({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        tags: '',
    });

    // Education state
    const [education, setEducation] = useState<any[]>([]);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
    const [educationForm, setEducationForm] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
    });

    // Languages state
    const [languages, setLanguages] = useState<any[]>([]);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [editingLanguageIndex, setEditingLanguageIndex] = useState<number | null>(null);
    const [languageForm, setLanguageForm] = useState({
        language: '',
        proficiency: 'basic',
    });

    // Employment state
    const [employment, setEmployment] = useState<any[]>([]);
    const [showEmploymentModal, setShowEmploymentModal] = useState(false);
    const [editingEmploymentIndex, setEditingEmploymentIndex] = useState<number | null>(null);
    const [employmentForm, setEmploymentForm] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
    });

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
                phone: profile?.phone || '',
                location: profile?.location || '',
                bio: profile?.bio || '',
                skills: profile?.skills || [],
                skillsText: (profile?.skills || []).join(', '),
            });

            // Set profile image
            setProfileImage(profile?.avatar || user?.profileImage || null);

            // Set portfolio
            setPortfolio(profile?.portfolio || []);

            // Set education, languages, employment
            setEducation(profile?.education || []);
            setLanguages(profile?.languages || []);
            setEmployment(profile?.employment || []);
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
                    const uploadedUrl = await uploadImage(imageUri);
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

    const handleAddPortfolio = () => {
        setPortfolioForm({ title: '', description: '', imageUrl: '', projectUrl: '', tags: '' });
        setEditingPortfolioIndex(null);
        setShowPortfolioModal(true);
    };

    const handleEditPortfolio = (index: number) => {
        const item = portfolio[index];
        setPortfolioForm({
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl || '',
            projectUrl: item.projectUrl || '',
            tags: (item.tags || []).join(', '),
        });
        setEditingPortfolioIndex(index);
        setShowPortfolioModal(true);
    };

    const handleDeletePortfolio = (index: number) => {
        setPortfolio(prev => prev.filter((_, i) => i !== index));
    };

    const handleSavePortfolioItem = () => {
        if (!portfolioForm.title || !portfolioForm.description) {
            showAlert({ title: 'Error', message: 'Title and description are required', type: 'error' });
            return;
        }

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
                setUploadingImage(true);

                try {
                    const uploadedUrl = await uploadImage(imageUri);
                    setPortfolioForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
                } catch (uploadError: any) {
                    console.error('Upload error:', uploadError);
                    showAlert({ title: 'Error', message: 'Failed to upload image', type: 'error' });
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error: any) {
            console.error('Image picker error:', error);
            showAlert({ title: 'Error', message: 'Failed to pick image', type: 'error' });
        }
    };

    // Education handlers
    const handleAddEducation = () => {
        setEducationForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
        setEditingEducationIndex(null);
        setShowEducationModal(true);
    };

    const handleEditEducation = (index: number) => {
        const item = education[index];
        setEducationForm({
            institution: item.institution,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy,
            startDate: item.startDate,
            endDate: item.endDate || '',
        });
        setEditingEducationIndex(index);
        setShowEducationModal(true);
    };

    const handleDeleteEducation = (index: number) => {
        setEducation(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEducation = () => {
        if (!educationForm.institution || !educationForm.degree || !educationForm.fieldOfStudy || !educationForm.startDate) {
            showAlert({ title: 'Error', message: 'Please fill all required fields', type: 'error' });
            return;
        }

        if (editingEducationIndex !== null) {
            setEducation(prev => prev.map((item, i) => i === editingEducationIndex ? educationForm : item));
        } else {
            setEducation(prev => [...prev, educationForm]);
        }
        setShowEducationModal(false);
    };

    // Language handlers
    const handleAddLanguage = () => {
        setLanguageForm({ language: '', proficiency: 'basic' });
        setEditingLanguageIndex(null);
        setShowLanguageModal(true);
    };

    const handleEditLanguage = (index: number) => {
        const item = languages[index];
        setLanguageForm({ language: item.language, proficiency: item.proficiency });
        setEditingLanguageIndex(index);
        setShowLanguageModal(true);
    };

    const handleDeleteLanguage = (index: number) => {
        setLanguages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveLanguage = () => {
        if (!languageForm.language) {
            showAlert({ title: 'Error', message: 'Please enter a language', type: 'error' });
            return;
        }

        if (editingLanguageIndex !== null) {
            setLanguages(prev => prev.map((item, i) => i === editingLanguageIndex ? languageForm : item));
        } else {
            setLanguages(prev => [...prev, languageForm]);
        }
        setShowLanguageModal(false);
    };

    // Employment handlers
    const handleAddEmployment = () => {
        setEmploymentForm({ company: '', position: '', startDate: '', endDate: '', description: '' });
        setEditingEmploymentIndex(null);
        setShowEmploymentModal(true);
    };

    const handleEditEmployment = (index: number) => {
        const item = employment[index];
        setEmploymentForm({
            company: item.company,
            position: item.position,
            startDate: item.startDate,
            endDate: item.endDate || '',
            description: item.description || '',
        });
        setEditingEmploymentIndex(index);
        setShowEmploymentModal(true);
    };

    const handleDeleteEmployment = (index: number) => {
        setEmployment(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEmployment = () => {
        if (!employmentForm.company || !employmentForm.position || !employmentForm.startDate) {
            showAlert({ title: 'Error', message: 'Please fill all required fields', type: 'error' });
            return;
        }

        if (editingEmploymentIndex !== null) {
            setEmployment(prev => prev.map((item, i) => i === editingEmploymentIndex ? employmentForm : item));
        } else {
            setEmployment(prev => [...prev, employmentForm]);
        }
        setShowEmploymentModal(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Combine existing chips with any pending text in the input
            const pendingSkill = formData.skillsText.trim();
            let finalSkills = [...formData.skills];
            if (pendingSkill && !finalSkills.includes(pendingSkill)) {
                finalSkills.push(pendingSkill);
            }

            // Update profile
            const savedProfile = await profileService.updateMyProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phone, // Map phone to phoneNumber
                location: formData.location,
                bio: formData.bio,
                skills: finalSkills,
                avatar: profileImage || undefined,
                portfolio: portfolio,
                education: education,
                languages: languages,
                employment: employment,
            });

            // Update user data (firstName, lastName, email)
            if (user) {
                console.log('Updating user with email:', formData.email);
                const updatedUserData = await userService.updateMe({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    profileImage: profileImage || undefined,
                });
                console.log('User updated, response:', updatedUserData);

                updateUser({
                    ...user,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    profileImage: profileImage || user.profileImage,
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
        <>
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color={c.primary} />
                        ) : (
                            <Text style={{ color: c.primary, fontWeight: '700', fontSize: 16 }}>Save</Text>
                        )}
                    </TouchableOpacity>
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
                            <Text style={[styles.label, { color: c.subtext }]}>Email Address</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="your.email@example.com"
                                placeholderTextColor={c.subtext}
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
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Professional Summary</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                            value={formData.bio}
                            onChangeText={(text) => handleInputChange('bio', text)}
                            multiline
                            numberOfLines={4}
                            placeholder="Write a professional summary that highlights your expertise and what you offer to clients..."
                            placeholderTextColor={c.subtext}
                        />
                    </Card>

                    <Card variant="outlined" style={styles.sectionCard}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                        <View style={styles.inputGroup}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                {formData.skills.map((skill, index) => (
                                    <View key={index} style={[styles.skillChip, { backgroundColor: c.primary + '15' }]}>
                                        <Text style={[styles.skillChipText, { color: c.primary }]}>{skill}</Text>
                                        <TouchableOpacity onPress={() => {
                                            const newSkills = [...formData.skills];
                                            newSkills.splice(index, 1);
                                            setFormData(prev => ({ ...prev, skills: newSkills, skillsText: newSkills.join(', ') }));
                                        }}>
                                            <Ionicons name="close-circle" size={16} color={c.primary} style={{ marginLeft: 6 }} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View style={[styles.skillInputContainer, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                <TextInput
                                    style={[styles.skillInput, { color: c.text }]}
                                    value={formData.skillsText}
                                    onChangeText={(text) => {
                                        if (text.endsWith(',')) {
                                            const newSkill = text.slice(0, -1).trim();
                                            if (newSkill && !formData.skills.includes(newSkill)) {
                                                const newSkills = [...formData.skills, newSkill];
                                                setFormData(prev => ({
                                                    ...prev,
                                                    skills: newSkills,
                                                    skillsText: ''
                                                }));
                                            } else {
                                                setFormData(prev => ({ ...prev, skillsText: '' }));
                                            }
                                        } else {
                                            setFormData(prev => ({ ...prev, skillsText: text }));
                                        }
                                    }}
                                    onSubmitEditing={({ nativeEvent: { text } }) => {
                                        const newSkill = text.trim();
                                        if (newSkill && !formData.skills.includes(newSkill)) {
                                            const newSkills = [...formData.skills, newSkill];
                                            setFormData(prev => ({
                                                ...prev,
                                                skills: newSkills,
                                                skillsText: ''
                                            }));
                                        }
                                    }}
                                    placeholder="Add a skill (e.g. React, UI Design)..."
                                    placeholderTextColor={c.subtext}
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        const text = formData.skillsText;
                                        const newSkill = text.trim();
                                        if (newSkill && !formData.skills.includes(newSkill)) {
                                            const newSkills = [...formData.skills, newSkill];
                                            setFormData(prev => ({
                                                ...prev,
                                                skills: newSkills,
                                                skillsText: ''
                                            }));
                                        }
                                    }}
                                    style={{ padding: 10 }}
                                >
                                    <Ionicons name="add-circle" size={26} color={c.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>

                    {/* Portfolio Section */}
                    <Card variant="outlined" style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Portfolio</Text>
                            <Button
                                title="Add Work"
                                onPress={handleAddPortfolio}
                                variant="outline"
                                size="small"
                                style={{ height: 32, paddingHorizontal: 12 }}
                            />
                        </View>

                        {portfolio.length > 0 ? (
                            <View style={{ gap: 16, marginTop: 12 }}>
                                {portfolio.map((item, index) => (
                                    <View key={index} style={[styles.portfolioItem, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                        {item.imageUrl ? (
                                            <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
                                        ) : (
                                            <View style={[styles.portfolioImagePlaceholder, { backgroundColor: c.border }]}>
                                                <Ionicons name="image-outline" size={24} color={c.subtext} />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.portfolioTitle, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                                            <Text style={[styles.portfolioDesc, { color: c.subtext }]} numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                        </View>
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity onPress={() => handleEditPortfolio(index)} style={styles.actionIcon}>
                                                <Ionicons name="pencil" size={18} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeletePortfolio(index)} style={styles.actionIcon}>
                                                <Ionicons name="trash" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="briefcase-outline" size={40} color={c.border} />
                                <Text style={[styles.emptyText, { color: c.subtext }]}>
                                    Showcase your best work to attract clients.
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Education Section */}
                    <Card variant="outlined" style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Education</Text>
                            <Button
                                title="Add"
                                onPress={handleAddEducation}
                                variant="outline"
                                size="small"
                                style={{ height: 32, paddingHorizontal: 12 }}
                            />
                        </View>
                        {education.length > 0 ? (
                            <View style={{ gap: 12, marginTop: 12 }}>
                                {education.map((item, index) => (
                                    <View key={index} style={[styles.listItem, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: c.text }]}>{item.degree}</Text>
                                            <Text style={[styles.itemSubtitle, { color: c.subtext }]}>{item.institution}</Text>
                                            <Text style={[styles.itemMeta, { color: c.subtext }]}>
                                                {item.startDate} — {item.endDate || 'Present'}
                                            </Text>
                                        </View>
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity onPress={() => handleEditEducation(index)} style={styles.actionIcon}>
                                                <Ionicons name="pencil" size={18} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteEducation(index)} style={styles.actionIcon}>
                                                <Ionicons name="trash" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="school-outline" size={40} color={c.border} />
                                <Text style={[styles.emptyText, { color: c.subtext }]}>Add your academic background.</Text>
                            </View>
                        )}
                    </Card>

                    {/* Employment Section */}
                    <Card variant="outlined" style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Work Experience</Text>
                            <Button
                                title="Add"
                                onPress={handleAddEmployment}
                                variant="outline"
                                size="small"
                                style={{ height: 32, paddingHorizontal: 12 }}
                            />
                        </View>
                        {employment.length > 0 ? (
                            <View style={{ gap: 12, marginTop: 12 }}>
                                {employment.map((item, index) => (
                                    <View key={index} style={[styles.listItem, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: c.text }]}>{item.position}</Text>
                                            <Text style={[styles.itemSubtitle, { color: c.subtext }]}>{item.company}</Text>
                                            <Text style={[styles.itemMeta, { color: c.subtext }]}>
                                                {item.startDate} — {item.endDate || 'Present'}
                                            </Text>
                                        </View>
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity onPress={() => handleEditEmployment(index)} style={styles.actionIcon}>
                                                <Ionicons name="pencil" size={18} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteEmployment(index)} style={styles.actionIcon}>
                                                <Ionicons name="trash" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="business-outline" size={40} color={c.border} />
                                <Text style={[styles.emptyText, { color: c.subtext }]}>Add your professional experience.</Text>
                            </View>
                        )}
                    </Card>

                    <Button
                        title="Update Profile"
                        onPress={handleSave}
                        loading={saving}
                        size="large"
                        style={{ marginTop: 8, marginBottom: 40 }}
                    />

                </ScrollView>
            </SafeAreaView>

            {/* Portfolio Modal */}
            <Modal
                visible={showPortfolioModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPortfolioModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>
                                {editingPortfolioIndex !== null ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowPortfolioModal(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Title *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={portfolioForm.title}
                                    onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, title: text }))}
                                    placeholder="Project name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Description *</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={portfolioForm.description}
                                    onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, description: text }))}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Describe your project..."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Project Image</Text>
                                {portfolioForm.imageUrl ? (
                                    <View>
                                        <Image source={{ uri: portfolioForm.imageUrl }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            style={[styles.changeImageButton, { backgroundColor: c.primary }]}
                                            onPress={handlePickPortfolioImage}
                                            disabled={uploadingImage}
                                        >
                                            <Text style={{ color: 'white' }}>
                                                {uploadingImage ? 'Uploading...' : 'Change Image'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.uploadButton, { backgroundColor: c.card, borderColor: c.border }]}
                                        onPress={handlePickPortfolioImage}
                                        disabled={uploadingImage}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={32} color={c.subtext} />
                                        <Text style={[styles.uploadText, { color: c.subtext }]}>
                                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Project URL</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={portfolioForm.projectUrl}
                                    onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, projectUrl: text }))}
                                    placeholder="https://example.com"
                                    placeholderTextColor={c.subtext}
                                    keyboardType="url"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Tags (comma separated)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={portfolioForm.tags}
                                    onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, tags: text }))}
                                    placeholder="React, Design, Mobile"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <Button
                                title={editingPortfolioIndex !== null ? 'Update Item' : 'Add Item'}
                                onPress={handleSavePortfolioItem}
                                size="large"
                                style={{ marginTop: 16 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Education Modal */}
            <Modal
                visible={showEducationModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEducationModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>
                                {editingEducationIndex !== null ? 'Edit Education' : 'Add Education'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEducationModal(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Institution *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.institution}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, institution: text }))}
                                    placeholder="University name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Degree *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.degree}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, degree: text }))}
                                    placeholder="Bachelor's, Master's, etc."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Field of Study *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.fieldOfStudy}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, fieldOfStudy: text }))}
                                    placeholder="Computer Science, Business, etc."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.startDate}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, startDate: text }))}
                                    placeholder="2020"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>End Date (or leave empty if current)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.endDate}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, endDate: text }))}
                                    placeholder="2024"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <Button
                                title={editingEducationIndex !== null ? 'Update' : 'Add'}
                                onPress={handleSaveEducation}
                                size="large"
                                style={{ marginTop: 16 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>
                                {editingLanguageIndex !== null ? 'Edit Language' : 'Add Language'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Language *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={languageForm.language}
                                    onChangeText={(text) => setLanguageForm(prev => ({ ...prev, language: text }))}
                                    placeholder="English, Spanish, French, etc."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Proficiency *</Text>
                                <View style={{ gap: 8 }}>
                                    {['basic', 'conversational', 'fluent', 'native'].map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.radioOption,
                                                { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border },
                                                languageForm.proficiency === level && { borderColor: c.primary, borderWidth: 2 }
                                            ]}
                                            onPress={() => setLanguageForm(prev => ({ ...prev, proficiency: level }))}
                                        >
                                            <Text style={[styles.radioText, { color: c.text }]}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </Text>
                                            {languageForm.proficiency === level && (
                                                <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <Button
                                title={editingLanguageIndex !== null ? 'Update' : 'Add'}
                                onPress={handleSaveLanguage}
                                size="large"
                                style={{ marginTop: 16 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Employment Modal */}
            <Modal
                visible={showEmploymentModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEmploymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>
                                {editingEmploymentIndex !== null ? 'Edit Work Experience' : 'Add Work Experience'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEmploymentModal(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Company *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={employmentForm.company}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, company: text }))}
                                    placeholder="Company name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Position *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={employmentForm.position}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, position: text }))}
                                    placeholder="Job title"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={employmentForm.startDate}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, startDate: text }))}
                                    placeholder="Jan 2020"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>End Date (or leave empty if current)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={employmentForm.endDate}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, endDate: text }))}
                                    placeholder="Dec 2023"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={employmentForm.description}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, description: text }))}
                                    placeholder="Describe your responsibilities and achievements..."
                                    placeholderTextColor={c.subtext}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <Button
                                title={editingEmploymentIndex !== null ? 'Update' : 'Add'}
                                onPress={handleSaveEmployment}
                                size="large"
                                style={{ marginTop: 16 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 16,
    },
    photoSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    photoHint: {
        fontSize: 12,
        marginTop: 12,
        fontWeight: '500',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    sectionCard: {
        marginBottom: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 2,
    },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    inputWithIcon: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputNoBorder: {
        flex: 1,
        height: 50,
        paddingHorizontal: 12,
        fontSize: 15,
    },
    textArea: {
        minHeight: 120,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        textAlignVertical: 'top',
        fontSize: 15,
        lineHeight: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    portfolioItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    portfolioImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    portfolioImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    portfolioTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    portfolioDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    listItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 12,
        fontWeight: '500',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionIcon: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '80%',
    },
    skillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    skillChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    skillInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingRight: 4,
    },
    skillInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalBody: {
        padding: 24,
    },
    saveButton: {
        height: 54,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
