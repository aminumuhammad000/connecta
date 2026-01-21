import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import proposalService from '../services/proposalService';
import { useInAppAlert } from '../components/InAppAlert';

const ApplyJobScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { jobId, jobTitle, jobBudget } = route.params || {};
    const { showAlert } = useInAppAlert();

    const [coverLetter, setCoverLetter] = useState('');
    const [proposedRate, setProposedRate] = useState(jobBudget ? String(jobBudget) : '');
    const [duration, setDuration] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!coverLetter.trim()) {
            showAlert({ title: 'Missing Info', message: 'Please write a cover letter.', type: 'error' });
            return;
        }
        if (!proposedRate.trim()) {
            showAlert({ title: 'Missing Info', message: 'Please enter your proposed rate.', type: 'error' });
            return;
        }

        try {
            setIsSubmitting(true);
            // Calculate valid date range from duration string
            const startDate = new Date();
            const endDate = new Date();
            // Simple parsing: if contains 'week' add 7*n, 'month' add 30*n, else default 30 days
            const d = duration.toLowerCase();
            if (d.includes('week')) {
                const num = parseInt(d) || 1;
                endDate.setDate(endDate.getDate() + (num * 7));
            } else if (d.includes('month')) {
                const num = parseInt(d) || 1;
                endDate.setDate(endDate.getDate() + (num * 30));
            } else {
                endDate.setDate(endDate.getDate() + 30);
            }

            await proposalService.createProposal({
                jobId,
                description: coverLetter,
                coverLetter: coverLetter,
                title: jobTitle || 'Job Application',
                budget: {
                    amount: Number(proposedRate),
                    currency: '$'
                },
                dateRange: {
                    startDate: startDate,
                    endDate: endDate
                },
                type: 'recommendation', // Required enum by backend
                level: 'intermediate',
                priceType: 'fixed',
                status: 'pending'
            });
            showAlert({
                title: 'Proposal Submitted',
                message: 'Good luck! The client will review it shortly.',
                type: 'success'
            });
            setTimeout(() => navigation.goBack(), 1500);
        } catch (error: any) {
            console.error('Submit proposal error:', error);
            showAlert({
                title: 'Submission Failed',
                message: error.response?.data?.message || 'Failed to submit proposal.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateWithAI = async () => {
        try {
            setIsGenerating(true);
            const response = await proposalService.generateCoverLetter(jobId);
            if (response && response.coverLetter) {
                setCoverLetter(response.coverLetter);
            } else {
                showAlert({ title: 'AI Error', message: 'Failed to generate cover letter.', type: 'error' });
            }
        } catch (error) {
            console.error('AI generation error:', error);
            showAlert({ title: 'Error', message: 'Failed to generate cover letter.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialIcons name="close" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Apply to Job</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                    <Text style={[styles.jobTitle, { color: c.text }]}>Applying to: {jobTitle || 'Unknown Job'}</Text>

                    <View style={{ marginTop: 20 }}>
                        <Text style={[styles.label, { color: c.text }]}>Proposed Rate ($)</Text>
                        <TextInput
                            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                            value={proposedRate}
                            onChangeText={setProposedRate}
                            keyboardType="numeric"
                            placeholder="Ex: 500"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.label, { color: c.text }]}>Estimated Duration</Text>
                        <TextInput
                            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                            value={duration}
                            onChangeText={setDuration}
                            placeholder="Ex: 2 weeks"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={{ marginTop: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={[styles.label, { color: c.text, marginBottom: 0 }]}>Cover Letter</Text>
                            <TouchableOpacity
                                onPress={handleGenerateWithAI}
                                disabled={isGenerating}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
                            >
                                {isGenerating ? (
                                    <ActivityIndicator size="small" color={c.primary} />
                                ) : (
                                    <>
                                        <MaterialIcons name="auto-awesome" size={14} color={c.primary} />
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: c.primary }}>
                                            {coverLetter ? 'Regenerate with AI' : 'Generate with AI'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.textArea, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                            multiline
                            textAlignVertical="top"
                            placeholder="Describe why you are the best fit for this job... or use AI to generate one!"
                            placeholderTextColor={c.subtext}
                        />
                        <Text style={{ fontSize: 11, color: c.subtext, marginTop: 4, textAlign: 'right' }}>
                            Powered by Gemini AI • You can edit the text above.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { borderTopColor: c.border, paddingBottom: insets.bottom + 16, backgroundColor: c.background }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: c.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Submit Proposal</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    appBarTitle: { fontSize: 16, fontWeight: '600' },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    jobTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    textArea: {
        height: 150,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    submitBtn: {
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ApplyJobScreen;
