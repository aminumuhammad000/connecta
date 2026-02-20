import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import * as profileService from '../services/profileService';
import * as userService from '../services/userService';
import { useInAppAlert } from '../components/InAppAlert';
import { Profile } from '../types';

const CATEGORIES = [
    'Web Development', 'Mobile Dev', 'Design', 'Writing', 'Data Science',
    'Marketing', 'Sales', 'Customer Support', 'Virtual Assistant', 'Video Editing',
    'Blockchain', 'AI/ML', 'DevOps', 'Cybersecurity', 'Game Dev'
];

const REMOTE_TYPES = ['Fully Remote', 'Hybrid (Mostly Remote)', 'Hybrid (Occasional)'];
const EXPERIENCE_LEVELS = ['Less than 1 year', '1-3 years', '3-5 years', '5+ years', '10+ years'];
const ENGAGEMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const FREQUENCIES = ['Daily', 'Weekly', 'Only when highly relevant'];

const JobPreferencesScreen: React.FC<any> = ({ navigation }) => {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    // Form State
    const [remoteType, setRemoteType] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [experience, setExperience] = useState('');
    const [selectedEngagements, setSelectedEngagements] = useState<string[]>([]);
    const [frequency, setFrequency] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await profileService.getMyProfile();
            setProfile(data);

            // Map profile data to form state
            if (data) {
                // Map backend enum to UI label
                const remoteMap: any = { 'remote_only': 'Fully Remote', 'hybrid': 'Hybrid (Mostly Remote)', 'onsite': 'Hybrid (Occasional)' };
                setRemoteType(remoteMap[data.remoteWorkType as string] || data.remoteWorkType || '');

                setMinSalary(data.minimumSalary?.toString() || '');
                setLocation(data.location || '');
                setJobTitle(data.jobTitle || '');
                setSelectedCategories(data.jobCategories || []);

                // Map backend number to UI label
                const expMap: any = { '0': 'Less than 1 year', '1': '1-3 years', '3': '3-5 years', '5': '5+ years', '10': '10+ years' };
                setExperience(expMap[data.yearsOfExperience?.toString() || ''] || data.yearsOfExperience?.toString() || '');

                // Map backend enum to UI label for engagement types
                const engMap: any = { 'full_time': 'Full-time', 'part_time': 'Part-time', 'contract': 'Contract', 'freelance': 'Freelance', 'internship': 'Internship' };
                setSelectedEngagements((data.engagementTypes || []).map((t: string) => engMap[t] || t));

                const freqMap: any = { 'daily': 'Daily', 'weekly': 'Weekly', 'relevant_only': 'Only when highly relevant' };
                setFrequency(freqMap[data.jobNotificationFrequency as string] || data.jobNotificationFrequency || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showAlert({ title: 'Error', message: 'Failed to load preferences', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Map UI label back to backend enum
            const remoteMap: any = { 'Fully Remote': 'remote_only', 'Hybrid (Mostly Remote)': 'hybrid', 'Hybrid (Occasional)': 'onsite' };
            const freqMap: any = { 'Daily': 'daily', 'Weekly': 'weekly', 'Only when highly relevant': 'relevant_only' };
            const expMap: any = { 'Less than 1 year': 0, '1-3 years': 1, '3-5 years': 3, '5+ years': 5, '10+ years': 10 };

            const updates: Partial<Profile> = {
                remoteWorkType: remoteMap[remoteType] || remoteType,
                minimumSalary: parseInt(minSalary) || 0,
                location: location,
                jobTitle: jobTitle,
                jobCategories: selectedCategories,
                yearsOfExperience: expMap[experience] ?? parseInt(experience) ?? 0,
                engagementTypes: selectedEngagements.map(t => {
                    const engMap: any = { 'Full-time': 'full_time', 'Part-time': 'part_time', 'Contract': 'contract', 'Freelance': 'freelance', 'Internship': 'internship' };
                    return engMap[t] || t;
                }),
                jobNotificationFrequency: freqMap[frequency] || frequency,
            };

            // Also update user email frequency preference
            await userService.updateMe({
                emailFrequency: freqMap[frequency] || frequency
            });

            console.log('[Preferences] Sending updates to server:', updates);
            await profileService.updateMyProfile(updates);
            showAlert({ title: 'Success', message: 'Preferences updated successfully', type: 'success' });
            navigation.goBack();
        } catch (error) {
            console.error('Error saving preferences:', error);
            showAlert({ title: 'Error', message: 'Failed to save preferences', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            if (selectedCategories.length < 5) {
                setSelectedCategories([...selectedCategories, cat]);
            }
        }
    };

    const toggleEngagement = (type: string) => {
        if (selectedEngagements.includes(type)) {
            setSelectedEngagements(selectedEngagements.filter(t => t !== type));
        } else {
            setSelectedEngagements([...selectedEngagements, type]);
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
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
            <View style={[styles.header, { backgroundColor: c.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: c.card }]}>
                    <Ionicons name="chevron-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Preferences</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Work Style Section */}
                    <View style={[styles.sectionCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#3B82F620' }]}>
                                <MaterialIcons name="work-outline" size={20} color="#3B82F6" />
                            </View>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Work Style</Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Remote Preference</Text>
                            <View style={styles.optionsRow}>
                                {REMOTE_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: remoteType === type ? c.primary : (c.isDark ? '#2D2D2D' : '#F3F4F6'),
                                                borderColor: remoteType === type ? c.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setRemoteType(type)}
                                    >
                                        <Text style={[styles.chipText, { color: remoteType === type ? '#fff' : c.text }]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Target Job Title</Text>
                            <TextInput
                                style={[styles.input, { color: c.text, backgroundColor: c.isDark ? '#2D2D2D' : '#F3F4F6', borderColor: 'transparent' }]}
                                value={jobTitle}
                                onChangeText={setJobTitle}
                                placeholder="e.g. Senior Product Designer"
                                placeholderTextColor={c.subtext}
                            />
                        </View>
                    </View>

                    {/* Categories Section */}
                    <View style={[styles.sectionCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
                                <MaterialIcons name="category" size={20} color="#8B5CF6" />
                            </View>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Categories</Text>
                        </View>

                        <Text style={[styles.label, { color: c.subtext, marginBottom: 12 }]}>Select up to 5 areas of interest</Text>
                        <View style={styles.tagsContainer}>
                            {CATEGORIES.map(cat => {
                                const isSelected = selectedCategories.includes(cat);
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.tagChip,
                                            {
                                                backgroundColor: isSelected ? c.primary : (c.isDark ? '#2D2D2D' : '#F3F4F6'),
                                                borderColor: isSelected ? c.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => toggleCategory(cat)}
                                    >
                                        <Text style={[styles.tagText, { color: isSelected ? '#fff' : c.text }]}>{cat}</Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginLeft: 4 }} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Financials Section */}
                    <View style={[styles.sectionCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
                                <MaterialIcons name="attach-money" size={20} color="#10B981" />
                            </View>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Financials & Location</Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Minimum Annual Salary (USD)</Text>
                            <View style={[styles.inputContainer, { backgroundColor: c.isDark ? '#2D2D2D' : '#F3F4F6' }]}>
                                <Text style={{ color: c.subtext, fontSize: 16, marginRight: 8 }}>$</Text>
                                <TextInput
                                    style={[styles.flexInput, { color: c.text }]}
                                    value={minSalary}
                                    onChangeText={setMinSalary}
                                    keyboardType="numeric"
                                    placeholder="80,000"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Preferred Location</Text>
                            <View style={[styles.inputContainer, { backgroundColor: c.isDark ? '#2D2D2D' : '#F3F4F6' }]}>
                                <Ionicons name="location-outline" size={18} color={c.subtext} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.flexInput, { color: c.text }]}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="City, Country or Remote"
                                    placeholderTextColor={c.subtext}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Experience Section */}
                    <View style={[styles.sectionCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F59E0B20' }]}>
                                <MaterialIcons name="stars" size={20} color="#F59E0B" />
                            </View>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Experience</Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Years of Experience</Text>
                            <View style={styles.optionsRow}>
                                {EXPERIENCE_LEVELS.map(exp => (
                                    <TouchableOpacity
                                        key={exp}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: experience === exp ? c.primary : (c.isDark ? '#2D2D2D' : '#F3F4F6'),
                                                borderColor: experience === exp ? c.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setExperience(exp)}
                                    >
                                        <Text style={[styles.chipText, { color: experience === exp ? '#fff' : c.text }]}>{exp}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>Engagement Types</Text>
                            <View style={styles.optionsRow}>
                                {ENGAGEMENT_TYPES.map(type => {
                                    const isSelected = selectedEngagements.includes(type);
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.optionChip,
                                                {
                                                    backgroundColor: isSelected ? c.primary : (c.isDark ? '#2D2D2D' : '#F3F4F6'),
                                                    borderColor: isSelected ? c.primary : 'transparent'
                                                }
                                            ]}
                                            onPress={() => toggleEngagement(type)}
                                        >
                                            <Text style={[styles.chipText, { color: isSelected ? '#fff' : c.text }]}>{type}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Notifications Section */}
                    <View style={[styles.sectionCard, { backgroundColor: c.card, shadowColor: c.shadows.medium.shadowColor, marginBottom: 120 }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#EF444420' }]}>
                                <MaterialIcons name="notifications-none" size={20} color="#EF4444" />
                            </View>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Notifications</Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: c.subtext }]}>How often should we alert you?</Text>
                            <View style={styles.optionsRow}>
                                {FREQUENCIES.map(freq => (
                                    <TouchableOpacity
                                        key={freq}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: frequency === freq ? c.primary : (c.isDark ? '#2D2D2D' : '#F3F4F6'),
                                                borderColor: frequency === freq ? c.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setFrequency(freq)}
                                    >
                                        <Text style={[styles.chipText, { color: frequency === freq ? '#fff' : c.text }]}>{freq}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: c.background }]}>
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={saving}
                    size="large"
                    style={{ borderRadius: 16, height: 56 }}
                />
            </SafeAreaView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 16,
    },
    sectionCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        opacity: 0.8,
    },
    input: {
        height: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
    },
    inputContainer: {
        height: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexInput: {
        flex: 1,
        height: 52,
        fontSize: 15,
        fontWeight: '500',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    }
});

export default JobPreferencesScreen;
