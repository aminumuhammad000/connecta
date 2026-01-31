import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { createCollaboProject } from '../services/collaboService';
import { post } from '../services/api';
import { useInAppAlert } from '../components/InAppAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { JOB_CATEGORIES, JOB_TYPES, LOCATION_SCOPES, LOCATION_TYPES, DURATION_TYPES } from '../utils/categories';

const COMMON_TIMEZONES = [
    { label: 'GMT', value: 'GMT (London/Accra)' },
    { label: 'EST', value: 'EST (New York/Toronto)' },
    { label: 'PST', value: 'PST (Los Angeles/Vancouver)' },
    { label: 'CET', value: 'CET (Berlin/Paris/Rome)' },
    { label: 'WAT', value: 'WAT (Lagos/Luanda)' },
    { label: 'IST', value: 'IST (India)' },
    { label: 'JST', value: 'JST (Tokyo/Seoul)' },
    { label: 'AEST', value: 'AEST (Sydney/Melbourne)' },
];

const STUDIO_PROMPTS: Record<string, { id: number; text: string; icon: string }[]> = {
    tech: [
        { id: 1, text: "Build a FinTech App with real-time tracking", icon: "account-balance-wallet" },
        { id: 2, text: "Create a modern E-commerce platform", icon: "shopping-cart" },
        { id: 3, text: "Design a SaaS dashboard for analytics", icon: "dashboard" },
        { id: 4, text: "Develop an AI-powered customer support bot", icon: "smart-toy" },
    ],
    design: [
        { id: 1, text: "Complete Brand Identity for a startup", icon: "brush" },
        { id: 2, text: "UI/UX Design for a food delivery app", icon: "layers" },
        { id: 3, text: "3D Product Animation for social media", icon: "view-in-ar" },
        { id: 4, text: "Professional Pitch Deck design", icon: "present-to-all" },
    ],
    writing: [
        { id: 1, text: "Series of SEO-optimized blog posts", icon: "article" },
        { id: 2, text: "Technical documentation for an API", icon: "code" },
        { id: 3, text: "High-converting sales copy for landing page", icon: "auto-fix-high" },
        { id: 4, text: "Ghostwriting a professional eBook", icon: "book" },
    ],
    marketing: [
        { id: 1, text: "Full Social Media Management for 3 months", icon: "campaign" },
        { id: 2, text: "Google Ads & Meta Ads campaign setup", icon: "ads-click" },
        { id: 3, text: "Comprehensive SEO Audit and Strategy", icon: "search" },
        { id: 4, text: "Influencer Marketing campaign for launch", icon: "people" },
    ],
    default: [
        { id: 1, text: "Build a custom project with a specialized team", icon: "groups" },
        { id: 2, text: "Scale my business operations with experts", icon: "trending-up" },
    ]
};

export default function PostCollaboJobScreen({ navigation }: any) {
    const { width } = Dimensions.get('window');
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [currentStep, setCurrentStep] = useState(0);
    const [title, setTitle] = useState('');
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useAI, setUseAI] = useState(true);

    const [scopingData, setScopingData] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // New Fields
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [projectType, setProjectType] = useState('one-time');
    const [scope, setScope] = useState('local');
    const [locationType, setLocationType] = useState('remote');
    const [durationValue, setDurationValue] = useState('');
    const [durationType, setDurationType] = useState('months');
    const [currency, setCurrency] = useState('NGN');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('Intermediate');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = (field: string) => {
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleScopeProject = async () => {
        setIsLoading(true);
        try {
            // If description is empty, use title and category as the base for AI analysis
            const finalDescription = description.trim() || `Project Title: ${title}. Category: ${JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.label}. Niche: ${subCategory}.`;

            // Call the backend scoping endpoint
            const response = await post('/api/collabo/scope', { description: finalDescription, useAI });
            setScopingData((response as any).data || response);
            setCurrentStep(3);
        } catch (error: any) {
            showAlert({ title: "Error", message: error.message || "Failed to analyze project.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!scopingData) {
            showAlert({ title: "Error", message: "Project plan not found. Please analyze again.", type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const cleanBudget = (val: any) => {
                if (!val) return 0;
                // Remove currency symbols, commas, and other non-numeric chars except decimal point
                const cleaned = String(val).replace(/[^0-9.]/g, '');
                return parseFloat(cleaned) || 0;
            };

            const projectData = {
                title: title.trim() || `${JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.label} Project - ${subCategory || 'General'}`,
                teamName: teamName.trim() || 'Collabo Team',
                description: description || `Project in ${subCategory}`,
                totalBudget: cleanBudget(scopingData.totalEstimatedBudget),
                roles: (scopingData.roles || []).map((role: any) => ({
                    ...role,
                    budget: cleanBudget(role.budget)
                })),
                milestones: scopingData.milestones || [],
                recommendedStack: scopingData.recommendedStack || [],
                risks: scopingData.risks || [],
                category: JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.label || 'General',
                niche: subCategory,
                projectType,
                scope,
                location,
                locationType,
                experience,
                duration: durationValue,
                durationType
            };

            const response = await createCollaboProject(projectData);
            const project = response.project || response;

            if (!project?._id) {
                throw new Error("Project created but ID not returned.");
            }

            // Navigate to Payment
            showAlert({
                title: "Success",
                message: "Project Created! Please fund the project to activate it.",
                type: 'success'
            });
            setTimeout(() => {
                navigation.navigate("Payment", {
                    projectId: project._id,
                    amount: projectData.totalBudget,
                    projectTitle: projectData.title
                });
            }, 1000);

        } catch (error: any) {
            console.error('Collabo Creation Error:', error);
            showAlert({
                title: "Error",
                message: error.message || "Failed to create project. Please check your data.",
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderDetails = () => (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepMainTitle, { color: c.text }]} adjustsFontSizeToFit numberOfLines={1}>Project Details</Text>
                <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Define the scope, location, and expertise required for your team.</Text>
            </View>

            {/* Location & Scope */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>LOCATION & SCOPE</Text>
                <View style={styles.compactToggleRow}>
                    {LOCATION_SCOPES.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            onPress={() => setScope(s.id)}
                            style={[
                                styles.compactToggleBtn,
                                { backgroundColor: scope === s.id ? c.primary : c.card }
                            ]}
                        >
                            <MaterialIcons
                                name={s.id === 'local' ? 'near-me' : 'language'}
                                size={16}
                                color={scope === s.id ? '#FFF' : c.subtext}
                            />
                            <Text
                                style={[styles.compactToggleText, { color: scope === s.id ? '#FFF' : c.text }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {s.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ marginTop: 16 }}>
                    <Text style={[styles.helperLabel, { color: c.subtext }]}>
                        {scope === 'local' ? "Where is this project based?" : "Preferred timezone or region"}
                    </Text>
                    <TextInput
                        value={location}
                        onChangeText={(t) => { setLocation(t); clearError('location'); }}
                        placeholder={scope === 'local' ? "e.g. Lagos, Nigeria" : "e.g. GMT+1 or Worldwide"}
                        placeholderTextColor={c.subtext}
                        style={[styles.refinedInput, { color: c.text, backgroundColor: c.card, borderColor: errors.location ? '#EF4444' : c.border }]}
                    />
                </View>

                {scope === 'international' && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={[styles.miniLabel, { color: c.subtext }]}>SUGGESTED REGIONS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
                            {COMMON_TIMEZONES.map(tz => (
                                <TouchableOpacity
                                    key={tz.label}
                                    onPress={() => {
                                        setLocation(tz.value);
                                        clearError('location');
                                    }}
                                    style={[
                                        styles.tzChip,
                                        {
                                            backgroundColor: location === tz.value ? c.primary : c.card,
                                            borderColor: location === tz.value ? c.primary : c.border,
                                        }
                                    ]}
                                >
                                    <Text style={[styles.tzText, { color: location === tz.value ? '#FFF' : c.text }]}>
                                        {tz.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            {/* Project Type */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>PROJECT TYPE</Text>
                <View style={styles.expertiseGrid}>
                    {[
                        { id: 'one-time', label: 'One-Time' },
                        { id: 'ongoing', label: 'Ongoing' },
                        { id: 'permanent', label: 'Permanent' },
                        { id: 'adhoc', label: 'Ad-hoc' }
                    ].map((type) => {
                        const isSelected = projectType === type.id;
                        const icon = type.id === 'one-time' ? 'assignment' : type.id === 'ongoing' ? 'event-repeat' : 'timer';
                        return (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setProjectType(type.id)}
                                style={[
                                    styles.expertiseCard,
                                    {
                                        backgroundColor: isSelected ? c.primary + '10' : c.card,
                                        borderColor: isSelected ? c.primary : c.border,
                                    }
                                ]}
                            >
                                <MaterialIcons name={icon as any} size={20} color={isSelected ? c.primary : c.subtext} />
                                <Text
                                    style={[styles.expertiseText, { color: isSelected ? c.text : c.subtext }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Location Type */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>WORK ENVIRONMENT</Text>
                <View style={styles.expertiseGrid}>
                    {LOCATION_TYPES.map((type) => {
                        const isSelected = locationType === type.id;
                        const icon = type.id === 'remote' ? 'cloud' : type.id === 'onsite' ? 'business' : 'hub';
                        return (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setLocationType(type.id)}
                                style={[
                                    styles.expertiseCard,
                                    {
                                        backgroundColor: isSelected ? c.primary + '10' : c.card,
                                        borderColor: isSelected ? c.primary : c.border,
                                    }
                                ]}
                            >
                                <MaterialIcons name={icon as any} size={20} color={isSelected ? c.primary : c.subtext} />
                                <Text
                                    style={[styles.expertiseText, { color: isSelected ? c.text : c.subtext }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Experience Level */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>TEAM EXPERTISE LEVEL</Text>
                <View style={styles.expertiseGrid}>
                    {['Entry', 'Intermediate', 'Expert'].map(lvl => {
                        const isSelected = experience === lvl;
                        const icon = lvl === 'Entry' ? 'eco' : lvl === 'Intermediate' ? 'trending-up' : 'workspace-premium';
                        return (
                            <TouchableOpacity
                                key={lvl}
                                onPress={() => setExperience(lvl)}
                                style={[
                                    styles.expertiseCard,
                                    {
                                        backgroundColor: isSelected ? c.primary + '10' : c.card,
                                        borderColor: isSelected ? c.primary : c.border,
                                    }
                                ]}
                            >
                                <MaterialIcons name={icon as any} size={20} color={isSelected ? c.primary : c.subtext} />
                                <Text
                                    style={[styles.expertiseText, { color: isSelected ? c.text : c.subtext }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {lvl}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Duration */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>ESTIMATED DURATION</Text>
                <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: errors.duration ? '#EF4444' : c.border, marginBottom: 12 }]}>
                    <MaterialIcons name="timer" size={18} color={c.subtext} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.refinedTextInput, { color: c.text }]}
                        placeholder="e.g. 3"
                        placeholderTextColor={c.subtext}
                        keyboardType="numeric"
                        value={durationValue}
                        onChangeText={(t) => { setDurationValue(t); clearError('duration'); }}
                    />
                </View>
                <View style={styles.categoryGrid}>
                    {DURATION_TYPES.map((dt) => {
                        const isSelected = durationType === dt.id;
                        return (
                            <TouchableOpacity
                                key={dt.id}
                                onPress={() => setDurationType(dt.id)}
                                style={[
                                    styles.compactToggleBtn,
                                    {
                                        backgroundColor: isSelected ? c.primary : c.card,
                                        borderColor: isSelected ? c.primary : c.border,
                                        borderWidth: 1,
                                        width: (width - 52) / 2, // Use same grid logic as categories
                                        flex: 0
                                    }
                                ]}
                            >
                                <Text
                                    style={[styles.compactToggleText, { color: isSelected ? '#FFF' : c.text }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {dt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            </View>

            <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
                <Button
                    title="Next Step"
                    onPress={() => {
                        const newErrors: Record<string, string> = {};
                        if (!location.trim()) newErrors.location = 'Location is required';
                        if (!durationValue.trim()) newErrors.duration = 'Duration is required';

                        if (Object.keys(newErrors).length > 0) {
                            setErrors(newErrors);
                            return;
                        }
                        setCurrentStep(2);
                    }}
                    style={styles.smallNextBtn}
                />
            </View>
        </ScrollView>
    );

    const renderBasics = () => (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepMainTitle, { color: c.text }]} adjustsFontSizeToFit numberOfLines={1}>Project Basics</Text>
                <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Give your project a name and choose its category.</Text>
            </View>

            {/* Project Title */}
            <View style={styles.refinedInputGroup}>
                <Text style={[styles.refinedLabel, { color: c.text }]}>PROJECT TITLE</Text>
                <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                    <MaterialIcons name="business-center" size={18} color={c.subtext} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.refinedTextInput, { color: c.text }]}
                        placeholder="e.g. Build a FinTech Mobile App"
                        placeholderTextColor={c.subtext}
                        value={title}
                        onChangeText={(t) => { setTitle(t); clearError('title'); }}
                    />
                </View>
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Category Selection */}
            <View style={styles.refinedInputGroup}>
                <View style={styles.labelRow}>
                    <Text style={[styles.refinedLabel, { color: c.text }]}>CATEGORY</Text>
                    <Text style={{ color: '#EF4444', fontSize: 12 }}>* Required</Text>
                </View>
                <View style={styles.categoryGrid}>
                    {JOB_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => {
                                    setSelectedCategoryId(cat.id);
                                    setSubCategory('');
                                }}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: c.card,
                                        borderColor: isSelected ? c.primary : c.border,
                                        borderWidth: isSelected ? 2 : 1,
                                    }
                                ]}
                            >
                                <View style={[styles.catIconCircle, { backgroundColor: isSelected ? c.primary + '15' : c.border + '30' }]}>
                                    <MaterialIcons name={cat.icon as any} size={22} color={isSelected ? c.primary : c.subtext} />
                                </View>
                                <View style={styles.catTextWrapper}>
                                    <Text style={[styles.catCardText, { color: isSelected ? c.text : c.subtext, fontWeight: isSelected ? '800' : '600' }]}>
                                        {cat.label}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <View style={[styles.selectionIndicator, { backgroundColor: c.primary }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Specialization */}
            {selectedCategoryId && JOB_CATEGORIES.find(cat => cat.id === selectedCategoryId)?.subcategories.length ? (
                <View style={styles.refinedInputGroup}>
                    <Text style={[styles.refinedLabel, { color: c.text }]}>SPECIALIZATION</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                        {JOB_CATEGORIES.find(cat => cat.id === selectedCategoryId)?.subcategories.map(sub => (
                            <TouchableOpacity
                                key={sub}
                                onPress={() => setSubCategory(sub)}
                                style={[
                                    styles.nicheChip,
                                    {
                                        backgroundColor: subCategory === sub ? c.primary : c.card,
                                        borderColor: subCategory === sub ? c.primary : c.border
                                    }
                                ]}
                            >
                                <Text style={[styles.nicheText, { color: subCategory === sub ? '#FFF' : c.text }]}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ) : null}

            <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
                <Button
                    title="Next Step"
                    onPress={() => {
                        const newErrors: Record<string, string> = {};
                        if (!title.trim()) newErrors.title = 'Project title is required';
                        if (!selectedCategoryId) newErrors.category = 'Please select a category';

                        if (Object.keys(newErrors).length > 0) {
                            setErrors(newErrors);
                            return;
                        }
                        setCurrentStep(1);
                    }}
                    style={styles.smallNextBtn}
                />
            </View>
        </ScrollView>
    );

    const renderChatStep = () => (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepMainTitle, { color: c.text }]} adjustsFontSizeToFit numberOfLines={1}>Collabo Studio</Text>
                <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Describe your vision. Our AI will architect the team, budget, and timeline.</Text>
            </View>

            {/* AI Toggle */}
            <TouchableOpacity
                onPress={() => setUseAI(!useAI)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: c.card,
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: useAI ? c.primary : c.border
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                        width: 40, height: 40,
                        borderRadius: 20,
                        backgroundColor: useAI ? c.primary + '15' : c.border + '30',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MaterialIcons name="auto-awesome" size={20} color={useAI ? c.primary : c.subtext} />
                    </View>
                    <View>
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>AI Architect</Text>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>{useAI ? "Enabled (Recommended)" : "Disabled (Manual Mode)"}</Text>
                    </View>
                </View>
                <View style={{
                    width: 48, height: 28,
                    borderRadius: 14,
                    backgroundColor: useAI ? c.primary : c.border,
                    padding: 2,
                    alignItems: useAI ? 'flex-end' : 'flex-start'
                }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF' }} />
                </View>
            </TouchableOpacity>

            {/* How it works guide */}
            {useAI && (
                <View style={[styles.guideBox, { backgroundColor: c.primary + '08', borderColor: c.primary + '20' }]}>
                    <View style={styles.guideItem}>
                        <View style={[styles.guideNumber, { backgroundColor: c.primary }]}>
                            <Text style={styles.guideNumberText}>1</Text>
                        </View>
                        <Text style={[styles.guideText, { color: c.text }]}>Describe your project in plain English.</Text>
                    </View>
                    <View style={styles.guideItem}>
                        <View style={[styles.guideNumber, { backgroundColor: c.primary }]}>
                            <Text style={styles.guideNumberText}>2</Text>
                        </View>
                        <Text style={[styles.guideText, { color: c.text }]}>AI analyzes and builds your team plan.</Text>
                    </View>
                </View>
            )}

            <View style={[styles.notionBox, { backgroundColor: c.card, borderColor: errors.description ? '#EF4444' : c.border }]}>
                <View style={styles.notionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name={useAI ? "auto-awesome" : "edit"} size={14} color={c.subtext} />
                        <Text style={[styles.notionLabel, { color: c.subtext }]}>{useAI ? "AI ARCHITECT (OPTIONAL)" : "PROJECT DESCRIPTION"}</Text>
                    </View>
                    {description.length > 0 && (
                        <TouchableOpacity onPress={() => setDescription('')}>
                            <MaterialIcons name="close" size={16} color={c.subtext} />
                        </TouchableOpacity>
                    )}
                </View>

                <TextInput
                    style={[styles.notionInput, { color: c.text }]}
                    placeholder={useAI ? "Type your project vision here (or leave blank)..." : "Describe your project requirements..."}
                    placeholderTextColor={c.subtext + '80'}
                    multiline
                    value={description}
                    onChangeText={(t) => { setDescription(t); clearError('description'); }}
                    textAlignVertical="top"
                />

                <View style={styles.notionFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.statusDotSmall, { backgroundColor: description.length > 0 ? c.primary : c.border }]} />
                        <Text style={[styles.notionHint, { color: c.subtext }]}>
                            {description.length === 0 ? "Using title & category" : (useAI ? "Ready to architect" : "Ready to proceed")}
                        </Text>
                    </View>
                    <Text style={[styles.notionCharCount, { color: c.subtext }]}>{description.length} characters</Text>
                </View>
            </View>

            {/* Quick Prompts */}
            {useAI && (
                <View style={{ marginTop: 24 }}>
                    <Text style={[styles.refinedLabel, { color: c.text, marginBottom: 12 }]}>QUICK INSPIRATION</Text>
                    <View style={{ gap: 8 }}>
                        {(STUDIO_PROMPTS[selectedCategoryId] || STUDIO_PROMPTS.default).map((prompt: any) => (
                            <TouchableOpacity
                                key={prompt.id}
                                onPress={() => {
                                    setDescription(prompt.text);
                                    clearError('description');
                                }}
                                style={[
                                    styles.promptChip,
                                    {
                                        backgroundColor: c.card,
                                        borderColor: c.border,
                                    }
                                ]}
                            >
                                <MaterialIcons name={prompt.icon as any} size={16} color={c.primary} />
                                <Text
                                    style={[styles.promptText, { color: c.text }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {prompt.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={{ alignItems: 'flex-end', marginTop: 32 }}>
                <TouchableOpacity
                    onPress={handleScopeProject}
                    disabled={isLoading}
                    style={[
                        styles.launchBtn,
                        { backgroundColor: c.primary, opacity: isLoading ? 0.7 : 1 }
                    ]}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Text style={styles.launchBtnText}>{useAI ? "Analyze & Architect" : "Continue to Review"}</Text>
                            <MaterialIcons name={useAI ? "rocket-launch" : "arrow-forward"} size={18} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderReviewStep = () => (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepMainTitle, { color: c.text }]} adjustsFontSizeToFit numberOfLines={1}>Review & Launch</Text>
                <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Finalize your project name and review the AI-generated plan.</Text>
            </View>

            {/* Editable Project Name */}
            <View style={[styles.reviewSection, { marginBottom: 24 }]}>
                <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 12 }]}>PROJECT IDENTITY</Text>

                <View style={{ gap: 16 }}>
                    <View>
                        <Text style={[styles.miniLabel, { color: c.subtext, marginBottom: 6 }]}>PROJECT NAME</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border, height: 50, borderRadius: 12 }]}>
                            <MaterialIcons name="edit" size={18} color={c.primary} style={{ marginRight: 12 }} />
                            <TextInput
                                style={[styles.refinedTextInput, { color: c.text, fontSize: 15, fontWeight: '600' }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Project Name"
                                placeholderTextColor={c.subtext}
                            />
                        </View>
                    </View>

                    <View>
                        <Text style={[styles.miniLabel, { color: c.subtext, marginBottom: 6 }]}>TEAM NAME</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border, height: 50, borderRadius: 12 }]}>
                            <MaterialIcons name="groups" size={18} color={c.primary} style={{ marginRight: 12 }} />
                            <TextInput
                                style={[styles.refinedTextInput, { color: c.text, fontSize: 15, fontWeight: '600' }]}
                                value={teamName}
                                onChangeText={setTeamName}
                                placeholder="e.g. The Avengers"
                                placeholderTextColor={c.subtext}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Premium Summary Card */}
            <LinearGradient
                colors={[c.primary, c.primary + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumSummaryCard}
            >
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <MaterialIcons name="payments" size={20} color="#FFF" style={{ opacity: 0.8 }} />
                        <Text style={styles.summaryLabel}>ESTIMATED BUDGET</Text>
                        <Text style={styles.summaryValue}>
                            {currency === 'NGN' ? '₦' : '$'}{scopingData?.totalEstimatedBudget?.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: '#FFF' }]} />
                    <View style={styles.summaryItem}>
                        <MaterialIcons name="event-available" size={20} color="#FFF" style={{ opacity: 0.8 }} />
                        <Text style={styles.summaryLabel}>TOTAL TIMELINE</Text>
                        <Text style={styles.summaryValue}>{scopingData?.timeline || '3-4 Months'}</Text>
                    </View>
                </View>

                {scopingData?.recommendedStack && (
                    <View style={styles.summaryStack}>
                        <Text style={styles.summaryStackLabel}>PRIMARY TECH STACK</Text>
                        <View style={styles.summaryStackRow}>
                            {scopingData.recommendedStack.slice(0, 4).map((tech: string, i: number) => (
                                <View key={i} style={styles.summaryStackChip}>
                                    <Text style={styles.summaryStackText}>{tech}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </LinearGradient>

            {/* Implementation Plan */}
            {scopingData?.milestones && (
                <View style={styles.reviewSection}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="map" size={18} color={c.primary} />
                        <Text style={[styles.sectionTitle, { color: c.text }]}>IMPLEMENTATION ROADMAP</Text>
                    </View>
                    <View style={[styles.roadmapContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                        {scopingData.milestones.map((milestone: any, i: number) => (
                            <View key={i} style={styles.roadmapItem}>
                                <View style={styles.roadmapIndicator}>
                                    <View style={[styles.roadmapDot, { backgroundColor: c.primary }]} />
                                    {i < scopingData.milestones.length - 1 && <View style={[styles.roadmapLine, { backgroundColor: c.border }]} />}
                                </View>
                                <View style={styles.roadmapContent}>
                                    <View style={styles.roadmapHeader}>
                                        <Text style={[styles.roadmapTitle, { color: c.text }]}>{milestone.title}</Text>
                                        <Text style={[styles.roadmapDuration, { color: c.primary }]}>{milestone.duration}</Text>
                                    </View>
                                    <Text style={[styles.roadmapDesc, { color: c.subtext }]}>{milestone.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Team Structure */}
            <View style={styles.reviewSection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="groups" size={18} color={c.primary} />
                    <Text style={[styles.sectionTitle, { color: c.text }]}>REQUIRED TEAM ({(scopingData?.roles || []).length})</Text>
                </View>

                {(scopingData?.roles || []).map((role: any, index: number) => (
                    <View key={index} style={[styles.roleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={styles.roleHeader}>
                            <View style={styles.roleIconBox}>
                                <MaterialIcons name="person" size={20} color={c.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.roleTitle, { color: c.text }]}>{role.title}</Text>
                                <Text style={[styles.roleBudget, { color: c.primary }]}>
                                    {currency === 'NGN' ? '₦' : '$'}{role.budget?.toLocaleString()}
                                </Text>
                            </View>
                            {role.count > 1 && (
                                <View style={[styles.roleCountBadge, { backgroundColor: c.primary + '15' }]}>
                                    <Text style={{ color: c.primary, fontSize: 10, fontWeight: '900' }}>x{role.count}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={[styles.roleDesc, { color: c.subtext }]} numberOfLines={2}>
                            {role.description}
                        </Text>

                        <View style={styles.roleSkillsRow}>
                            {role.skills.slice(0, 3).map((skill: string, i: number) => (
                                <View key={i} style={[styles.roleSkillChip, { backgroundColor: c.border + '30' }]}>
                                    <Text style={[styles.roleSkillText, { color: c.text }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ marginTop: 30 }}>
                <TouchableOpacity
                    onPress={handleCreateProject}
                    disabled={isLoading}
                    style={[styles.launchActionBtn, { backgroundColor: c.primary }]}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Text style={styles.launchActionText}>Launch Project</Text>
                            <MaterialIcons name="rocket-launch" size={20} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.manualInviteAction}
                    onPress={() => showAlert({ title: 'Manual Invite', message: 'You can add specific freelancers to roles after project creation.', type: 'info' })}
                >
                    <Text style={[styles.manualInviteActionText, { color: c.subtext }]}>Want to invite specific people? <Text style={{ color: c.primary }}>Invite Manually</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderStepIndicator = () => {
        const progress = ((currentStep + 1) / 4) * 100;
        return (
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: c.border + '40' }]}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: c.primary }]} />
                </View>
                <View style={styles.stepInfoRow}>
                    <Text style={[styles.stepCountText, { color: c.subtext }]}>STEP {currentStep + 1} OF 4</Text>
                    <Text style={[styles.stepNameText, { color: c.text }]}>
                        {currentStep === 0 ? 'Basics' : currentStep === 1 ? 'Details' : currentStep === 2 ? 'Studio' : 'Review'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: 'transparent' }]}>
                <TouchableOpacity onPress={() => {
                    if (currentStep > 0) setCurrentStep(currentStep - 1);
                    else navigation.goBack();
                }}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>
                    {currentStep === 1 ? 'Project Details' : currentStep === 2 ? 'Collabo Studio' : currentStep === 3 ? 'Review Plan' : 'New Project'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {renderStepIndicator()}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                {currentStep === 0 && renderBasics()}
                {currentStep === 1 && renderDetails()}
                {currentStep === 2 && renderChatStep()}
                {currentStep === 3 && renderReviewStep()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
    stepHeader: { marginBottom: 30 },
    stepMainTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -1, marginBottom: 6 },
    stepSubTitle: { fontSize: 13, lineHeight: 18, opacity: 0.7 },
    refinedInputGroup: { marginBottom: 24 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    refinedLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 12 },
    catIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catTextWrapper: {
        height: 36,
        justifyContent: 'center',
    },
    catCardText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (Dimensions.get('window').width - 52) / 2,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomLeftRadius: 30,
    },
    nicheChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
    nicheText: {
        fontSize: 13,
        fontWeight: '700',
    },
    smallNextBtn: {
        width: 140,
        height: 48,
        borderRadius: 24,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 4,
    },
    compactToggleRow: {
        flexDirection: 'row',
        gap: 10,
    },
    compactToggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        gap: 4,
        paddingHorizontal: 8,
    },
    compactToggleText: {
        fontSize: 12,
        fontWeight: '700',
    },
    expertiseGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    expertiseCard: {
        flex: 1,
        height: 75,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 6,
    },
    expertiseText: {
        fontSize: 11,
        fontWeight: '700',
    },
    refinedInput: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    helperLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    miniLabel: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
        opacity: 0.6,
    },
    tzChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    tzText: {
        fontSize: 11,
        fontWeight: '700',
    },
    durationChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
    durationChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        height: 52,
    },
    refinedTextInput: { flex: 1, fontSize: 15, fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: 8 },
    toggleBtn: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    toggleText: { fontSize: 13, fontWeight: '700' },
    notionBox: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        height: 320,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    notionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        opacity: 0.6,
    },
    notionLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    notionInput: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    notionFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notionHint: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.7,
    },
    notionCharCount: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.4,
    },
    statusDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    guideBox: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    guideItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    guideNumber: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideNumberText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },
    guideText: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.8,
    },
    promptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    promptChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    promptText: {
        fontSize: 12,
        fontWeight: '700',
    },
    launchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    launchBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    refinedPreviewCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        marginBottom: 20,
    },
    previewSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    previewSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionIndicatorDot: { width: 6, height: 6, borderRadius: 3 },
    editBtnSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(253,103,48,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    editLink: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    previewBudgetBox: { padding: 20, borderRadius: 20, backgroundColor: '#00000005' },
    previewBudgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    previewLabelSmall: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 },
    previewBudgetValue: { fontSize: 22, fontWeight: '900' },
    previewDateValue: { fontSize: 15, fontWeight: '700' },
    refinedSkillChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
    refinedSkillText: { fontSize: 11, fontWeight: '800' },
    milestoneItem: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    milestoneIndicator: { alignItems: 'center', width: 12 },
    milestoneDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
    milestoneLine: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
    milestoneContent: { flex: 1 },
    milestoneTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    milestoneDuration: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
    milestoneDesc: { fontSize: 13, lineHeight: 18 },
    roleTitle: { fontSize: 17, fontWeight: '800' },
    roleBudget: { fontSize: 17, fontWeight: '900' },
    roleDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
    previewSkillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    countBadge: {
        position: 'absolute',
        top: -10,
        right: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    premiumEscrowBanner: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    escrowIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    premiumEscrowTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    premiumEscrowText: { fontSize: 13, lineHeight: 18 },
    manualInviteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        marginTop: 12,
    },
    manualInviteText: { fontSize: 14, fontWeight: '700' },
    premiumSummaryCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        opacity: 0.2,
        marginHorizontal: 20,
    },
    summaryLabel: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        opacity: 0.7,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 2,
    },
    summaryStack: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    summaryStackLabel: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
        opacity: 0.6,
        letterSpacing: 1,
        marginBottom: 12,
    },
    summaryStackRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    summaryStackChip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    summaryStackText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    reviewSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingLeft: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    roadmapContainer: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
    },
    roadmapItem: {
        flexDirection: 'row',
        gap: 16,
    },
    roadmapIndicator: {
        alignItems: 'center',
        width: 12,
    },
    roadmapDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    roadmapLine: {
        width: 2,
        flex: 1,
        marginVertical: -2,
    },
    roadmapContent: {
        flex: 1,
        paddingBottom: 24,
    },
    roadmapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    roadmapTitle: {
        fontSize: 15,
        fontWeight: '800',
        flex: 1,
        marginRight: 10,
    },
    roadmapDuration: {
        fontSize: 11,
        fontWeight: '800',
    },
    roadmapDesc: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    roleCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        marginBottom: 16,
    },
    roleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    roleIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleCountBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    roleSkillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 16,
    },
    roleSkillChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    roleSkillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    launchActionBtn: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    launchActionText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '900',
    },
    manualInviteAction: {
        marginTop: 20,
        alignItems: 'center',
    },
    manualInviteActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    progressBarBackground: {
        height: 4,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    stepInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    stepCountText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    stepNameText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
