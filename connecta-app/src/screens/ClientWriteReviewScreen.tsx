import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import * as reviewService from '../services/reviewService';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const ClientWriteReviewScreen = ({ navigation, route }: any) => {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const { projectId, revieweeId, projectTitle, freelancerName, freelancerAvatar } = route.params || {};

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) {
            showAlert({ title: 'Comment required', message: 'Please share your experience with the freelancer.', type: 'warning' });
            return;
        }

        try {
            setIsSubmitting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            await reviewService.createReview({
                projectId,
                revieweeId,
                reviewerType: 'client',
                rating,
                comment,
            });

            showAlert({ title: 'Success', message: 'Review posted successfully!', type: 'success' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Go back to projects or dashboard
            navigation.navigate('ClientProjects');
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to post review', type: 'error' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="close" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Write a Review</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.projectInfo}>
                        <Text style={[styles.projectLabel, { color: c.subtext }]}>Project Completed</Text>
                        <Text style={[styles.projectTitle, { color: c.text }]}>{projectTitle || 'Project Name'}</Text>
                        <Text style={[styles.freelancerName, { color: c.primary }]}>with {freelancerName || 'Freelancer'}</Text>
                    </View>

                    <View style={styles.ratingSection}>
                        <Text style={[styles.sectionLabel, { color: c.text }]}>How was your experience?</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity 
                                    key={star} 
                                    onPress={() => {
                                        setRating(star);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <MaterialIcons 
                                        name={star <= rating ? "star" : "star-border"} 
                                        size={48} 
                                        color={star <= rating ? "#F59E0B" : c.border} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.ratingText, { color: c.subtext }]}>
                            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                        </Text>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={[styles.sectionLabel, { color: c.text }]}>Share more details (optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
                            placeholder="How did the freelancer do? Would you recommend them?"
                            placeholderTextColor={c.subtext}
                            multiline
                            numberOfLines={6}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: c.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Post Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    projectInfo: {
        alignItems: 'center',
        marginBottom: 40,
    },
    projectLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '600',
    },
    inputSection: {
        marginBottom: 24,
    },
    input: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 8 : 24,
    },
    submitBtn: {
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
});

export default ClientWriteReviewScreen;
