import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Animated as NativeAnimated, Easing, Keyboard, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import * as profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { saveToken } from '../utils/storage';
import { Profile } from '../types';
import { useTranslation } from '../utils/i18n';
import ChatGreeting from '../components/ChatGreeting';

const { width } = Dimensions.get('window');


// --- Types ---
interface OnboardingData {
    entityType: 'individual' | 'team' | null;
    remoteWorkType: 'remote_only' | 'hybrid' | 'onsite' | null;
    workLocation: string;
    category: string;
    jobTitles: string[];
    yearsOfExperience: string;
    whatsappNumber: string;
    // Keeping these for compatibility/completeness if backend expects them
    minimumSalary: string;
    engagementTypes: string[];
    jobNotificationFrequency: 'daily' | 'weekly' | 'relevant_only' | null;
}

interface StepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onPrev: () => void;
    userType?: 'client' | 'freelancer';
}

// --- Data Constants ---
const JOB_DATA: Record<string, string[]> = {
    'IT & Tech': [
        'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Data Scientist', 'UX/UI Designer',
        'QA Engineer', 'Blockchain Developer', 'System Administrator', 'Cybersecurity Analyst', 'Cloud Architect',
        'AI/ML Engineer', 'Game Developer', 'Product Manager', 'Tech Support Specialist', 'Database Administrator',
        'Network Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer'
    ],
    'Creative & Design': [
        'Graphic Designer', 'Illustrator', 'Motion Graphics Artist', 'Video Editor', '3D Modeler',
        'Photographer', 'Art Director', 'Fashion Designer', 'Interior Designer', 'Industrial Designer',
        'UX Researcher', 'Copywriter', 'Creative Director', 'Animator', 'Voice Over Artist'
    ],
    'Business & Finance': [
        'Accountant', 'Financial Analyst', 'Bookkeeper', 'Tax Consultant', 'Business Consultant',
        'Project Manager', 'Product Owner', 'Executive Assistant', 'Data Analyst', 'Market Researcher',
        'Investment Banker', 'Risk Manager', 'Compliance Officer', 'Auditor'
    ],
    'Marketing & Sales': [
        'Digital Marketer', 'SEO Specialist', 'Social Media Manager', 'Content Specialist', 'Email Marketer',
        'Affiliate Marketer', 'Sales Representative', 'Lead Generation Specialist', 'Public Relations Specialist',
        'Brand Ambassador', 'CRM Manager', 'Advertising Specialist'
    ],
    'Writing & Translation': [
        'Content Writer', 'Copywriter', 'Technical Writer', 'Editor', 'Proofreader', 'Translator',
        'Ghostwriter', 'Blogger', 'Screenwriter', 'Grant Writer', 'Resume Writer', 'Journalist'
    ],
    'Admin & Support': [
        'Virtual Assistant', 'Data Entry Specialist', 'Customer Service Rep', 'Technical Support', 'Office Manager',
        'Transcriptionist', 'Receptionist', 'Travel Planner', 'Research Assistant', 'Email Support'
    ],
    'Legal': [
        'Legal Consultant', 'Contract Lawyer', 'Paralegal', 'Intellectual Property Lawyer', 'Corporate Lawyer',
        'Family Lawyer', 'Legal Writer', 'Compliance Specialist'
    ],
    'Engineering': [
        'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Architect', 'CAD Drafter',
        'Structural Engineer', 'Chemical Engineer', 'Biomedical Engineer', 'Automotive Engineer'
    ],
    'Health & Medical': [
        'Nurse', 'Medical Assistant', 'Pharmacy Technician', 'Nutritionist', 'Health Coach',
        'Medical Writer', 'Medical Biller', 'Caregiver', 'Physiotherapist', 'Lab Technician'
    ],
    'Agriculture & Farming': [
        'Farm Manager', 'Agronomist', 'Livestock Manager', 'Agricultural Engineer', 'Horticulturist',
        'Fishery Manager', 'Poultry Farmer', 'Veterinary Technician', 'Food Scientist', 'Irrigation Specialist'
    ],
    'Education & Training': [
        'Tutor', 'Language Teacher', 'Course Creator', 'Instructional Designer', 'Corporate Trainer',
        'Academic Writer', 'Exam Prep Coach', 'Music Teacher', 'Art Teacher', 'STEM Educator'
    ],
    'Trades & Services': [
        'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mechanic', 'Painter',
        'HVAC Technician', 'Solar Installer', 'Landscaper', 'Construction Worker'
    ],
    'Logistics & Transportation': [
        'Driver', 'Delivery Rider', 'Logistics Coordinator', 'Supply Chain Manager', 'Dispatcher',
        'Fleet Manager', 'Warehouse Manager', 'Import/Export Specialist'
    ],
    'Hospitality & Tourism': [
        'Chef', 'Event Planner', 'Travel Agent', 'Hotel Manager', 'Tour Guide',
        'Caterer', 'Bartender', 'Restaurant Manager', 'Concierge'
    ],
    'Real Estate & Construction': [
        'Real Estate Agent', 'Property Manager', 'Architect', 'Interior Designer', 'Surveyor',
        'Urban Planner', 'Site Supervisor', 'Valuer'
    ],
    'Beauty & Wellness': [
        'Makeup Artist', 'Hair Stylist', 'Personal Trainer', 'Yoga Instructor', 'Massage Therapist',
        'Esthetician', 'Nail Technician', 'Spa Manager'
    ]
};

const CATEGORIES = Object.keys(JOB_DATA);

const MOCK_LOCATIONS = [
    'New York, USA', 'San Francisco, USA', 'London, UK', 'Berlin, Germany', 'Lagos, Nigeria',
    'Nairobi, Kenya', 'Bangalore, India', 'Singapore', 'Toronto, Canada', 'Sydney, Australia',
    'Dubai, UAE', 'Paris, France', 'Amsterdam, Netherlands', 'Austin, USA', 'Remote (Worldwide)',
    'Johannesburg, South Africa', 'Accra, Ghana', 'Kigali, Rwanda', 'Mumbai, India', 'Tokyo, Japan'
];

// --- Wizard Steps ---

// 0. Entity Selection (Individual vs Team)
const EntitySelectionStep: React.FC<StepProps> = ({ data, updateData, userType }) => {
    const c = useThemeColors();
    const { t } = useTranslation();

    const isClient = userType === 'client';

    const options = [
        {
            id: 'individual',
            label: t('individual' as any),
            icon: 'person',
            desc: isClient ? t('individual_desc_client' as any) : t('individual_desc_freelancer' as any)
        },
        {
            id: 'team',
            label: t('team' as any),
            icon: 'groups',
            desc: isClient ? t('team_desc_client' as any) : t('team_desc_freelancer' as any)
        },
    ];

    return (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 24 }}>
                <ChatGreeting
                    messages={[
                        { text: t('entity_title' as any) },
                        { text: t('entity_sub' as any), delay: 800 }
                    ]}
                />
            </View>
            <View style={styles.optionsContainer}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        style={[
                            styles.optionCard,
                            {
                                backgroundColor: data.entityType === opt.id ? c.primary + '15' : c.card,
                                borderColor: data.entityType === opt.id ? c.primary : c.border
                            }
                        ]}
                        onPress={() => updateData('entityType', opt.id)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: data.entityType === opt.id ? c.primary : c.border + '40' }]}>
                            <MaterialIcons name={opt.icon as any} size={24} color={data.entityType === opt.id ? '#fff' : c.subtext} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.optionLabel, { color: c.text }]}>{opt.label}</Text>
                            <Text style={[styles.optionDesc, { color: c.subtext }]}>{opt.desc}</Text>
                        </View>
                        {data.entityType === opt.id && <MaterialIcons name="check-circle" size={24} color={c.primary} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// 1. Remote Work Type
const RemoteWorkStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const { t } = useTranslation();

    const options = [
        { id: 'remote_only', label: t('remote_only' as any), icon: 'laptop-mac', desc: t('remote_desc' as any) },
        { id: 'hybrid', label: t('hybrid' as any), icon: 'sync-alt', desc: t('hybrid_desc' as any) },
        { id: 'onsite', label: t('onsite' as any), icon: 'location-city', desc: t('onsite_desc' as any) },
    ];

    return (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 24 }}>
                <ChatGreeting
                    messages={[
                        { text: t('work_type_title' as any) },
                        { text: t('work_type_sub' as any), delay: 800 }
                    ]}
                />
            </View>
            <View style={styles.optionsContainer}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        style={[
                            styles.optionCard,
                            {
                                backgroundColor: data.remoteWorkType === opt.id ? c.primary + '15' : c.card,
                                borderColor: data.remoteWorkType === opt.id ? c.primary : c.border
                            }
                        ]}
                        onPress={() => updateData('remoteWorkType', opt.id)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: data.remoteWorkType === opt.id ? c.primary : c.border + '40' }]}>
                            <MaterialIcons name={opt.icon as any} size={24} color={data.remoteWorkType === opt.id ? '#fff' : c.subtext} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.optionLabel, { color: c.text }]}>{opt.label}</Text>
                            <Text style={[styles.optionDesc, { color: c.subtext }]}>{opt.desc}</Text>
                        </View>
                        {data.remoteWorkType === opt.id && <MaterialIcons name="check-circle" size={24} color={c.primary} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// 2. Location (Intelligent Autocomplete)
const LocationStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const [query, setQuery] = useState(data.workLocation || '');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Determine question based on previous selection
    const questionText = data.remoteWorkType === 'remote_only'
        ? "Where do you want to work remotely from?"
        : "Where are you located?";

    const handleSearch = (text: string) => {
        setQuery(text);
        updateData('workLocation', text); // Update anyway in case they type a custom one

        if (text.length > 1) {
            const filtered = MOCK_LOCATIONS.filter(loc => loc.toLowerCase().includes(text.toLowerCase()));
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (loc: string) => {
        setQuery(loc);
        updateData('workLocation', loc);
        setSuggestions([]);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>{questionText}</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>Start typing to find your location...</Text>

            <View style={{ zIndex: 10 }}>
                <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                    <MaterialIcons name="search" size={24} color={c.subtext} />
                    <TextInput
                        style={[styles.input, { color: c.text }]}
                        value={query}
                        onChangeText={handleSearch}
                        placeholder="e.g. London, United Kingdom"
                        placeholderTextColor={c.subtext}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <MaterialIcons name="close" size={20} color={c.subtext} />
                        </TouchableOpacity>
                    )}
                </View>

                {suggestions.length > 0 && (
                    <View style={[styles.suggestionsList, { backgroundColor: c.card, borderColor: c.border }]}>
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, { borderBottomColor: c.border }]}
                                onPress={() => handleSelect(item)}
                            >
                                <MaterialIcons name="location-on" size={18} color={c.subtext} style={{ marginRight: 8 }} />
                                <Text style={{ color: c.text, fontSize: 16 }}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Simulated Map Visual */}
            <View style={[styles.mapPlaceholder, { backgroundColor: c.card, borderColor: c.border }]}>
                <MaterialIcons name="map" size={48} color={c.border} />
                <Text style={{ color: c.subtext, marginTop: 8 }}>Map location preview</Text>
            </View>
        </View>
    );
};

// 3. Category Selection
const CategoryStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const { t } = useTranslation();

    return (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 24 }}>
                <ChatGreeting
                    messages={[
                        { text: t('industry_title' as any) },
                    ]}
                />
            </View>
            <ScrollView style={{ marginTop: 12, flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={styles.gridContainer}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryCard,
                                {
                                    backgroundColor: data.category === cat ? c.primary : c.card,
                                    borderColor: data.category === cat ? c.primary : c.border
                                }
                            ]}
                            onPress={() => {
                                updateData('category', cat);
                                // Clear job titles if category changes
                                updateData('jobTitles', []);
                            }}
                        >
                            <Text style={[styles.categoryText, { color: data.category === cat ? '#fff' : c.text }]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[
                            styles.categoryCard,
                            {
                                backgroundColor: data.category === 'Other' ? c.primary : c.card,
                                borderColor: data.category === 'Other' ? c.primary : c.border
                            }
                        ]}
                        onPress={() => updateData('category', 'Other')}
                    >
                        <Text style={[styles.categoryText, { color: data.category === 'Other' ? '#fff' : c.text }]}>Other</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

// 4. Job Titles (Dynamic based on Category)
const JobTitlesStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const [otherInput, setOtherInput] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);

    const titles = data.category && JOB_DATA[data.category] ? JOB_DATA[data.category] : [];

    const toggleTitle = (title: string) => {
        if (data.jobTitles.includes(title)) {
            updateData('jobTitles', data.jobTitles.filter(t => t !== title));
        } else {
            if (data.jobTitles.length < 5) {
                updateData('jobTitles', [...data.jobTitles, title]);
            }
        }
    };

    const addOtherTitle = () => {
        if (otherInput.trim()) {
            toggleTitle(otherInput.trim());
            setOtherInput('');
            setShowOtherInput(false);
        }
    };

    const { t, lang } = useTranslation();

    const titleText = lang === 'en'
        ? `${t('roles_title' as any)} in ${data.category}`
        : t('roles_title' as any); // Hausa translation is generic "Choose specific jobs you do" which fits nicely without category name needed immediately or appended awkwardly

    return (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 24 }}>
                <ChatGreeting
                    messages={[
                        { text: titleText },
                        { text: t('roles_sub' as any), delay: 800 }
                    ]}
                />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={styles.chipsContainer}>
                    {titles.map(title => {
                        const isSelected = data.jobTitles.includes(title);
                        return (
                            <TouchableOpacity
                                key={title}
                                style={[
                                    styles.selectableChip,
                                    {
                                        backgroundColor: isSelected ? c.primary : c.card,
                                        borderColor: isSelected ? c.primary : c.border
                                    }
                                ]}
                                onPress={() => toggleTitle(title)}
                            >
                                <Text style={{ color: isSelected ? '#fff' : c.text }}>{title}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Add Custom Title */}
                    <TouchableOpacity
                        style={[styles.selectableChip, { backgroundColor: c.card, borderColor: c.border, borderStyle: 'dashed' }]}
                        onPress={() => setShowOtherInput(true)}
                    >
                        <MaterialIcons name="add" size={16} color={c.primary} />
                        <Text style={{ color: c.primary, marginLeft: 4 }}>Add Other</Text>
                    </TouchableOpacity>
                </View>

                {showOtherInput && (
                    <View style={[styles.inputWrapper, { marginTop: 16, backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            style={[styles.input, { color: c.text }]}
                            value={otherInput}
                            onChangeText={setOtherInput}
                            placeholder="Type job title..."
                            placeholderTextColor={c.subtext}
                            autoFocus
                            onSubmitEditing={addOtherTitle}
                        />
                        <TouchableOpacity onPress={addOtherTitle} style={styles.addBtn}>
                            <MaterialIcons name="check" size={20} color={c.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// 5. WhatsApp Number
const WhatsAppStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const { t } = useTranslation();

    return (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 24 }}>
                <ChatGreeting
                    messages={[
                        { text: t('whatsapp_title' as any) },
                        { text: t('whatsapp_sub' as any), delay: 800 }
                    ]}
                />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" style={{ marginRight: 12 }} />
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    value={data.whatsappNumber}
                    onChangeText={(val) => updateData('whatsappNumber', val)}
                    placeholder="+123 456 7890"
                    placeholderTextColor={c.subtext}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons name="lock-outline" size={18} color={c.subtext} />
                <Text style={{ color: c.subtext, fontSize: 13, flex: 1 }}>Your number is secure and only used for important notifications.</Text>
            </View>
        </View>
    );
};

// --- Main Component ---
const SkillSelectionScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const c = useThemeColors();
    const { token, user } = route.params || {};
    const { loginWithToken } = useAuth();
    const { t } = useTranslation();

    const [step, setStep] = useState(0);
    const [isMatching, setIsMatching] = useState(false);
    const [isProfileSaved, setIsProfileSaved] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new NativeAnimated.Value(1)).current;
    const slideAnim = useRef(new NativeAnimated.Value(0)).current;

    const [data, setData] = useState<OnboardingData>({
        entityType: null,
        remoteWorkType: 'remote_only', // Default to avoid null issues in Step 0
        workLocation: '',
        category: '',
        jobTitles: [],
        yearsOfExperience: '',
        whatsappNumber: '',
        minimumSalary: '',
        engagementTypes: [],
        jobNotificationFrequency: null,
    });

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
        NativeAnimated.parallel([
            NativeAnimated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }),
            NativeAnimated.timing(slideAnim, {
                toValue: direction === 'next' ? -50 : 50,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback();
            slideAnim.setValue(direction === 'next' ? 50 : -50);
            NativeAnimated.parallel([
                NativeAnimated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true
                }),
                NativeAnimated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic)
                }),
            ]).start();
        });
    };

    const nextStep = () => {
        // Validation logic
        if (step === 0 && !data.entityType) return;
        if (step === 1 && !data.remoteWorkType) return;
        if (step === 2 && !data.category) return;
        if (step === 3 && data.jobTitles.length === 0) return;

        if (step < 4) {
            animateTransition('next', () => setStep(prev => prev + 1));
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            animateTransition('prev', () => setStep(prev => prev - 1));
        }
    };

    const handleSubmit = async () => {
        setIsMatching(true);

        try {
            if (token) await saveToken(token);

            // Construct profile update
            const profileUpdate: Partial<Profile> = {
                entityType: data.entityType as any,
                remoteWorkType: data.remoteWorkType as any,
                // workLocationPreferences: [data.workLocation], // Removing explicit location set here as it's skipped
                jobTitle: data.jobTitles.join(', '), // Store primary or join
                skills: data.jobTitles, // Use titles as skills for matching
                jobCategories: [data.category],
                // Store WhatsApp in a suitable field, e.g., phone or metadata if backend supports
                phone: data.whatsappNumber,
                // Defaulting or inferring others
                minimumSalary: parseInt(data.minimumSalary) || 0,
                yearsOfExperience: 0, // Simplified flow didn't ask explicitly, could add back if needed
            };

            await profileService.updateMyProfile(profileUpdate);
            setIsProfileSaved(true);

        } catch (error) {
            console.error("Profile update error:", error);
            // Allow to proceed even if error to avoid stuck state, 
            // but ideally we should show an error message.
            setIsProfileSaved(true);
        }
    };

    // Called by MatchingScreen when animation finishes
    const handleMatchingFinished = async () => {
        if (token && user) {
            try {
                await loginWithToken(token, user);
            } catch (e) {
                console.error("Login after matching failed", e);
                navigation.navigate('Login');
            }
        } else if (!token) {
            navigation.goBack();
        }
    };

    const Steps = [
        EntitySelectionStep,
        RemoteWorkStep,
        CategoryStep,
        JobTitlesStep,
        WhatsAppStep
    ];

    const CurrentStepComponent = Steps[step];

    if (isMatching) {
        return <MatchingScreen onFinish={handleMatchingFinished} navigation={navigation} isProfileSaved={isProfileSaved} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header / Progress */}
            <View style={styles.header}>
                <TouchableOpacity onPress={prevStep} disabled={step === 0} style={{ opacity: step === 0 ? 0 : 1, padding: 8 }}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${((step + 1) / Steps.length) * 100}%`, backgroundColor: c.primary }]} />
                </View>
                <TouchableOpacity onPress={handleSubmit} style={{ padding: 4 }}>
                    <Text style={{ color: c.subtext, fontSize: 14, fontWeight: '600' }}>{t('skip')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <NativeAnimated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
                    <CurrentStepComponent
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                        onPrev={prevStep}
                        userType={user?.userType}
                    />
                </NativeAnimated.View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border }]}>
                <Button
                    title={step === Steps.length - 1 ? "Start Matching" : "Continue"}
                    onPress={nextStep}
                    variant="primary"
                    disabled={
                        (step === 0 && !data.entityType) ||
                        (step === 1 && !data.remoteWorkType) ||
                        (step === 2 && !data.category) ||
                        (step === 3 && data.jobTitles.length === 0)
                    }
                />
            </View>
        </SafeAreaView>
    );
};

// Balloon Component for celebration
const Balloon: React.FC<{ color: string; delay: number; startX: number }> = ({ color, delay, startX }) => {
    const translateY = useRef(new NativeAnimated.Value(0)).current;
    const translateX = useRef(new NativeAnimated.Value(0)).current;

    useEffect(() => {
        // Delay start
        setTimeout(() => {
            // Float up animation
            NativeAnimated.parallel([
                NativeAnimated.timing(translateY, {
                    toValue: -600,
                    duration: 6000 + Math.random() * 2000,
                    useNativeDriver: true,
                }),
                // Sway animation
                NativeAnimated.loop(
                    NativeAnimated.sequence([
                        NativeAnimated.timing(translateX, {
                            toValue: 20,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                        NativeAnimated.timing(translateX, {
                            toValue: -20,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ])
                ),
            ]).start();
        }, delay);
    }, []);

    return (
        <NativeAnimated.View
            style={{
                position: 'absolute',
                bottom: -100,
                left: startX,
                transform: [{ translateY }, { translateX }],
            }}
        >
            <View style={{ alignItems: 'center' }}>
                <View
                    style={{
                        width: 50,
                        height: 60,
                        backgroundColor: color,
                        borderRadius: 25,
                        opacity: 0.9,
                    }}
                />
                <View
                    style={{
                        width: 2,
                        height: 40,
                        backgroundColor: color + '80',
                        marginTop: -5,
                    }}
                />
            </View>
        </NativeAnimated.View>
    );
};

const MatchingScreen = ({ onFinish, navigation, isProfileSaved }: { onFinish: () => void, navigation: any, isProfileSaved: boolean }) => {
    const c = useThemeColors();
    const { t } = useTranslation();
    const progress = useRef(new NativeAnimated.Value(0)).current;
    const iconPulse = useRef(new NativeAnimated.Value(1)).current;
    const rewardScale = useRef(new NativeAnimated.Value(0)).current;
    const [statusText, setStatusText] = useState(t('analyzing_profile' as any));
    const [matchCount, setMatchCount] = useState(0);
    const [sparksEarned, setSparksEarned] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);
    const [showRewards, setShowRewards] = useState(false);

    const stages = [
        t('analyzing_profile' as any),
        t('gathering_jobs' as any),
        t('personalizing_dashboard' as any),
        t('found_opportunities' as any)
    ];

    useEffect(() => {
        // Pulsing animation for icon
        const pulseAnimation = NativeAnimated.loop(
            NativeAnimated.sequence([
                NativeAnimated.timing(iconPulse, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                NativeAnimated.timing(iconPulse, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        if (!isComplete) {
            pulseAnimation.start();
        }

        return () => pulseAnimation.stop();
    }, [isComplete]);

    useEffect(() => {
        if (!isProfileSaved) {
            // Stage progression
            const stageIntervals = [0, 1500, 3000, 4500];
            const timers = stageIntervals.map((delay, index) =>
                setTimeout(() => {
                    setCurrentStage(index);
                    setStatusText(stages[index]);

                    // Animate progress bar
                    NativeAnimated.timing(progress, {
                        toValue: (index + 1) / stages.length,
                        duration: 800,
                        useNativeDriver: false,
                    }).start();

                    // Increment job count gradually
                    if (index > 0) {
                        const targetCount = index === 1 ? 50 : index === 2 ? 120 : 152;
                        let currentCount = matchCount;
                        const increment = setInterval(() => {
                            currentCount += Math.floor(Math.random() * 8) + 3;
                            if (currentCount >= targetCount) {
                                currentCount = targetCount;
                                clearInterval(increment);
                            }
                            setMatchCount(currentCount);
                        }, 50);
                    }

                    // Show rewards at the final stage
                    if (index === 3) {
                        setTimeout(() => {
                            setShowRewards(true);
                            // Animate sparks counter
                            let currentSparks = 0;
                            const targetSparks = 50; // Reward for completing onboarding
                            const sparksInterval = setInterval(() => {
                                currentSparks += 2;
                                if (currentSparks >= targetSparks) {
                                    currentSparks = targetSparks;
                                    clearInterval(sparksInterval);
                                }
                                setSparksEarned(currentSparks);
                            }, 30);

                            // Animate reward badge entrance
                            NativeAnimated.spring(rewardScale, {
                                toValue: 1,
                                friction: 6,
                                tension: 40,
                                useNativeDriver: true,
                            }).start();
                        }, 500);
                    }
                }, delay)
            );

            return () => timers.forEach(timer => clearTimeout(timer));
        } else {
            setIsComplete(true);
            setStatusText(t('found_opportunities' as any));
            setMatchCount(152);
            setSparksEarned(50);
            setShowRewards(true);
            NativeAnimated.timing(progress, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
            }).start();
            NativeAnimated.spring(rewardScale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [isProfileSaved]);

    const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    const balloonColors = [c.primary, '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
            {/* Celebratory Balloons */}
            {showRewards && balloonColors.map((color, index) => (
                <Balloon
                    key={index}
                    color={color}
                    delay={index * 200}
                    startX={30 + (index * 50)}
                />
            ))}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
                <NativeAnimated.View style={{ transform: [{ scale: isComplete ? 1 : iconPulse }] }}>
                    <MaterialIcons
                        name={isComplete ? "check-circle" : "auto-awesome"}
                        size={72}
                        color={isComplete ? '#10B981' : c.primary}
                    />
                </NativeAnimated.View>
            </View>

            {isComplete && (
                <Text style={{ fontSize: 28, fontWeight: '900', color: c.primary, marginBottom: 8, textAlign: 'center' }}>
                    {t('congratulations' as any)}
                </Text>
            )}

            <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, marginBottom: 12, textAlign: 'center' }}>
                {statusText}
            </Text>

            {matchCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: c.card, borderRadius: 20, marginBottom: 16, borderWidth: 2, borderColor: c.primary + '20' }}>
                    <MaterialIcons name="work" size={22} color={c.primary} />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>
                        {matchCount}+ {t('jobs_found' as any)}
                    </Text>
                </View>
            )}

            {showRewards && (
                <NativeAnimated.View style={{
                    transform: [{ scale: rewardScale }],
                    marginBottom: 24,
                    width: '100%'
                }}>
                    <View style={{
                        backgroundColor: c.primary + '15',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 2,
                        borderColor: c.primary + '30',
                        alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 }}>
                            {t('rewards_earned' as any)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <MaterialIcons name="bolt" size={28} color="#FFD700" />
                            <Text style={{ fontSize: 32, fontWeight: '900', color: c.primary }}>
                                {sparksEarned}
                            </Text>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
                                {t('sparks_earned' as any)}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8, marginBottom: 12 }}>
                            <MaterialIcons name="info-outline" size={18} color={c.subtext} style={{ marginTop: 2 }} />
                            <Text style={{ fontSize: 13, color: c.subtext, flex: 1, lineHeight: 18 }}>
                                {t('rewards_help' as any)}
                            </Text>
                        </View>
                        <View style={{
                            backgroundColor: c.background,
                            borderRadius: 12,
                            padding: 14,
                            width: '100%',
                            borderWidth: 1,
                            borderColor: c.border
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                <MaterialIcons name="tips-and-updates" size={20} color={c.primary} style={{ marginTop: 1 }} />
                                <Text style={{ fontSize: 13, color: c.text, flex: 1, lineHeight: 18, fontWeight: '500' }}>
                                    {t('engagement_tip' as any)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </NativeAnimated.View>
            )}

            <View style={{ width: '100%', height: 10, backgroundColor: c.border, borderRadius: 5, overflow: 'hidden', marginBottom: 40 }}>
                <NativeAnimated.View style={{
                    height: '100%',
                    backgroundColor: c.primary,
                    width: widthInterp,
                    borderRadius: 5
                }} />
            </View>

            {isComplete && (
                <View style={{ width: '100%', gap: 16 }}>
                    <Button
                        title={t('start_exploring' as any)}
                        onPress={onFinish}
                        variant="primary"
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        gap: 15
    },
    progressContainer: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        borderRadius: 3
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    questionText: {
        fontSize: 26, // Little smaller for professionalism
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 34
    },
    subText: {
        fontSize: 16,
        marginBottom: 24,
        opacity: 0.7
    },
    optionsContainer: {
        gap: 12,
        marginTop: 10
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 16
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionLabel: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2
    },
    optionDesc: {
        fontSize: 13,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 4,
        height: 56
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        marginLeft: 8
    },
    suggestionsList: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        borderWidth: 1,
        borderRadius: 14,
        maxHeight: 200,
        overflow: 'hidden'
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    mapPlaceholder: {
        marginTop: 20,
        height: 150,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    categoryCard: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        marginBottom: 4
    },
    categoryText: {
        fontWeight: '600',
        fontSize: 15
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 5
    },
    selectableChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    addBtn: {
        padding: 8
    },
    footer: {
        padding: 24,
        borderTopWidth: 1
    }
});

export default SkillSelectionScreen;
