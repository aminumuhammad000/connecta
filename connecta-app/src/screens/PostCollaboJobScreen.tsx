import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { createCollaboProject, activateCollaboProject } from '../services/collaboService';
import { post } from '../services/api';
import { useInAppAlert } from '../components/InAppAlert';

import { JOB_CATEGORIES, JOB_TYPES, LOCATION_SCOPES, LOCATION_TYPES, DURATION_TYPES } from '../utils/categories';

export default function PostCollaboJobScreen({ navigation }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [step, setStep] = useState<'basics' | 'chat' | 'review'>('basics');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [scopingData, setScopingData] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // New Fields
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [projectType, setProjectType] = useState('one-time');
    const [scope, setScope] = useState('local');
    const [durationValue, setDurationValue] = useState('');
    const [durationType, setDurationType] = useState('months');

    const handleScopeProject = async () => {
        if (!description.trim()) {
            showAlert({ title: "Input Required", message: "Please describe your project idea.", type: 'warning' });
            return;
        }

        setIsLoading(true);
        try {
            // Call the backend scoping endpoint
            // Note: Using direct post here or create a service method
            const response = await post('/api/collabo/scope', { description });
            setScopingData((response as any).data || response);
            setStep('review');
        } catch (error: any) {
            showAlert({ title: "Error", message: error.message || "Failed to analyze project.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        setIsLoading(true);
        try {
            const projectData = {
                title: "New Collabo Project", // Could ask for this or extract from description
                description: description,
                totalEstimatedBudget: scopingData.totalEstimatedBudget, // Fixed field name to match backend expectation if needed, although original was totalBudget. Keeping logic but replacing alert.
                totalBudget: scopingData.totalEstimatedBudget,
                roles: scopingData.roles,
                milestones: scopingData.milestones,
                recommendedStack: scopingData.recommendedStack,
                risks: scopingData.risks,
                category: JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.label || 'General',
                niche: subCategory,
                projectType,
                scope,
                duration: durationValue,
                durationType
            };

            const response = await createCollaboProject(projectData);
            const project = response.project || response;

            // Auto-activate (Simulate payment success)
            await activateCollaboProject(project._id);

            showAlert({
                title: "Success",
                message: "Collabo Project LIVE! System is inviting freelancers now.",
                type: 'success'
            });
            setTimeout(() => {
                navigation.navigate("ClientTabs", { screen: "Projects" });
            }, 2000);

        } catch (error: any) {
            showAlert({ title: "Error", message: "Failed to create project.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderBasicsStep = () => (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* ... */}
            {/* Skipping to button part for replace ... */}
            <Button
                title="Continue to Project Details"
                onPress={() => {
                    if (!selectedCategoryId) {
                        showAlert({ title: 'Required', message: 'Please select a category.', type: 'warning' });
                        return;
                    }
                    setStep('chat');
                }}
                style={{ marginTop: 24 }}
            />
        </ScrollView>
    );

    const renderChatStep = () => (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={[styles.title, { color: c.text }]}>Describe your idea</Text>
            <Text style={[styles.subtitle, { color: c.subtext }]}>
                Tell us what you want to build. Our AI will break it down into roles, timelines, and budgets.
            </Text>

            <View style={[styles.chatBox, { backgroundColor: c.card, borderColor: c.border }]}>
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    placeholder="e.g. I want to build a multi-vendor e-commerce marketplace like Etsy..."
                    placeholderTextColor={c.subtext}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />
            </View>

            <View style={{ flex: 1 }} />

            <Button
                title={isLoading ? "Analyzing..." : "Analyze Project"}
                onPress={handleScopeProject}
                disabled={isLoading}
            />
        </View>
    );

    const renderReviewStep = () => (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={[styles.title, { color: c.text }]}>Project Plan</Text>
            <Text style={[styles.subtitle, { color: c.subtext, marginBottom: 20 }]}>
                Here is the AI-suggested team structure and budget.
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: c.primary + '15', borderColor: c.primary }]}>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: c.text }]}>Est. Budget</Text>
                    <Text style={[styles.summaryValue, { color: c.primary }]}>${scopingData?.totalEstimatedBudget}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: c.text }]}>Timeline</Text>
                    <Text style={[styles.summaryValue, { color: c.text }]}>{scopingData?.timeline}</Text>
                </View>
            </View>

            {scopingData?.recommendedStack && (
                <>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended Tech Stack</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {scopingData.recommendedStack.map((tech: string, i: number) => (
                            <View key={i} style={{ backgroundColor: c.card, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: c.border }}>
                                <Text style={{ color: c.text, fontSize: 13 }}>{tech}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {scopingData?.milestones && (
                <>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Project Implementation Plan</Text>
                    {scopingData.milestones.map((milestone: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <View style={{ width: 20, alignItems: 'center', marginRight: 12 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary, marginTop: 6 }} />
                                {i < scopingData.milestones.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: c.border, marginTop: 4 }} />}
                            </View>
                            <View style={{ flex: 1, backgroundColor: c.card, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>{milestone.title}</Text>
                                <Text style={{ color: c.primary, fontSize: 12, marginBottom: 4 }}>{milestone.duration}</Text>
                                <Text style={{ color: c.subtext, fontSize: 13 }}>{milestone.description}</Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            {scopingData?.risks && scopingData.risks.length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Potential Risks</Text>
                    {scopingData.risks.map((risk: string, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                            <MaterialIcons name="warning" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                            <Text style={{ color: c.text, fontSize: 13 }}>{risk}</Text>
                        </View>
                    ))}
                </>
            )}

            <Text style={[styles.sectionTitle, { color: c.text, marginTop: 24 }]}>Required Team ({scopingData?.roles.length})</Text>

            {scopingData?.roles.map((role: any, index: number) => (
                <View key={index} style={[styles.roleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={styles.roleHeader}>
                        <Text style={[styles.roleTitle, { color: c.text }]}>{role.title}</Text>
                        <Text style={[styles.roleBudget, { color: c.primary }]}>${role.budget}</Text>
                    </View>
                    <Text style={[styles.roleDesc, { color: c.subtext }]}>{role.description}</Text>

                    <View style={styles.skillsRow}>
                        {role.skills.map((skill: string, i: number) => (
                            <View key={i} style={[styles.skillChip, { backgroundColor: c.border }]}>
                                <Text style={[styles.skillText, { color: c.text }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>

                    {role.count > 1 && (
                        <View style={styles.countBadge}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{role.count} Specialists</Text>
                        </View>
                    )}
                </View>
            ))}

            <Button
                title={isLoading ? "Creating..." : "Create Project & Invite Team"}
                onPress={handleCreateProject}
                disabled={isLoading}
                style={{ marginTop: 20, marginBottom: 12 }}
            />

            <TouchableOpacity
                style={{ alignSelf: 'center', padding: 8 }}
                onPress={() => showAlert({ title: 'Manual Invite', message: 'This feature allows you to search and add specific freelancers to roles.', type: 'info' })}
            >
                <Text style={{ color: c.primary, fontWeight: '600' }}>+ Manually Invite Freelancers</Text>
            </TouchableOpacity>



            <View style={{ height: 40 }} />
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => {
                    if (step === 'review') setStep('chat');
                    else if (step === 'chat') setStep('basics');
                    else navigation.goBack();
                }}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>
                    {step === 'chat' ? 'Collabo Studio' : step === 'review' ? 'Review Plan' : 'New Project'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                {step === 'basics' && renderBasicsStep()}
                {step === 'chat' && renderChatStep()}
                {step === 'review' && renderReviewStep()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
    subtitle: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
    chatBox: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
    },
    input: {
        fontSize: 16,
        height: '100%',
    },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12 },
    summaryCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: { fontSize: 16 },
    summaryValue: { fontSize: 18, fontWeight: '700' },
    roleCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    roleTitle: { fontSize: 16, fontWeight: '700' },
    roleBudget: { fontSize: 16, fontWeight: '700' },
    roleDesc: { fontSize: 14, marginBottom: 12 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    skillText: { fontSize: 12 },
    countBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    selectionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        flex: 1,
    },
    selectionText: {
        fontWeight: '600',
        fontSize: 14,
    },
});
