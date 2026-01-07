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
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.photoPlaceholder, { backgroundColor: c.card }]}>
                                <Ionicons name="person" size={40} color={c.subtext} />
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.editPhotoButton, { backgroundColor: c.primary }]}
                            onPress={handlePickImage}
                            disabled={uploadingImage}
                        >
                            {uploadingImage ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="camera" size={16} color="white" />
                            )}
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
                                style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
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
                            <Text style={[styles.label, { color: c.subtext }]}>Your Skills</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {formData.skills.map((skill, index) => (
                                    <View key={index} style={[styles.skillChip, { backgroundColor: c.primary + '20' }]}>
                                        <Text style={[styles.skillChipText, { color: c.primary }]}>{skill}</Text>
                                        <TouchableOpacity onPress={() => {
                                            const newSkills = [...formData.skills];
                                            newSkills.splice(index, 1);
                                            setFormData(prev => ({ ...prev, skills: newSkills, skillsText: newSkills.join(', ') }));
                                        }}>
                                            <Ionicons name="close-circle" size={16} color={c.primary} style={{ marginLeft: 4 }} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View style={[styles.skillInputContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                                <TextInput
                                    style={[styles.skillInput, { color: c.text }]}
                                    value={formData.skillsText}
                                    onChangeText={(text) => {
                                        // If ends with comma, add as chip
                                        if (text.endsWith(',')) {
                                            const newSkill = text.slice(0, -1).trim();
                                            if (newSkill && !formData.skills.includes(newSkill)) {
                                                const newSkills = [...formData.skills, newSkill];
                                                setFormData(prev => ({
                                                    ...prev,
                                                    skills: newSkills,
                                                    skillsText: '' // Clear input
                                                }));
                                            } else {
                                                setFormData(prev => ({ ...prev, skillsText: '' })); // Just clear if empty or duplicate
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
                                    placeholder="Type a skill and press comma or enter..."
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
                                    style={{ padding: 8 }}
                                >
                                    <Ionicons name="add-circle" size={24} color={c.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Portfolio Section */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Portfolio</Text>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: c.primary }]}
                                onPress={handleAddPortfolio}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={{ color: 'white', marginLeft: 4, fontWeight: '600' }}>Add Item</Text>
                            </TouchableOpacity>
                        </View>

                        {portfolio.length > 0 ? (
                            <View style={{ gap: 12 }}>
                                {portfolio.map((item, index) => (
                                    <View key={index} style={[styles.portfolioItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                        {item.imageUrl && (
                                            <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.portfolioTitle, { color: c.text }]}>{item.title}</Text>
                                            <Text style={[styles.portfolioDesc, { color: c.subtext }]} numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                            {item.tags && item.tags.length > 0 && (
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                                    {item.tags.map((tag, i) => (
                                                        <View key={i} style={[styles.tag, { backgroundColor: c.primary + '20' }]}>
                                                            <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity onPress={() => handleEditPortfolio(index)}>
                                                <Ionicons name="pencil" size={20} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeletePortfolio(index)}>
                                                <Ionicons name="trash" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: c.subtext }]}>
                                No portfolio items yet. Add your work to showcase your skills!
                            </Text>
                        )}
                    </View>

                    {/* Education Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Education</Text>
                            <TouchableOpacity onPress={handleAddEducation}>
                                <Ionicons name="add-circle" size={28} color={c.primary} />
                            </TouchableOpacity>
                        </View>
                        {education.length > 0 ? (
                            <View style={{ gap: 12 }}>
                                {education.map((item, index) => (
                                    <View key={index} style={[styles.portfolioItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.portfolioTitle, { color: c.text }]}>{item.degree} in {item.fieldOfStudy}</Text>
                                            <Text style={[styles.portfolioDesc, { color: c.subtext }]}>{item.institution}</Text>
                                            <Text style={[styles.portfolioTags, { color: c.subtext }]}>
                                                {item.startDate} - {item.endDate || 'Present'}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => handleEditEducation(index)}>
                                                <Ionicons name="pencil" size={20} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteEducation(index)}>
                                                <Ionicons name="trash" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: c.subtext }]}>
                                No education added yet.
                            </Text>
                        )}
                    </View>

                    {/* Languages Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Languages</Text>
                            <TouchableOpacity onPress={handleAddLanguage}>
                                <Ionicons name="add-circle" size={28} color={c.primary} />
                            </TouchableOpacity>
                        </View>
                        {languages.length > 0 ? (
                            <View style={{ gap: 12 }}>
                                {languages.map((item, index) => (
                                    <View key={index} style={[styles.portfolioItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.portfolioTitle, { color: c.text }]}>{item.language}</Text>
                                            <Text style={[styles.portfolioDesc, { color: c.subtext }]}>
                                                {item.proficiency.charAt(0).toUpperCase() + item.proficiency.slice(1)}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => handleEditLanguage(index)}>
                                                <Ionicons name="pencil" size={20} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteLanguage(index)}>
                                                <Ionicons name="trash" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: c.subtext }]}>
                                No languages added yet.
                            </Text>
                        )}
                    </View>

                    {/* Employment Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Work Experience</Text>
                            <TouchableOpacity onPress={handleAddEmployment}>
                                <Ionicons name="add-circle" size={28} color={c.primary} />
                            </TouchableOpacity>
                        </View>
                        {employment.length > 0 ? (
                            <View style={{ gap: 12 }}>
                                {employment.map((item, index) => (
                                    <View key={index} style={[styles.portfolioItem, { backgroundColor: c.card, borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.portfolioTitle, { color: c.text }]}>{item.position}</Text>
                                            <Text style={[styles.portfolioDesc, { color: c.subtext }]}>{item.company}</Text>
                                            <Text style={[styles.portfolioTags, { color: c.subtext }]}>
                                                {item.startDate} - {item.endDate || 'Present'}
                                            </Text>
                                            {item.description && (
                                                <Text style={[styles.portfolioDesc, { color: c.subtext, marginTop: 4 }]}>
                                                    {item.description}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => handleEditEmployment(index)}>
                                                <Ionicons name="pencil" size={20} color={c.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteEmployment(index)}>
                                                <Ionicons name="trash" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: c.subtext }]}>
                                No work experience added yet.
                            </Text>
                        )}
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
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
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
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={portfolioForm.tags}
                                    onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, tags: text }))}
                                    placeholder="React, Design, Mobile"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary, marginTop: 8 }]}
                                onPress={handleSavePortfolioItem}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingPortfolioIndex !== null ? 'Update Item' : 'Add Item'}
                                </Text>
                            </TouchableOpacity>
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
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={educationForm.institution}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, institution: text }))}
                                    placeholder="University name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Degree *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={educationForm.degree}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, degree: text }))}
                                    placeholder="Bachelor's, Master's, etc."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Field of Study *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={educationForm.fieldOfStudy}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, fieldOfStudy: text }))}
                                    placeholder="Computer Science, Business, etc."
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={educationForm.startDate}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, startDate: text }))}
                                    placeholder="2020"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>End Date (or leave empty if current)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={educationForm.endDate}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, endDate: text }))}
                                    placeholder="2024"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary, marginTop: 8 }]}
                                onPress={handleSaveEducation}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingEducationIndex !== null ? 'Update' : 'Add'}
                                </Text>
                            </TouchableOpacity>
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
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
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
                                                { backgroundColor: c.card, borderColor: c.border },
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

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary, marginTop: 8 }]}
                                onPress={handleSaveLanguage}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingLanguageIndex !== null ? 'Update' : 'Add'}
                                </Text>
                            </TouchableOpacity>
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
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={employmentForm.company}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, company: text }))}
                                    placeholder="Company name"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Position *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={employmentForm.position}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, position: text }))}
                                    placeholder="Job title"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={employmentForm.startDate}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, startDate: text }))}
                                    placeholder="Jan 2020"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>End Date (or leave empty if current)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={employmentForm.endDate}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, endDate: text }))}
                                    placeholder="Dec 2023"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                                    value={employmentForm.description}
                                    onChangeText={(text) => setEmploymentForm(prev => ({ ...prev, description: text }))}
                                    placeholder="Describe your responsibilities and achievements..."
                                    placeholderTextColor={c.subtext}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary, marginTop: 8 }]}
                                onPress={handleSaveEmployment}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingEmploymentIndex !== null ? 'Update' : 'Add'}
                                </Text>
                            </TouchableOpacity>
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    portfolioItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
    },
    portfolioImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    portfolioTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    portfolioDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        padding: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 20,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    changeImageButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButton: {
        padding: 40,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    radioText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    portfolioTags: {
        fontSize: 12,
        marginTop: 4,
    },
    skillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    skillChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    skillInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingRight: 8,
    },
    skillInput: {
        flex: 1,
        height: 48,
        paddingHorizontal: 16,
    },
});
