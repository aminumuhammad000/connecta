import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import proposalService from '../services/proposalService';

const ApplyJobScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { jobId, jobTitle, jobBudget } = route.params || {};

    const [coverLetter, setCoverLetter] = useState('');
    const [proposedRate, setProposedRate] = useState(jobBudget ? String(jobBudget) : '');
    const [duration, setDuration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!coverLetter.trim()) {
            Alert.alert('Error', 'Please write a cover letter.');
            return;
        }
        if (!proposedRate.trim()) {
            Alert.alert('Error', 'Please enter your proposed rate.');
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
                description: coverLetter, // Backend requires 'description'
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
            Alert.alert('Success', 'Your proposal has been submitted!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Submit proposal error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit proposal.');
        } finally {
            setIsSubmitting(false);
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
                        <Text style={[styles.label, { color: c.text }]}>Cover Letter</Text>
                        <TextInput
                            style={[styles.textArea, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                            multiline
                            textAlignVertical="top"
                            placeholder="Describe why you are the best fit for this job..."
                            placeholderTextColor={c.subtext}
                        />
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
