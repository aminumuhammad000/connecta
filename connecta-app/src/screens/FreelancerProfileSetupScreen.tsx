import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Animated as NativeAnimated, Easing, Keyboard, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import * as profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { saveToken } from '../utils/storage';
import ChatGreeting from '../components/ChatGreeting';
import { JOB_DATA } from './SkillSelectionScreen'; // Reuse the skill data

const { width, height } = Dimensions.get('window');
const CATEGORIES = Object.keys(JOB_DATA);

const FreelancerProfileSetupScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const c = useThemeColors();
    const { token, user } = route.params || {};
    const { loginWithToken } = useAuth();

    const [step, setStep] = useState(0);
    const [isMatching, setIsMatching] = useState(false);
    
    // Form Data
    const [category, setCategory] = useState('');
    const [primarySkill, setPrimarySkill] = useState('');
    const [subSkills, setSubSkills] = useState<string[]>([]);
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [remoteWorkType, setRemoteWorkType] = useState<'remote_only' | 'hybrid' | 'onsite'>('remote_only');
    const [bio, setBio] = useState('');

    // Animation Values
    const fadeAnim = useRef(new NativeAnimated.Value(1)).current;
    const slideAnim = useRef(new NativeAnimated.Value(0)).current;

    const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
        NativeAnimated.parallel([
            NativeAnimated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            NativeAnimated.timing(slideAnim, { toValue: direction === 'next' ? -50 : 50, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            callback();
            slideAnim.setValue(direction === 'next' ? 50 : -50);
            NativeAnimated.parallel([
                NativeAnimated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                NativeAnimated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (step < 3) {
            animateTransition('next', () => setStep(step + 1));
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsMatching(true);
        try {
            if (token) await saveToken(token);
            const profileData: any = {
                primarySkill,
                subSkills,
                yearsOfExperience: parseInt(yearsOfExperience) || 0,
                remoteWorkType,
                bio,
                category
            };
            await profileService.updateMyProfile(profileData);

            
            // Artificial delay for "Matching" feel
            setTimeout(async () => {
                if (token && user) {
                    await loginWithToken(token, user);
                } else {
                    navigation.navigate('Login');
                }
            }, 3000);
        } catch (error) {
            console.error("Profile setup failed", error);
            setIsMatching(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Category
                return (
                    <View style={styles.stepContainer}>
                        <ChatGreeting messages={[{ text: "What's your primary field?" }]} />
                        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
                            <View style={styles.grid}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        style={[styles.categoryCard, { backgroundColor: category === cat ? c.primary : c.card, borderColor: c.border }]}
                                        onPress={() => { setCategory(cat); setPrimarySkill(''); setSubSkills([]); }}
                                    >
                                        <Text style={{ color: category === cat ? '#fff' : c.text, fontWeight: '600' }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                );
            case 1: // Skills
                const titles = category ? JOB_DATA[category] : [];
                return (
                    <View style={styles.stepContainer}>
                        <ChatGreeting messages={[{ text: `Awesome! Which of these skills do you have in ${category}?` }]} />
                        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
                            <View style={styles.chipsContainer}>
                                {titles.map(title => {
                                    const isSelected = primarySkill === title || subSkills.includes(title);
                                    return (
                                        <TouchableOpacity 
                                            key={title} 
                                            style={[styles.chip, { backgroundColor: isSelected ? c.primary : c.card, borderColor: c.border }]}
                                            onPress={() => {
                                                if (!primarySkill) setPrimarySkill(title);
                                                else if (primarySkill === title) setPrimarySkill('');
                                                else if (subSkills.includes(title)) setSubSkills(subSkills.filter(s => s !== title));
                                                else setSubSkills([...subSkills, title]);
                                            }}
                                        >
                                            <Text style={{ color: isSelected ? '#fff' : c.text }}>{title}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                );
            case 2: // Experience & Work Type
                return (
                    <View style={styles.stepContainer}>
                        <ChatGreeting messages={[{ text: "Tell us about your experience and how you like to work." }]} />
                        <View style={{ marginTop: 24, gap: 20 }}>
                            <Text style={[styles.label, { color: c.text }]}>Years of Experience</Text>
                            <View style={styles.grid}>
                                {['0-2', '3-5', '5-10', '10+'].map(exp => (
                                    <TouchableOpacity 
                                        key={exp} 
                                        style={[styles.optionBtn, { backgroundColor: yearsOfExperience === exp ? c.primary : c.card, borderColor: c.border }]}
                                        onPress={() => setYearsOfExperience(exp)}
                                    >
                                        <Text style={{ color: yearsOfExperience === exp ? '#fff' : c.text }}>{exp} Years</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <Text style={[styles.label, { color: c.text, marginTop: 10 }]}>Preferred Work Type</Text>
                            <View style={styles.grid}>
                                {[
                                    { id: 'remote_only', label: 'Remote', icon: 'laptop' },
                                    { id: 'onsite', label: 'Onsite', icon: 'business' },
                                    { id: 'hybrid', label: 'Hybrid', icon: 'sync' }
                                ].map((type: any) => (
                                    <TouchableOpacity 
                                        key={type.id} 
                                        style={[styles.optionBtn, { backgroundColor: remoteWorkType === type.id ? c.primary : c.card, borderColor: c.border }]}
                                        onPress={() => setRemoteWorkType(type.id)}
                                    >
                                        <Ionicons name={type.icon as any} size={18} color={remoteWorkType === type.id ? '#fff' : c.subtext} />
                                        <Text style={{ color: remoteWorkType === type.id ? '#fff' : c.text, marginLeft: 8 }}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 3: // Bio
                return (
                    <View style={styles.stepContainer}>
                        <ChatGreeting messages={[{ text: "Lastly, write a short bio about yourself." }]} />
                        <View style={{ marginTop: 24 }}>
                            <TextInput 
                                style={[styles.bioInput, { color: c.text, backgroundColor: c.card, borderColor: c.border }]}
                                multiline
                                numberOfLines={5}
                                placeholder="e.g. I am a passionate developer with a focus on..."
                                placeholderTextColor={c.subtext}
                                value={bio}
                                onChangeText={setBio}
                                maxLength={150}
                            />
                            <Text style={{ color: c.subtext, textAlign: 'right', marginTop: 8 }}>{bio.length}/150 words</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    if (isMatching) {
        return (
            <View style={[styles.matchingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={[styles.matchingText, { color: c.text }]}>Matching you with the best jobs...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step > 0 ? animateTransition('prev', () => setStep(step - 1)) : navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((step + 1) / 4) * 100}%`, backgroundColor: c.primary }]} />
                </View>
            </View>

            <NativeAnimated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
                {renderStep()}
            </NativeAnimated.View>

            <View style={styles.footer}>
                <View style={styles.buttonWrapper}>
                    <Button 
                        title={step === 3 ? "Complete Profile" : "Continue"} 
                        onPress={handleNext}
                        disabled={
                            (step === 0 && !category) ||
                            (step === 1 && !primarySkill) ||
                            (step === 2 && (!yearsOfExperience || !remoteWorkType)) ||
                            (step === 3 && bio.length < 20)
                        }
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    progressBar: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3, marginLeft: 20 },
    progressFill: { height: '100%', borderRadius: 3 },
    stepContainer: { flex: 1, padding: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryCard: { padding: 16, borderRadius: 12, borderWidth: 1, minWidth: (width - 52) / 2 },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
    label: { fontSize: 16, fontWeight: 'bold' },
    optionBtn: { padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', minWidth: (width - 52) / 2 },
    bioInput: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16, textAlignVertical: 'top', height: 150 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
    buttonWrapper: { width: '60%' },
    matchingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    matchingText: { marginTop: 20, fontSize: 18, fontWeight: '600' }
});

export default FreelancerProfileSetupScreen;
