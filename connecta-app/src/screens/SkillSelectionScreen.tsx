import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Animated as NativeAnimated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import CustomAlert from '../components/CustomAlert';
import * as profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { saveToken } from '../utils/storage';
import { Profile } from '../types';

const { width } = Dimensions.get('window');

// --- Types ---
interface OnboardingData {
    remoteWorkType: 'remote_only' | 'hybrid' | 'onsite' | null;
    minimumSalary: string;
    workLocationPreferences: string[];
    jobTitle: string;
    jobCategories: string[];
    yearsOfExperience: string;
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
const JOB_CATEGORIES = [
    'Web Development', 'Mobile Development', 'Data Science', 'Design',
    'Writing', 'Marketing', 'Sales', 'Customer Support', 'Virtual Assistance',
    'Accounting', 'Legal', 'HR', 'Engineering', 'Architecture'
];

const ENGAGEMENT_TYPES = [
    { id: 'full_time', label: 'Full-time' },
    { id: 'part_time', label: 'Part-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'internship', label: 'Internship' },
];

const NOTIFICATION_FREQUENCIES = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'relevant_only', label: 'Only when highly relevant' },
];

// --- Wizard Steps ---

// 1. Remote Work Type
const RemoteWorkStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const options = [
        { id: 'remote_only', label: 'Remote Only', icon: 'laptop' },
        { id: 'hybrid', label: 'Hybrid', icon: 'business' },
        { id: 'onsite', label: 'On-site', icon: 'location-city' },
    ];

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>What type of remote work are you looking for?</Text>
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
                        <MaterialIcons name={opt.icon as any} size={32} color={data.remoteWorkType === opt.id ? c.primary : c.subtext} />
                        <Text style={[styles.optionLabel, { color: data.remoteWorkType === opt.id ? c.primary : c.text }]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// 2. Salary
const SalaryStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>What is your minimum desired salary?</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>Annual USD equivalent</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ color: c.text, fontSize: 18, marginRight: 8 }}>$</Text>
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    value={data.minimumSalary}
                    onChangeText={(val) => updateData('minimumSalary', val.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 50000"
                    placeholderTextColor={c.subtext}
                    keyboardType="numeric"
                />
            </View>
        </View>
    );
};

// 3. Location
const LocationStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    const [input, setInput] = useState('');

    const addLocation = () => {
        if (input.trim() && !data.workLocationPreferences.includes(input.trim())) {
            updateData('workLocationPreferences', [...data.workLocationPreferences, input.trim()]);
            setInput('');
        }
    };

    const removeLocation = (loc: string) => {
        updateData('workLocationPreferences', data.workLocationPreferences.filter(l => l !== loc));
    };

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Where do you want to work remotely from?</Text>
            <Text style={[styles.subText, { color: c.subtext }]}>Add preferred countries or timezones</Text>

            <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.card }]}>
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    value={input}
                    onChangeText={setInput}
                    placeholder="e.g. Anywhere, USA, UTC+1"
                    placeholderTextColor={c.subtext}
                    onSubmitEditing={addLocation}
                />
                <TouchableOpacity onPress={addLocation} style={styles.addBtn}>
                    <MaterialIcons name="add" size={24} color={c.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.chipsContainer}>
                {data.workLocationPreferences.map(loc => (
                    <View key={loc} style={[styles.chip, { backgroundColor: c.primary + '20' }]}>
                        <Text style={{ color: c.primary }}>{loc}</Text>
                        <TouchableOpacity onPress={() => removeLocation(loc)}>
                            <MaterialIcons name="close" size={16} color={c.primary} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

// 4. Job Title
const JobTitleStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Do you have a specific job title in mind?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    value={data.jobTitle}
                    onChangeText={(val) => updateData('jobTitle', val)}
                    placeholder="e.g. Senior React Developer"
                    placeholderTextColor={c.subtext}
                />
            </View>
        </View>
    );
};

// 5. Categories
const CategoriesStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();

    const toggleCategory = (cat: string) => {
        if (data.jobCategories.includes(cat)) {
            updateData('jobCategories', data.jobCategories.filter(c => c !== cat));
        } else {
            if (data.jobCategories.length < 5) {
                updateData('jobCategories', [...data.jobCategories, cat]);
            }
        }
    };

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>Select up to 5 job categories</Text>
            <ScrollView style={{ maxHeight: 400 }}>
                <View style={styles.chipsContainer}>
                    {JOB_CATEGORIES.map(cat => {
                        const isSelected = data.jobCategories.includes(cat);
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.selectableChip,
                                    {
                                        backgroundColor: isSelected ? c.primary : c.card,
                                        borderColor: isSelected ? c.primary : c.border
                                    }
                                ]}
                                onPress={() => toggleCategory(cat)}
                            >
                                <Text style={{ color: isSelected ? '#fff' : c.text }}>{cat}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

// 6. Experience
const ExperienceStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>How many years of relevant experience do you have?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.card, borderColor: c.border }]}>
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    value={data.yearsOfExperience}
                    onChangeText={(val) => updateData('yearsOfExperience', val.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 5"
                    placeholderTextColor={c.subtext}
                    keyboardType="numeric"
                    maxLength={2}
                />
                <Text style={{ color: c.subtext, fontSize: 16 }}>years</Text>
            </View>
        </View>
    );
};

// 7. Engagement Type
const EngagementStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();

    const toggleEngagement = (id: string) => {
        if (data.engagementTypes.includes(id)) {
            updateData('engagementTypes', data.engagementTypes.filter(t => t !== id));
        } else {
            updateData('engagementTypes', [...data.engagementTypes, id]);
        }
    };

    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>What type of engagement are you open to?</Text>
            <View style={styles.optionsContainer}>
                {ENGAGEMENT_TYPES.map((opt) => {
                    const isSelected = data.engagementTypes.includes(opt.id);
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: isSelected ? c.primary + '15' : c.card,
                                    borderColor: isSelected ? c.primary : c.border
                                }
                            ]}
                            onPress={() => toggleEngagement(opt.id)}
                        >
                            <MaterialIcons
                                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                                size={24}
                                color={isSelected ? c.primary : c.subtext}
                            />
                            <Text style={[styles.optionLabel, { marginLeft: 12, color: isSelected ? c.primary : c.text }]}>{opt.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// 8. Notification Frequency
const NotificationStep: React.FC<StepProps> = ({ data, updateData }) => {
    const c = useThemeColors();
    return (
        <View style={styles.stepContainer}>
            <Text style={[styles.questionText, { color: c.text }]}>How often would you like to receive job recommendations?</Text>
            <View style={styles.optionsContainer}>
                {NOTIFICATION_FREQUENCIES.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        style={[
                            styles.optionCard,
                            {
                                backgroundColor: data.jobNotificationFrequency === opt.id ? c.primary + '15' : c.card,
                                borderColor: data.jobNotificationFrequency === opt.id ? c.primary : c.border
                            }
                        ]}
                        onPress={() => updateData('jobNotificationFrequency', opt.id)}
                    >
                        <MaterialIcons
                            name={data.jobNotificationFrequency === opt.id ? "radio-button-checked" : "radio-button-unchecked"}
                            size={24}
                            color={data.jobNotificationFrequency === opt.id ? c.primary : c.subtext}
                        />
                        <Text style={[styles.optionLabel, { marginLeft: 12, color: data.jobNotificationFrequency === opt.id ? c.primary : c.text }]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
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
        remoteWorkType: null,
        minimumSalary: '',
        workLocationPreferences: [],
        jobTitle: '',
        jobCategories: [],
        yearsOfExperience: '',
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
                //useNativeDriver: true, // Some properties might not support native driver, safer to disable or check
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
                    duration: 200,
                    useNativeDriver: true,
                }),
                NativeAnimated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const nextStep = () => {
        if (step < 7) {
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
            // 1. Temporarily save token if needed
            if (token) await saveToken(token);

            // 2. Prepare profile data
            const profileUpdate: Partial<Profile> = {
                remoteWorkType: data.remoteWorkType as any,
                minimumSalary: parseInt(data.minimumSalary) || 0,
                workLocationPreferences: data.workLocationPreferences,
                jobTitle: data.jobTitle,
                jobCategories: data.jobCategories,
                yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
                engagementTypes: data.engagementTypes,
                jobNotificationFrequency: data.jobNotificationFrequency as any,
                // Also populate standard 'skills' with categories just in case
                skills: data.jobCategories
            };

            await profileService.updateMyProfile(profileUpdate);

        } catch (error) {
            console.error("Profile update error:", error);
            // Even if update fails, we might want to let them in, or show error.
            // For onboarding flow, usually better to let them in and retry later or show alert.
        }
    };

    // Called by MatchingScreen when animation finishes
    const handleMatchingFinished = async () => {
        if (token && user) {
            try {
                // Ensure we pass the updated user or re-fetch? 
                // Usually logging in with existing user object is fine, auth context might re-fetch profile.
                await loginWithToken(token, user);
            } catch (e) {
                console.error("Login after matching failed", e);
                navigation.navigate('Login'); // Fallback to login if context fails
            }
        } else if (!token) {
            navigation.goBack();
        }
    };

    const StepComponents = [
        RemoteWorkStep,
        SalaryStep,
        LocationStep,
        JobTitleStep,
        CategoriesStep,
        ExperienceStep,
        EngagementStep,
        NotificationStep
    ];

    const CurrentStepComponent = StepComponents[step];

    if (isMatching) {
        return <MatchingScreen onFinish={handleMatchingFinished} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header / Progress */}
            <View style={styles.header}>
                <TouchableOpacity onPress={prevStep} disabled={step === 0} style={{ opacity: step === 0 ? 0 : 1 }}>
                    <MaterialIcons name="arrow-back" size={28} color={c.text} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${((step + 1) / 8) * 100}%`, backgroundColor: c.primary }]} />
                </View>
                <Text style={[styles.stepIndicator, { color: c.subtext }]}>{step + 1}/8</Text>
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
                    title={step === 7 ? "Find Matching Jobs" : "Next"}
                    onPress={nextStep}
                    variant="primary"
                // Add validation logic here to disable if empty
                />
            </View>
        </SafeAreaView>
    );
};

const MatchingScreen = ({ onFinish }: { onFinish: () => void }) => {
    const c = useThemeColors();
    const progress = useRef(new NativeAnimated.Value(0)).current;
    const [statusText, setStatusText] = useState("Analyzing your profile...");
    const [matchCount, setMatchCount] = useState(0);

    useEffect(() => {
        // Duration: 10 seconds total
        const duration = 10000;

        NativeAnimated.timing(progress, {
            toValue: 1,
            duration: duration,
            useNativeDriver: false, // width needs false
            easing: Easing.linear
        }).start(({ finished }) => {
            if (finished) {
                onFinish();
            }
        });

        // Text Updates
        const t1 = setTimeout(() => setStatusText("Scanning 10,000+ active listings..."), 2500);
        const t2 = setTimeout(() => setStatusText("Filtering by your preferences..."), 5000);
        const t3 = setTimeout(() => setStatusText("Found high-quality matches!"), 8000);

        // Counter Effect
        const interval = setInterval(() => {
            setMatchCount(prev => {
                if (prev < 320) return prev + Math.floor(Math.random() * 5) + 1;
                return prev;
            });
        }, 150);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearInterval(interval);
        };
    }, []);

    const widthInterp = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>

            {/* Icon Animation */}
            <View style={{ marginBottom: 50, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: c.primary + '10' }} />
                <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: c.primary + '20' }} />
                <MaterialIcons name="work-outline" size={50} color={c.primary} />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 16, textAlign: 'center' }}>
                {statusText}
            </Text>

            <Text style={{ fontSize: 15, color: c.subtext, marginBottom: 40, textAlign: 'center' }}>
                Connecting you with top clients globally
            </Text>

            {/* Progress Bar */}
            <View style={{ width: '100%', height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                <NativeAnimated.View style={{ height: '100%', backgroundColor: c.primary, width: widthInterp }} />
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialIcons name="check-circle" size={20} color={'#10B981'} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
                    {matchCount > 0 ? `${matchCount} Potential Jobs Found` : 'Starting search...'}
                </Text>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 15
    },
    progressContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
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
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        marginBottom: 30,
    },
    optionsContainer: {
        gap: 12,
        marginTop: 20
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '500'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        fontSize: 18,
        height: 48
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    addBtn: {
        padding: 8
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 15
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    selectableChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1
    }
});

export default SkillSelectionScreen;
