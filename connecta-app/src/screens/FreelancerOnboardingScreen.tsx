import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

type StepConfig = {
    id: string;
    question: string;
    type: 'single-select' | 'multi-select' | 'input' | 'currency' | 'tags';
    options?: string[];
    placeholder?: string;
    maxSelection?: number;
};

const STEPS: StepConfig[] = [
    {
        id: 'remoteType',
        question: 'What type of remote work are you looking for?',
        type: 'single-select',
        options: ['Fully Remote', 'Hybrid (Mostly Remote)', 'Hybrid (Occasional)']
    },
    {
        id: 'minSalary',
        question: 'What is your minimum desired salary (Annual Naira)?',
        type: 'currency',
        placeholder: 'e.g. 50,000'
    },
    {
        id: 'location',
        question: 'Where do you want to work remotely from?',
        type: 'input',
        placeholder: 'City, Country or Timezone'
    },
    {
        id: 'jobTitle',
        question: 'Do you have a specific job title in mind?',
        type: 'input',
        placeholder: 'e.g. Senior Frontend Developer'
    },
    {
        id: 'categories',
        question: 'Select up to 5 job categories.',
        type: 'tags',
        maxSelection: 5,
        options: [
            'Web Development', 'Mobile Dev', 'Design', 'Writing', 'Data Science',
            'Marketing', 'Sales', 'Customer Support', 'Virtual Assistant', 'Video Editing',
            'Blockchain', 'AI/ML', 'DevOps', 'Cybersecurity', 'Game Dev'
        ]
    },
    {
        id: 'experience',
        question: 'How many years of relevant experience do you have?',
        type: 'single-select',
        options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years', '10+ years']
    },
    {
        id: 'engagement',
        question: 'What type of engagement are you open to?',
        type: 'multi-select',
        options: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
    },
    {
        id: 'frequency',
        question: 'How often would you like to receive job recommendations?',
        type: 'single-select',
        options: ['Daily', 'Weekly', 'Only when highly relevant']
    }
];

const FreelancerOnboardingScreen: React.FC<any> = ({ navigation, route }) => {
    const c = useThemeColors();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});

    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // token from passed down params or context, needed for final submission
    const { token } = route.params || {};

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            animateTransition('next', () => setCurrentStep(prev => prev + 1));
        } else {
            // Finished
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            animateTransition('back', () => setCurrentStep(prev => prev - 1));
        } else {
            navigation.goBack();
        }
    };

    const animateTransition = (direction: 'next' | 'back', callback: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: direction === 'next' ? -50 : 50,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            callback();
            slideAnim.setValue(direction === 'next' ? 50 : -50);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    const handleSubmit = () => {
        // In a real app, send 'answers' to backend here using 'token'
        console.log('Onboarding Answers:', answers);
        navigation.navigate('MatchingJobs', { token, answers });
    };

    const updateAnswer = (value: any) => {
        const step = STEPS[currentStep];
        setAnswers({ ...answers, [step.id]: value });
    };

    const renderInput = (step: StepConfig) => {
        const value = answers[step.id];

        switch (step.type) {
            case 'input':
            case 'currency':
                return (
                    <TextInput
                        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                        placeholder={step.placeholder}
                        placeholderTextColor={c.subtext}
                        value={value}
                        onChangeText={updateAnswer}
                        keyboardType={step.type === 'currency' ? 'numeric' : 'default'}
                    />
                );
            case 'single-select':
                return (
                    <View style={styles.optionsContainer}>
                        {step.options?.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[
                                    styles.optionButton,
                                    { borderColor: c.border, backgroundColor: value === opt ? c.primary : c.card }
                                ]}
                                onPress={() => updateAnswer(opt)}
                            >
                                <Text style={[styles.optionText, { color: value === opt ? '#fff' : c.text }]}>
                                    {opt}
                                </Text>
                                {value === opt && <MaterialIcons name="check" size={20} color="#fff" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'multi-select':
                const selected = (value as string[]) || [];
                const toggleSelection = (opt: string) => {
                    if (selected.includes(opt)) {
                        updateAnswer(selected.filter(s => s !== opt));
                    } else {
                        updateAnswer([...selected, opt]);
                    }
                };
                return (
                    <View style={styles.optionsContainer}>
                        {step.options?.map((opt) => {
                            const isSelected = selected.includes(opt);
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.optionButton,
                                        { borderColor: c.border, backgroundColor: isSelected ? c.primary : c.card }
                                    ]}
                                    onPress={() => toggleSelection(opt)}
                                >
                                    <Text style={[styles.optionText, { color: isSelected ? '#fff' : c.text }]}>
                                        {opt}
                                    </Text>
                                    {isSelected && <MaterialIcons name="check" size={20} color="#fff" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            case 'tags':
                const tags = (value as string[]) || [];
                const toggleTag = (opt: string) => {
                    if (tags.includes(opt)) {
                        updateAnswer(tags.filter(t => t !== opt));
                    } else {
                        if (tags.length < (step.maxSelection || 5)) {
                            updateAnswer([...tags, opt]);
                        }
                    }
                };
                return (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {step.options?.map(opt => {
                            const isSelected = tags.includes(opt);
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.tagChip,
                                        {
                                            backgroundColor: isSelected ? c.primary : c.card,
                                            borderColor: c.border,
                                            borderWidth: isSelected ? 0 : 1
                                        }
                                    ]}
                                    onPress={() => toggleTag(opt)}
                                >
                                    <Text style={{ color: isSelected ? '#fff' : c.text, fontWeight: '500' }}>{opt}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            default:
                return null;
        }
    };

    const step = STEPS[currentStep];
    const progress = ((currentStep + 1) / STEPS.length) * 100;
    const isLastStep = currentStep === STEPS.length - 1;

    // Validation to enable Next button
    const isValid = () => {
        const val = answers[step.id];
        if (step.type === 'multi-select' || step.type === 'tags') {
            return val && val.length > 0;
        }
        return !!val;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Header / Progress */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBackground, { backgroundColor: c.border }]}>
                        <Animated.View style={[styles.progressBarFill, { backgroundColor: c.primary, width: `${progress}%` }]} />
                    </View>
                    <Text style={{ color: c.subtext, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                        Step {currentStep + 1} of {STEPS.length}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <Animated.View
                    style={{
                        flex: 1,
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }]
                    }}
                >
                    <Text style={[styles.questionText, { color: c.text }]}>{step.question}</Text>

                    <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
                        {renderInput(step)}
                    </ScrollView>

                </Animated.View>

                <View style={styles.footer}>
                    <Button
                        title={isLastStep ? "Find My Matches" : "Next"}
                        onPress={handleNext}
                        disabled={!isValid()}
                        style={{ width: '100%' }}
                        size="large"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
        marginLeft: 16,
    },
    progressBarBackground: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    questionText: {
        fontSize: 26,
        fontWeight: '800',
        marginTop: 20,
        marginBottom: 32,
        lineHeight: 34,
    },
    input: {
        borderBottomWidth: 2,
        fontSize: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tagChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
    },
    footer: {
        paddingVertical: 24,
    }
});

export default FreelancerOnboardingScreen;
