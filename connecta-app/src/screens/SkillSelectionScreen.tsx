import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import CustomAlert from '../components/CustomAlert';
import * as profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

// Predefined Categories & Skills
// In a real app, this could be fetched from an API
const CATEGORIES = [
    {
        id: 'tech',
        title: 'Technology & Development',
        skills: ['Software Engineer', 'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Data Scientist', 'QA Tester', 'Cyber Security', 'Blockchain Developer']
    },
    {
        id: 'design',
        title: 'Design & Creative',
        skills: ['Graphic Designer', 'UI/UX Designer', 'Logo Design', 'Video Editor', 'Animator', 'Illustrator', 'Product Designer', 'Photographer']
    },
    {
        id: 'marketing',
        title: 'Sales & Marketing',
        skills: ['Digital Marketer', 'SEO Specialist', 'Content Writer', 'Copywriter', 'Social Media Manager', 'Email Marketing', 'Lead Generation']
    },
    {
        id: 'business',
        title: 'Business & Consulting',
        skills: ['Project Manager', 'Business Analyst', 'Virtual Assistant', 'Accountant', 'Legal Consultant', 'HR Specialist', 'Financial Advisor']
    },
];

interface SkillSelectionScreenProps {
    route: any;
    navigation: any;
}

const SkillSelectionScreen: React.FC<SkillSelectionScreenProps> = ({ route, navigation }) => {
    const c = useThemeColors();
    const { token } = route.params || {};
    const { login } = useAuth(); // Assuming login method exists and accepts token
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
    const [customSkill, setCustomSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<any>({});

    const toggleSkill = (skill: string) => {
        const newSkills = new Set(selectedSkills);
        if (newSkills.has(skill)) {
            newSkills.delete(skill);
        } else {
            newSkills.add(skill);
        }
        setSelectedSkills(newSkills);
    };

    const addCustomSkill = () => {
        if (customSkill.trim()) {
            const newSkills = new Set(selectedSkills);
            newSkills.add(customSkill.trim());
            setSelectedSkills(newSkills);
            setCustomSkill('');
        }
    };

    const handleSaveSkills = async () => {
        if (selectedSkills.size === 0) {
            setAlertConfig({ title: 'No Skills Selected', message: 'Please select at least one skill to continue.', type: 'warning' });
            setAlertVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            // Convert Set to Array
            const skillsArray = Array.from(selectedSkills);

            // Call updated profile service
            // Login first to set the token for the API call
            if (token) {
                await login(token);
            }

            // Now update the profile
            await profileService.updateMyProfile({ skills: skillsArray });

            if (!token) {
                navigation.navigate('Login');
            }

        } catch (error: any) {
            setAlertConfig({ title: 'Error', message: error.message || 'Failed to save skills', type: 'error' });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <Text style={[styles.headerTitle, { color: c.text }]}>Select Your Skills</Text>
                <Text style={[styles.headerSubtitle, { color: c.subtext }]}>Tell us what you do. Select all that apply.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Categories */}
                <View style={styles.categories}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryCard,
                                {
                                    borderColor: selectedCategory === cat.id ? c.primary : c.border,
                                    backgroundColor: selectedCategory === cat.id ? c.primary + '10' : c.card
                                }
                            ]}
                            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        >
                            <Text style={[styles.categoryTitle, { color: c.text }]}>{cat.title}</Text>
                            <MaterialIcons
                                name={selectedCategory === cat.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={24}
                                color={c.subtext}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Skills Selection Area */}
                {selectedCategory && (
                    <View style={styles.skillsContainer}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Select Skills</Text>
                        <View style={styles.skillsGrid}>
                            {CATEGORIES.find(c => c.id === selectedCategory)?.skills.map(skill => (
                                <TouchableOpacity
                                    key={skill}
                                    style={[
                                        styles.skillChip,
                                        {
                                            backgroundColor: selectedSkills.has(skill) ? c.primary : c.card,
                                            borderColor: selectedSkills.has(skill) ? c.primary : c.border
                                        }
                                    ]}
                                    onPress={() => toggleSkill(skill)}
                                >
                                    <Text style={{
                                        color: selectedSkills.has(skill) ? '#fff' : c.text,
                                        fontSize: 13,
                                        fontWeight: '500'
                                    }}>
                                        {skill}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Custom Skill Input */}
                <View style={styles.customSection}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Add Custom Skill</Text>
                    <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.card }]}>
                        <TextInput
                            value={customSkill}
                            onChangeText={setCustomSkill}
                            placeholder="e.g. Rust Programming"
                            placeholderTextColor={c.subtext}
                            style={[styles.input, { color: c.text }]}
                        />
                        <TouchableOpacity onPress={addCustomSkill} style={styles.addBtn}>
                            <MaterialIcons name="add" size={24} color={c.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Selected Skills Preview */}
                {selectedSkills.size > 0 && (
                    <View style={styles.previewSection}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Selected ({selectedSkills.size})</Text>
                        <View style={styles.skillsGrid}>
                            {Array.from(selectedSkills).map(skill => (
                                <View key={skill} style={[styles.selectedChip, { backgroundColor: c.primary + '20', borderColor: c.primary }]}>
                                    <Text style={{ color: c.primary, fontSize: 13, fontWeight: '600' }}>{skill}</Text>
                                    <TouchableOpacity onPress={() => toggleSkill(skill)}>
                                        <MaterialIcons name="close" size={16} color={c.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.card }]}>
                <Button
                    title={isLoading ? "Saving..." : "Continue to Dashboard"}
                    onPress={handleSaveSkills}
                    variant="primary"
                    disabled={isLoading}
                />
            </View>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertConfig.onOk) alertConfig.onOk();
                }}
            />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        padding: 20,
        gap: 24,
    },
    categories: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    skillsContainer: {
        marginTop: 8,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    customSection: {

    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
    },
    addBtn: {
        padding: 8,
    },
    previewSection: {
        marginBottom: 40,
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
});

export default SkillSelectionScreen;
