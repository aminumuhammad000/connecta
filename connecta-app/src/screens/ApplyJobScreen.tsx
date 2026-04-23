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
    const { jobId, jobTitle, jobBudget, jobDuration, proposalId, initialData } = route.params || {};
    const isEditing = !!proposalId;
    const { showAlert } = useInAppAlert();

    const [coverLetter, setCoverLetter] = useState(initialData?.coverLetter || initialData?.description || '');
    const [proposedRate, setProposedRate] = useState(initialData?.budget?.amount ? String(initialData.budget.amount) : (jobBudget ? String(jobBudget) : ''));
    const [duration, setDuration] = useState(initialData?.duration || (jobDuration ? String(jobDuration) + (String(jobDuration).includes('day') || String(jobDuration).includes('week') ? '' : ' days') : ''));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isRateEditable, setIsRateEditable] = useState(false);
    const [isDurationEditable, setIsDurationEditable] = useState(false);

    const handleSubmit = async () => {
        if (!proposedRate.trim()) {
            showAlert({ title: 'Missing Info', message: 'Please enter your proposed rate.', type: 'error' });
            return;
        }

        try {
            setIsSubmitting(true);
            // Calculate days for deliveryTime
            let days = 30;
            const d = duration.toLowerCase();
            if (d.includes('week')) {
                days = (parseInt(d) || 1) * 7;
            } else if (d.includes('month')) {
                days = (parseInt(d) || 1) * 30;
            } else if (d.includes('day')) {
                days = parseInt(d) || 1;
            } else {
                days = parseInt(duration) || 30;
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + days);

            const proposalData: any = {
                jobId,
                description: coverLetter,
                coverLetter: coverLetter,
                title: jobTitle || 'Job Application',
                price: Number(proposedRate),
                deliveryTime: days,
                budget: {
                    amount: Number(proposedRate),
                    currency: '₦'
                },
                dateRange: {
                    startDate: startDate,
                    endDate: endDate
                },
                type: 'recommendation', 
                level: 'intermediate',
                priceType: 'fixed',
                status: 'pending'
            };

            if (isEditing) {
                await proposalService.updateProposal(proposalId, proposalData);
                showAlert({
                    title: 'Proposal Updated',
                    message: 'Your proposal has been updated successfully.',
                    type: 'success'
                });
            } else {
                await proposalService.createProposal(proposalData);
                showAlert({
                    title: 'Proposal Submitted',
                    message: 'Good luck! The client will review it shortly.',
                    type: 'success'
                });
            }
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


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={{ flex: 1, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
                <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="close" size={22} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: c.text }]}>{isEditing ? 'Edit Proposal' : 'Apply to Job'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                        <Text style={[styles.jobTitle, { color: c.text }]}>Applying to: {jobTitle || 'Unknown Job'}</Text>

                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <View>
                                    <Text style={[styles.label, { color: c.text, marginBottom: 0 }]}>Proposed Rate (₦)</Text>
                                    {!!jobBudget && <Text style={{ fontSize: 11, color: c.subtext, marginTop: 2 }}>Client's budget: ₦{jobBudget}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => setIsRateEditable(!isRateEditable)}>
                                    <MaterialIcons name={isRateEditable ? "lock-open" : "edit"} size={18} color={isRateEditable ? c.primary : c.subtext} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, { color: c.text, borderColor: isRateEditable ? c.primary : c.border, backgroundColor: c.card, opacity: isRateEditable ? 1 : 0.7 }]}
                                value={proposedRate}
                                onChangeText={setProposedRate}
                                keyboardType="numeric"
                                placeholder="Ex: 500"
                                placeholderTextColor={c.subtext}
                                editable={isRateEditable}
                            />
                        </View>

                        <View style={{ marginTop: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <View>
                                    <Text style={[styles.label, { color: c.text, marginBottom: 0 }]}>Estimated Duration</Text>
                                    {!!jobDuration && <Text style={{ fontSize: 11, color: c.subtext, marginTop: 2 }}>Client expects: {String(jobDuration).includes('day') || String(jobDuration).includes('week') ? jobDuration : `${jobDuration} days`}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => setIsDurationEditable(!isDurationEditable)}>
                                    <MaterialIcons name={isDurationEditable ? "lock-open" : "edit"} size={18} color={isDurationEditable ? c.primary : c.subtext} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, { color: c.text, borderColor: isDurationEditable ? c.primary : c.border, backgroundColor: c.card, opacity: isDurationEditable ? 1 : 0.7 }]}
                                value={duration}
                                onChangeText={setDuration}
                                placeholder="Ex: 2 weeks"
                                placeholderTextColor={c.subtext}
                                editable={isDurationEditable}
                            />
                        </View>

                        <View style={{ marginTop: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={[styles.label, { color: c.text, marginBottom: 0 }]}>Cover Letter (Optional)</Text>
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
                            <Text style={styles.submitText}>{isEditing ? 'Update Proposal' : 'Submit Proposal'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View >
        </SafeAreaView >
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
