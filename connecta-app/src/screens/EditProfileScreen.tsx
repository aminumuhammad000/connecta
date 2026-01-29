import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal, useWindowDimensions } from 'react-native';
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
import { PortfolioItem } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import LocationPicker from '../components/LocationPicker';

export default function EditProfileScreen({ navigation }: any) {
    const c = useThemeColors();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const { user, updateUser } = useAuth();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

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
        category: 'University',
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

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState<{ form: string, field: string } | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        jobTitle: '',
        skills: [] as string[],
        skillsText: '',
    });

    const openDatePicker = (form: string, field: string, currentVal: string) => {
        setDatePickerTarget({ form, field });
        if (currentVal) {
            if (currentVal.includes('-')) {
                // Handle YYYY-MM-DD
                const parts = currentVal.split('-');
                if (parts.length >= 2) {
                    setSelectedYear(parseInt(parts[0]));
                    setSelectedMonth(parseInt(parts[1]) - 1);
                }
            } else {
                // Handle old "Jan 2025" format
                const [m, y] = currentVal.split(' ');
                const monthIdx = months.indexOf(m);
                if (monthIdx !== -1) setSelectedMonth(monthIdx);
                if (y) setSelectedYear(parseInt(y));
            }
        }
        setShowDatePicker(true);
    };

    const handleConfirmDate = () => {
        // Save as YYYY-MM-DD to avoid time issues on server
        const month = (selectedMonth + 1).toString().padStart(2, '0');
        const dateStr = `${selectedYear}-${month}-01`;

        if (datePickerTarget?.form === 'education') {
            setEducationForm(prev => ({ ...prev, [datePickerTarget.field]: dateStr }));
        } else if (datePickerTarget?.form === 'employment') {
            setEmploymentForm(prev => ({ ...prev, [datePickerTarget.field]: dateStr }));
        }
        setShowDatePicker(false);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    const loadProfile = async () => {
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
                jobTitle: profile?.jobTitle || '',
                skills: profile?.skills || [],
                skillsText: '',
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

                // Show local preview immediately
                setPortfolioForm(prev => ({ ...prev, imageUrl: imageUri }));
                setUploadingImage(true);

                try {
                    const uploadedUrl = await uploadPortfolioImage(imageUri);
                    // Update with final remote URL
                    setPortfolioForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
                } catch (uploadError: any) {
                    console.error('Upload error:', uploadError);
                    showAlert({ title: 'Error', message: 'Failed to upload image', type: 'error' });
                    // Optionally clear the local preview if upload fails
                    // setPortfolioForm(prev => ({ ...prev, imageUrl: '' }));
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
        setEducationForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', category: 'University' });
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
            category: item.category || 'University',
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

    const generateAIBio = async () => {
        try {
            setIsGeneratingBio(true);
            const prompt = `Generate a professional summary for a freelancer named ${formData.firstName} with skills: ${formData.skills.join(', ') || 'various skills'}. The summary must be short, between 10 and 20 words. Return ONLY the summary text, no conversational filler.`;
            const generatedBio = await aiService.sendAIQuery(prompt, user?._id || '', 'freelancer');

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
            showAlert({ title: 'Error', message: 'Failed to generate AI summary', type: 'error' });
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Combine existing chips with any pending text in the input
            let finalSkills = [...formData.skills];
            if (formData.skillsText.trim()) {
                const pendingSkills = formData.skillsText.split(',')
                    .map(s => s.trim())
                    .filter(s => s !== '' && !finalSkills.includes(s));
                finalSkills = [...finalSkills, ...pendingSkills];
            }

            // Update profile
            const savedProfile = await profileService.updateMyProfile({
                phoneNumber: formData.phone, // Map phone to phoneNumber
                location: formData.location,
                bio: formData.bio,
                jobTitle: formData.jobTitle,
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
                                    <Ionicons name="camera" size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.photoHint, { color: c.text, fontWeight: '600' }]}>
                            {uploadingImage ? 'Uploading your photo...' : 'Tap to change profile picture'}
                        </Text>
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
                            <LocationPicker
                                value={formData.location}
                                onValueChange={(location) => handleInputChange('location', location)}
                                label="LOCATION"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.subtext }]}>Professional Title</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                value={formData.jobTitle}
                                onChangeText={(text) => handleInputChange('jobTitle', text)}
                                placeholder="e.g. Senior Full Stack Developer"
                                placeholderTextColor={c.subtext}
                            />
                        </View>
                    </Card>

                    <Card variant="outlined" style={styles.sectionCard}>
                        <View style={styles.bioHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Professional Summary</Text>
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
                            style={[styles.textArea, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border, marginTop: 16 }]}
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
                                            setFormData(prev => ({ ...prev, skills: newSkills }));
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
                                        const text = formData.skillsText.trim();
                                        if (text) {
                                            const newSkillsList = text.split(',')
                                                .map(s => s.trim())
                                                .filter(s => s !== '' && !formData.skills.includes(s));

                                            if (newSkillsList.length > 0) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    skills: [...prev.skills, ...newSkillsList],
                                                    skillsText: ''
                                                }));
                                            } else {
                                                setFormData(prev => ({ ...prev, skillsText: '' }));
                                            }
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
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 4 }]}>Portfolio</Text>
                                <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>Showcase your work</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: c.primary }]}
                            onPress={handleAddPortfolio}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.addButtonIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="add" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addButtonTitle, { color: '#FFF' }]}>Add Project</Text>
                                <Text style={[styles.addButtonSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Show clients your best work</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>

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
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 4 }]}>Education</Text>
                                <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>Academic background</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: c.primary }]}
                            onPress={handleAddEducation}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.addButtonIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="school" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addButtonTitle, { color: '#FFF' }]}>Add Education</Text>
                                <Text style={[styles.addButtonSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Degrees, certificates, etc.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                        {education.length > 0 ? (
                            <View style={{ gap: 12, marginTop: 12 }}>
                                {education.map((item, index) => (
                                    <View key={index} style={[styles.listItem, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <View style={[styles.roleCountBadge, { backgroundColor: c.primary + '15', paddingVertical: 2 }]}>
                                                    <Text style={{ color: c.primary, fontSize: 9, fontWeight: '800' }}>{item.category?.toUpperCase() || 'UNIVERSITY'}</Text>
                                                </View>
                                                <Text style={[styles.itemTitle, { color: c.text, marginBottom: 0 }]}>{item.degree}</Text>
                                            </View>
                                            <Text style={[styles.itemSubtitle, { color: c.subtext }]}>{item.institution}</Text>
                                            <Text style={[styles.itemMeta, { color: c.subtext }]}>
                                                {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Present'}
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
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 4 }]}>Work Experience</Text>
                                <Text style={[styles.sectionSubtitle, { color: c.subtext }]}>Professional history</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: c.primary }]}
                            onPress={handleAddEmployment}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.addButtonIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="briefcase" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addButtonTitle, { color: '#FFF' }]}>Add Experience</Text>
                                <Text style={[styles.addButtonSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Past jobs and roles</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                        {employment.length > 0 ? (
                            <View style={{ gap: 12, marginTop: 12 }}>
                                {employment.map((item, index) => (
                                    <View key={index} style={[styles.listItem, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: c.text }]}>{item.position}</Text>
                                            <Text style={[styles.itemSubtitle, { color: c.subtext }]}>{item.company}</Text>
                                            <Text style={[styles.itemMeta, { color: c.subtext }]}>
                                                {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Present'}
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

                </ScrollView>

                <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border }]}>
                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={saving}
                        size="large"
                    />
                </View>
            </SafeAreaView>

            {/* Portfolio Modal */}
            <Modal
                visible={showPortfolioModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPortfolioModal(false)}
            >
                <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: c.background },
                        isDesktop && { width: '100%', maxWidth: 500, borderRadius: 24, paddingBottom: 0 }
                    ]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border, padding: 16 }]}>
                            <TouchableOpacity onPress={() => setShowPortfolioModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: c.text, fontSize: 17 }]}>
                                {editingPortfolioIndex !== null ? 'Edit Project' : 'Add Project'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSavePortfolioItem}
                                style={{
                                    backgroundColor: c.primary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 100,
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        >
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
                                    <View style={[styles.previewContainer, { borderColor: c.border }]}>
                                        <Image
                                            source={{ uri: portfolioForm.imageUrl }}
                                            style={styles.previewImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.previewOverlay}>
                                            <TouchableOpacity
                                                style={[styles.changeImageButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                                                onPress={handlePickPortfolioImage}
                                                disabled={uploadingImage}
                                            >
                                                <Ionicons name="camera" size={18} color="white" style={{ marginRight: 6 }} />
                                                <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
                                                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        {uploadingImage && (
                                            <View style={styles.uploadingOverlay}>
                                                <ActivityIndicator size="small" color="white" />
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.uploadButton,
                                            {
                                                backgroundColor: c.primary + '05',
                                                borderColor: c.primary,
                                                borderWidth: 2,
                                                borderStyle: 'dashed'
                                            }
                                        ]}
                                        onPress={handlePickPortfolioImage}
                                        disabled={uploadingImage}
                                    >
                                        <View style={{ backgroundColor: c.primary + '15', padding: 15, borderRadius: 40, marginBottom: 10 }}>
                                            <Ionicons name="cloud-upload" size={36} color={c.primary} />
                                        </View>
                                        <Text style={[styles.uploadText, { color: c.primary, fontWeight: '700' }]}>
                                            {uploadingImage ? 'Uploading...' : 'Upload Project Image'}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: c.subtext }}>PNG, JPG or WEBP (Max 5MB)</Text>
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
                        </ScrollView>

                        {/* Sticky Footer */}
                        <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border, padding: 16 }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary }]}
                                onPress={handleSavePortfolioItem}
                            >
                                <Text style={styles.saveButtonText}>Save Project</Text>
                            </TouchableOpacity>
                        </View>
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
                <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: c.background },
                        isDesktop && { width: '100%', maxWidth: 500, borderRadius: 24, paddingBottom: 0 }
                    ]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border, padding: 16 }]}>
                            <TouchableOpacity onPress={() => setShowEducationModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: c.text, fontSize: 17 }]}>
                                {editingEducationIndex !== null ? 'Edit Education' : 'Add Education'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSaveEducation}
                                style={{
                                    backgroundColor: c.primary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 100,
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Degree / Certification *</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {['High School', 'Diploma', 'Associate', "Bachelor's", "Master's", 'Doctorate', 'Bootcamp', 'Certification'].map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            onPress={() => setEducationForm(prev => ({ ...prev, degree: level, category: level }))}
                                            style={[
                                                styles.nicheChip,
                                                {
                                                    backgroundColor: educationForm.degree === level ? c.primary : c.card,
                                                    borderColor: educationForm.degree === level ? c.primary : c.border
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.nicheText, { color: educationForm.degree === level ? '#FFF' : c.text }]}>{level}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: c.subtext }]}>Institution *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', color: c.text, borderColor: c.border }]}
                                    value={educationForm.institution}
                                    onChangeText={(text) => setEducationForm(prev => ({ ...prev, institution: text }))}
                                    placeholder="University or School name"
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

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}
                                        onPress={() => openDatePicker('education', 'startDate', educationForm.startDate)}
                                    >
                                        <Text style={{ color: educationForm.startDate ? c.text : c.subtext }}>
                                            {educationForm.startDate ? formatDate(educationForm.startDate) : 'Select Date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={18} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: c.subtext }]}>End Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}
                                        onPress={() => openDatePicker('education', 'endDate', educationForm.endDate)}
                                    >
                                        <Text style={{ color: educationForm.endDate ? c.text : c.subtext }}>
                                            {educationForm.endDate ? formatDate(educationForm.endDate) : 'Present'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={18} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Sticky Footer */}
                        <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border, padding: 16 }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary }]}
                                onPress={handleSaveEducation}
                            >
                                <Text style={styles.saveButtonText}>Save Education</Text>
                            </TouchableOpacity>
                        </View>
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
                <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: c.background },
                        isDesktop && { width: '100%', maxWidth: 400, borderRadius: 24, paddingBottom: 0 }
                    ]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border, padding: 16 }]}>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: c.text, fontSize: 17 }]}>
                                {editingLanguageIndex !== null ? 'Edit Language' : 'Add Language'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSaveLanguage}
                                style={{
                                    backgroundColor: c.primary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 100,
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        >
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
                        </ScrollView>

                        {/* Sticky Footer */}
                        <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border, padding: 16 }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary }]}
                                onPress={handleSaveLanguage}
                            >
                                <Text style={styles.saveButtonText}>Save Language</Text>
                            </TouchableOpacity>
                        </View>
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
                <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: c.background },
                        isDesktop && { width: '100%', maxWidth: 500, borderRadius: 24, paddingBottom: 0 }
                    ]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border, padding: 16 }]}>
                            <TouchableOpacity onPress={() => setShowEmploymentModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: c.text, fontSize: 17 }]}>
                                {editingEmploymentIndex !== null ? 'Edit Work' : 'Add Work'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSaveEmployment}
                                style={{
                                    backgroundColor: c.primary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 100,
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        >
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

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: c.subtext }]}>Start Date *</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}
                                        onPress={() => openDatePicker('employment', 'startDate', employmentForm.startDate)}
                                    >
                                        <Text style={{ color: employmentForm.startDate ? c.text : c.subtext }}>
                                            {employmentForm.startDate ? formatDate(employmentForm.startDate) : 'Select Date'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={18} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: c.subtext }]}>End Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { backgroundColor: c.isDark ? '#1F2937' : '#F9FAFB', borderColor: c.border }]}
                                        onPress={() => openDatePicker('employment', 'endDate', employmentForm.endDate)}
                                    >
                                        <Text style={{ color: employmentForm.endDate ? c.text : c.subtext }}>
                                            {employmentForm.endDate ? formatDate(employmentForm.endDate) : 'Present'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={18} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>
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
                        </ScrollView>

                        {/* Sticky Footer */}
                        <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border, padding: 16 }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary }]}
                                onPress={handleSaveEmployment}
                            >
                                <Text style={styles.saveButtonText}>Save Experience</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[
                        styles.datePickerContent,
                        { backgroundColor: c.background },
                        isDesktop && { width: '100%', maxWidth: 400, borderRadius: 24, paddingBottom: 20 }
                    ]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.pickerLabel, { color: c.subtext }]}>Month</Text>
                                <ScrollView style={{ height: 200 }}>
                                    {months.map((m, i) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.pickerItem, selectedMonth === i && { backgroundColor: c.primary + '20' }]}
                                            onPress={() => setSelectedMonth(i)}
                                        >
                                            <Text style={[styles.pickerItemText, { color: selectedMonth === i ? c.primary : c.text }]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={[styles.pickerLabel, { color: c.subtext }]}>Year</Text>
                                <ScrollView style={{ height: 200 }}>
                                    {years.map((y) => (
                                        <TouchableOpacity
                                            key={y}
                                            style={[styles.pickerItem, selectedYear === y && { backgroundColor: c.primary + '20' }]}
                                            onPress={() => setSelectedYear(y)}
                                        >
                                            <Text style={[styles.pickerItemText, { color: selectedYear === y ? c.primary : c.text }]}>{y}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <Button
                            title="Confirm"
                            onPress={handleConfirmDate}
                            style={{ margin: 20 }}
                        />
                    </View>
                </View>
            </Modal >
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
    previewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    uploadButton: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '500',
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
    dateInput: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    datePickerContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
    },
    pickerRow: {
        flexDirection: 'row',
        padding: 20,
        gap: 20,
    },
    pickerLabel: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        textAlign: 'center',
    },
    pickerItem: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    pickerItemText: {
        fontSize: 16,
        fontWeight: '600',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    radioText: {
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingBottom: 16,
    },
    roleCountBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
    },
    nicheChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    },
    nicheText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // New Styles for Prominent Add Buttons
    sectionHeaderRow: {
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    addButtonSubtitle: {
        fontSize: 12,
    },
});
