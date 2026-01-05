import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import paymentService from '../services/paymentService';
import { useInAppAlert } from '../components/InAppAlert';

const AdminWithdrawalsScreen = ({ navigation }: any) => {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadWithdrawals = async () => {
        try {
            setIsLoading(true);
            const data = await paymentService.getPendingWithdrawals();
            setWithdrawals(data);
        } catch (error) {
            console.error('Error loading withdrawals:', error);
            showAlert({ title: 'Error', message: 'Failed to load withdrawals', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadWithdrawals();
        }, [])
    );

    const handleApprove = async (id: string, amount: number) => {
        Alert.alert(
            'Confirm Approval',
            `Are you sure you want to process this withdrawal of $${amount}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Process',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setProcessingId(id);
                            await paymentService.processWithdrawal(id);
                            showAlert({ title: 'Success', message: 'Withdrawal processed!', type: 'success' });
                            loadWithdrawals();
                        } catch (error: any) {
                            console.error('Process error:', error);
                            showAlert({ title: 'Error', message: error.message || 'Failed to process', type: 'error' });
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isProcessing = processingId === item._id;

        return (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.row}>
                    <View>
                        <Text style={[styles.amount, { color: c.text }]}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format(item.amount)}
                        </Text>
                        <Text style={[styles.date, { color: c.subtext }]}>
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                        </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '700' }}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: c.border }]} />

                <View style={{ gap: 4, marginBottom: 12 }}>
                    <Text style={{ color: c.text, fontWeight: '600' }}>User Details:</Text>
                    <Text style={{ color: c.subtext }}>{item.userId?.firstName} {item.userId?.lastName}</Text>
                    <Text style={{ color: c.subtext }}>{item.userId?.email}</Text>
                </View>

                <View style={{ gap: 4, marginBottom: 16 }}>
                    <Text style={{ color: c.text, fontWeight: '600' }}>Bank Details:</Text>
                    <Text style={{ color: c.subtext }}>Bank: {item.bankDetails?.bankName}</Text>
                    <Text style={{ color: c.subtext }}>Account: {item.bankDetails?.accountNumber}</Text>
                    <Text style={{ color: c.subtext }}>Name: {item.bankDetails?.accountName}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: c.primary, opacity: isProcessing ? 0.7 : 1 }]}
                    onPress={() => handleApprove(item._id, item.amount)}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="check-circle" size={20} color="white" />
                            <Text style={styles.btnText}>Approve & Pay</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: c.text }]}>Withdrawal Requests</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            ) : (
                <FlatList
                    data={withdrawals}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialIcons name="fact-check" size={64} color={c.subtext} />
                            <Text style={{ color: c.subtext, marginTop: 16 }}>No pending withdrawals</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: { fontSize: 20, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    list: { padding: 16 },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    amount: { fontSize: 24, fontWeight: '800' },
    date: { fontSize: 13, marginTop: 4 },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    divider: { height: 1, width: '100%', marginBottom: 16 },
    btn: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default AdminWithdrawalsScreen;
