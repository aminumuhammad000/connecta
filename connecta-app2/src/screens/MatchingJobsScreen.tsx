import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import * as profileService from '../services/profileService';
import apiClient from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const MATCH_MESSAGES = [
    "Analyzing your preferences...",
    "Scanning 100,000+ Categories...",
    "Filtering by Remote Preferences...",
    "Matching Salary Expectations...",
    "Found 1,000+ Jobs for you!"
];

const MatchingJobsScreen: React.FC<any> = ({ navigation, route }) => {
    const c = useThemeColors();
    const { token, answers } = route.params || {};
    const { login } = useAuth();

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [animationFinished, setAnimationFinished] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Check completion
    useEffect(() => {
        if (animationFinished && profileSaved) {
            if (token) {
                login(token);
                // AuthContext update will likely unmount this screen and switch navigators
            } else {
                console.error("No token available for login");
                navigation.navigate('Login');
            }
        }
    }, [animationFinished, profileSaved]);

    useEffect(() => {
        // Start Animation Sequence
        animateMessage();

        // Start Backend Save Process
        saveProfileAndLogin();
    }, []);

    const animateMessage = () => {
        // Reset
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Hold for a bit
            setTimeout(() => {
                if (currentMessageIndex < MATCH_MESSAGES.length - 1) {
                    // Fade out and next
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true
                    }).start(() => {
                        setCurrentMessageIndex(prev => prev + 1);
                    });
                } else {
                    // Last message finished holding
                    setAnimationFinished(true);
                }
            }, 1500);
        });
    };

    // Trigger next animation when index changes
    useEffect(() => {
        if (currentMessageIndex > 0) {
            animateMessage();
        }

        // Update progress bar
        Animated.timing(progressAnim, {
            toValue: (currentMessageIndex + 1) / MATCH_MESSAGES.length,
            duration: 500,
            useNativeDriver: false // width is not native
        }).start();

    }, [currentMessageIndex]);

    const saveProfileAndLogin = async () => {
        try {
            if (token) {
                // Manually set token for this request since we aren't "logged in" globally yet
                // This allows us to save the profile BEFORE the auth context switches the navigator (and unmounts us)
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const profileUpdates: any = {};
                if (answers) {
                    if (answers.categories) profileUpdates.skills = answers.categories;
                    if (answers.jobTitle) profileUpdates.title = answers.jobTitle;
                    if (answers.minSalary) {
                        // Clean string and convert to number
                        const num = parseInt(answers.minSalary.replace(/[^0-9]/g, ''));
                        if (!isNaN(num)) profileUpdates.hourlyRate = num;
                    }
                    if (answers.remoteType) profileUpdates.remotePreference = answers.remoteType;
                    // Add checks for other fields like location, experience, etc.
                }

                console.log("Saving profile updates:", profileUpdates);
                await profileService.updateMyProfile(profileUpdates);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setProfileSaved(true);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>

            {/* Animated Icon / Visual */}
            <View style={{ marginBottom: 40 }}>
                <MaterialIcons name="travel-explore" size={80} color={c.primary} />
            </View>

            {/* Message */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 12 }}>
                    {MATCH_MESSAGES[currentMessageIndex]}
                </Text>
            </Animated.View>

            {/* Progress Bar */}
            <View style={{ width: '100%', height: 6, backgroundColor: c.border, borderRadius: 3, marginTop: 40, overflow: 'hidden' }}>
                <Animated.View
                    style={{
                        height: '100%',
                        backgroundColor: c.primary,
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                        })
                    }}
                />
            </View>

        </View>
    );
};

export default MatchingJobsScreen;
