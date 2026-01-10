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

const { width } = Dimensions.get('window');

// --- Types ---
interface OnboardingData {
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
        'Structural Engineer', 'Chemical Engineer', 'Biomedical Engineer'
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

// 1. Remote Work Type
const RemoteWorkStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const options = [
        { id: 'remote_only', label: 'Remote Only', icon: 'laptop-mac', desc: 'Work from anywhere' },
        { id: 'hybrid', label: 'Hybrid', icon: 'sync-alt', desc: 'Mix of home & office' },
        { id: 'onsite', label: 'On-site', icon: 'location-city', desc: 'Work at an office' },
    ];

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>What type of work are you looking for?</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>We'll curate jobs based on your preference.</Text>
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

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Which industry best describes your skills?</Text>
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
                        style={[styles.categoryCard, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => updateData('category', 'Other')}
                    >
                        <Text style={[styles.categoryText, { color: c.text }]}>Other</Text>
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

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Select specific roles in {data.category}</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>Select up to 5 that apply to you</Text>

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
    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Are you on WhatsApp?</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>Add your number to receive instant job alerts (Optional).</Text>

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

    const [step, setStep] = useState(0);
    const [isMatching, setIsMatching] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new NativeAnimated.Value(1)).current;
    const slideAnim = useRef(new NativeAnimated.Value(0)).current;

    const [data, setData] = useState<OnboardingData>({
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
        if (step === 0 && !data.remoteWorkType) return;
        if (step === 1 && !data.workLocation) return;
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
                remoteWorkType: data.remoteWorkType as any,
                workLocationPreferences: [data.workLocation], // Storing as array for compatibility
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

        } catch (error) {
            console.error("Profile update error:", error);
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
        RemoteWorkStep,
        LocationStep,
        CategoryStep,
        JobTitlesStep,
        WhatsAppStep
    ];

    const CurrentStepComponent = Steps[step];

    if (isMatching) {
        return <MatchingScreen onFinish={handleMatchingFinished} navigation={navigation} />;
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
                <Text style={[styles.stepIndicator, { color: c.subtext }]}>{step + 1}/{Steps.length}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <NativeAnimated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
                    <CurrentStepComponent
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                        onPrev={prevStep}
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
                        (step === 1 && !data.workLocation) ||
                        (step === 2 && !data.category) ||
                        (step === 3 && data.jobTitles.length === 0)
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const MatchingScreen = ({ onFinish, navigation }: { onFinish: () => void, navigation: any }) => {
    const c = useThemeColors();
    const progress = useRef(new NativeAnimated.Value(0)).current;
    const [statusText, setStatusText] = useState("Analyzing your fit...");
    const [matchCount, setMatchCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const duration = 2500; // Speed up to 2.5 seconds
        NativeAnimated.timing(progress, {
            toValue: 1,
            duration: duration,
            useNativeDriver: false,
            easing: Easing.out(Easing.quad)
        }).start(({ finished }) => {
            if (finished) setIsComplete(true);
        });

        const t1 = setTimeout(() => setStatusText("Scanning job market..."), 600);
        const t2 = setTimeout(() => setStatusText("Found relevant opportunities!"), 1200);

        // Faster counter to reach high numbers in 2.5s
        const interval = setInterval(() => {
            setMatchCount(prev => prev < 152 ? prev + Math.floor(Math.random() * 8) + 3 : prev);
        }, 80);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearInterval(interval);
        };
    }, []);

    const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
                <NativeAnimated.View style={{ transform: [{ scale: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.1, 1] }) }] }}>
                    <MaterialIcons name="auto-awesome" size={64} color={c.primary} />
                </NativeAnimated.View>
            </View>

            <Text style={{ fontSize: 24, fontWeight: '700', color: c.text, marginBottom: 12, textAlign: 'center' }}>
                {statusText}
            </Text>
            <Text style={{ fontSize: 16, color: c.subtext, marginBottom: 40, textAlign: 'center' }}>
                We are personalizing your dashboard
            </Text>

            <View style={{ width: '100%', height: 8, backgroundColor: c.border, borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
                <NativeAnimated.View style={{ height: '100%', backgroundColor: c.primary, width: widthInterp }} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: c.card, borderRadius: 20, marginBottom: 40 }}>
                <MaterialIcons name="check-circle" size={20} color={'#10B981'} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>{matchCount}+ Jobs Found</Text>
            </View>

            {isComplete && (
                <View style={{ width: '100%', gap: 16 }}>
                    <Button
                        title="Go to Dashboard"
                        onPress={onFinish}
                        variant="primary"
                    />
                    <Button
                        title="Complete Profile"
                        onPress={() => {
                            // First finalize onboarding logic then navigate
                            onFinish();
                            // Note: We need a slight delay or mechanism to ensure we land on dashboard then navigate,
                            // or we can navigate directly if user is already logged incontext.
                            // Given the flow, onFinish logs them in. We might need to handle navigation params.
                            // Ideally, we'd navigate to EditProfile directly if we can, but we need to ensure login state first.
                            // For simplicity, let's assume onFinish handles the login/main-nav state switch.
                            // But usually onFinish calls loginWithToken which resets nav stack.
                            // So we might rely on the user navigating manually or finding the button in dashboard if the nav resets.
                            // HOWEVER, if we want to force it:
                            setTimeout(() => navigation.navigate('EditProfile'), 500);
                        }}
                        variant="outline"
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
