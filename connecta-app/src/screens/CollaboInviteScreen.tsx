import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Button from '../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getRole, acceptCollaboRole } from '../services/collaboService';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function CollaboInviteScreen() {
    const c = useThemeColors();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { roleId } = route.params || {};
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [accepting, setAccepting] = useState(false);

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
        visible: false,
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    useEffect(() => {
        if (roleId) loadData();
    }, [roleId]);

    const loadData = async () => {
        try {
            const res = await getRole(roleId);
            setData((res as any).data || res);
        } catch (error) {
            showAlert('Error', 'Invite not found or expired.', 'error');
            setTimeout(() => navigation.goBack(), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await acceptCollaboRole(roleId);
            showAlert('Success', 'Welcome to the team! 🎉', 'success');
            setTimeout(() => {
                navigation.replace('CollaboWorkspace', { projectId: data.project._id });
            }, 1500);
        } catch (error: any) {
            showAlert('Error', 'Failed to accept invite. Please try again.', 'error');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) return <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center' }]}><ActivityIndicator size="large" color={c.primary} /></View>;
    if (!data) return null;

    const { role, project } = data;
    const isAlreadyAccepted = role.status === 'filled' && role.freelancerId?._id === user?._id;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                <Image
                    source={{ uri: isAlreadyAccepted ? 'https://cdn-icons-png.flaticon.com/512/5290/5290058.png' : 'https://cdn-icons-png.flaticon.com/512/476/476863.png' }}
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                />

                <Text style={[styles.title, { color: c.text }]}>{isAlreadyAccepted ? 'Already on the Team!' : "You're Invited!"}</Text>
                <Text style={[styles.subtitle, { color: c.subtext }]}>
                    {isAlreadyAccepted
                        ? "You've already accepted this role."
                        : `${project.clientId.firstName} invited you to join their team.`
                    }
                </Text>

                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.projectTitle, { color: c.text }]}>{project.title}</Text>
                    <Text style={[styles.projectDesc, { color: c.subtext }]}>{project.description}</Text>

                    <View style={styles.divider} />

                    <Text style={[styles.roleLabel, { color: c.subtext }]}>YOUR ROLE</Text>
                    <Text style={[styles.roleTitle, { color: c.primary }]}>{role.title}</Text>
                    <Text style={[styles.budget, { color: c.text }]}>Budget: ${role.budget}</Text>
                </View>

                {isAlreadyAccepted ? (
                    <Button
                        title="Go to Workspace"
                        onPress={() => navigation.replace('CollaboWorkspace', { projectId: project._id })}
                        style={{ width: '100%', marginTop: 24 }}
                    />
                ) : (
                    <>
                        <Button
                            title="Accept & Join Team"
                            onPress={handleAccept}
                            loading={accepting}
                            style={{ width: '100%', marginTop: 24 }}
                        />

                        <Button
                            title="Decline"
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={{ width: '100%', marginTop: 12 }}
                        />
                    </>
                )}

            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    card: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center'
    },
    projectTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    projectDesc: { textAlign: 'center', marginBottom: 20 },
    divider: { height: 1, backgroundColor: '#EEE', width: '100%', marginBottom: 20 },
    roleLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
    roleTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    budget: { fontSize: 18, fontWeight: '600' }
});
