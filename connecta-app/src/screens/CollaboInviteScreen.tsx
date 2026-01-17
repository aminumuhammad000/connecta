import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Button from '../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { get } from '../services/api';
import { acceptCollaboRole } from '../services/collaboService';

export default function CollaboInviteScreen() {
    const c = useThemeColors();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { roleId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (roleId) loadData();
    }, [roleId]);

    const loadData = async () => {
        try {
            const res = await get(`/collabo/role/${roleId}`);
            setData((res as any).data || res);
        } catch (error) {
            Alert.alert("Error", "Invite not found or expired.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await acceptCollaboRole(roleId);
            Alert.alert("Welcome to the Team!", "You have successfully joined the project.", [
                {
                    text: "Go to Workspace", onPress: () => {
                        navigation.replace('CollaboWorkspace', { projectId: data.project._id });
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert("Error", "Failed to accept invite.");
        } finally {
            setAccepting(false);
        }
    };

    if (loading) return <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center' }]}><ActivityIndicator size="large" color={c.primary} /></View>;
    if (!data) return null;

    const { role, project } = data;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/476/476863.png' }} // Party/Team icon
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                />

                <Text style={[styles.title, { color: c.text }]}>You're Invited!</Text>
                <Text style={[styles.subtitle, { color: c.subtext }]}>
                    {project.clientId.firstName} invited you to join their team.
                </Text>

                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.projectTitle, { color: c.text }]}>{project.title}</Text>
                    <Text style={[styles.projectDesc, { color: c.subtext }]}>{project.description}</Text>

                    <View style={styles.divider} />

                    <Text style={[styles.roleLabel, { color: c.subtext }]}>YOUR ROLE</Text>
                    <Text style={[styles.roleTitle, { color: c.primary }]}>{role.title}</Text>
                    <Text style={[styles.budget, { color: c.text }]}>Budget: ${role.budget}</Text>
                </View>

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

            </ScrollView>
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
