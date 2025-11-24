import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function SuccessScreen({ navigation }: any) {
    const c = useThemeColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleBackToHome = () => {
        navigation.navigate('Welcome');
    };

    const handleFollowUs = () => {
        Linking.openURL('https://twitter.com/connecta');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="checkmark" size={50} color="white" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: c.text }]}>🎉 You're On The List!</Text>

                    {/* Description */}
                    <Text style={[styles.description, { color: c.textDim }]}>
                        Thank you for joining the Connecta waitlist! We're thrilled to have you on board.
                    </Text>

                    <Text style={[styles.subDescription, { color: c.textDim }]}>
                        We'll send you an exclusive early access invite to your email as soon as we launch. Get ready to experience the future of freelancing!
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: c.primary }]} onPress={handleBackToHome}>
                            <Text style={styles.buttonText}>Back to Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.outlineButton, { borderColor: c.border }]} onPress={handleFollowUs}>
                            <Ionicons name="logo-twitter" size={20} color={c.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.outlineButtonText, { color: c.text }]}>Follow Us</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Section */}
                    <View style={[styles.infoSection, { backgroundColor: c.card, borderColor: c.border }]}>
                        <Text style={[styles.infoTitle, { color: c.text }]}>What happens next?</Text>

                        <View style={styles.stepItem}>
                            <View style={[styles.stepNumber, { backgroundColor: c.primary }]}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepTextContainer}>
                                <Text style={[styles.stepTitle, { color: c.text }]}>Check Your Email</Text>
                                <Text style={[styles.stepDesc, { color: c.textDim }]}>We've sent a confirmation to your inbox</Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={[styles.stepNumber, { backgroundColor: c.primary }]}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepTextContainer}>
                                <Text style={[styles.stepTitle, { color: c.text }]}>Stay Tuned</Text>
                                <Text style={[styles.stepDesc, { color: c.textDim }]}>Follow us on social media for updates</Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={[styles.stepNumber, { backgroundColor: c.primary }]}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepTextContainer}>
                                <Text style={[styles.stepTitle, { color: c.text }]}>Get Early Access</Text>
                                <Text style={[styles.stepDesc, { color: c.textDim }]}>Be among the first to use Connecta</Text>
                            </View>
                        </View>
                    </View>

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f27f0d',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f27f0d',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 26,
    },
    subDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 48,
    },
    button: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        width: '100%',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        color: 'white',
        fontWeight: 'bold',
    },
    stepTextContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 14,
    },
});
