import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import paymentService from '../services/paymentService';
import { Bank } from '../types';
import { useInAppAlert } from '../components/InAppAlert';

const WithdrawalSetupScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadBanks();
    }, []);

    const loadBanks = async () => {
        try {
            const data = await paymentService.getBanks();
            setBanks(data);
        } catch (error) {
            console.error('Error loading banks:', error);
            showAlert({ title: 'Error', message: 'Failed to load banks', type: 'error' });
        }
    };

    const handleAccountNumberChange = (text: string) => {
        setAccountNumber(text);
        if (text.length === 10 && selectedBank) {
            resolveAccount(text, selectedBank.code);
        } else {
            setAccountName('');
        }
    };

    const resolveAccount = async (accNum: string, bankCode: string) => {
        try {
            setIsResolving(true);
            const data = await paymentService.resolveBankAccount(accNum, bankCode);
            setAccountName(data.account_name);
        } catch (error) {
            console.error('Error resolving account:', error);
            setAccountName('');
            showAlert({ title: 'Invalid Account', message: 'Could not resolve account details', type: 'error' });
        } finally {
            setIsResolving(false);
        }
    };

    const handleSave = async () => {
        if (!selectedBank || !accountNumber || !accountName) {
            showAlert({ title: 'Missing Info', message: 'Please fill all details', type: 'error' });
            return;
        }

        try {
            setIsSaving(true);
            await paymentService.saveWithdrawalSettings({
                accountName,
                accountNumber,
                bankName: selectedBank.name,
                bankCode: selectedBank.code,
            });
            showAlert({ title: 'Success', message: 'Withdrawal settings saved', type: 'success' });
            navigation.goBack();
        } catch (error) {
            console.error('Error saving settings:', error);
            showAlert({ title: 'Error', message: 'Failed to save settings', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Withdrawal Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={[styles.label, { color: c.text }]}>Select Bank</Text>
                <TouchableOpacity
                    style={[styles.input, { borderColor: c.border, backgroundColor: c.card, justifyContent: 'center' }]}
                    onPress={() => setShowBankModal(true)}
                >
                    <Text style={{ color: selectedBank ? c.text : c.subtext }}>
                        {selectedBank ? selectedBank.name : 'Choose your bank'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={c.subtext} style={{ position: 'absolute', right: 12 }} />
                </TouchableOpacity>

                <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>Account Number</Text>
                <TextInput
                    style={[styles.input, { borderColor: c.border, backgroundColor: c.card, color: c.text }]}
                    placeholder="Enter 10-digit account number"
                    placeholderTextColor={c.subtext}
                    keyboardType="numeric"
                    maxLength={10}
                    value={accountNumber}
                    onChangeText={handleAccountNumberChange}
                />

                <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>Account Name</Text>
                <View style={[styles.input, { borderColor: c.border, backgroundColor: c.isDark ? '#1F2937' : '#F3F4F6', justifyContent: 'center' }]}>
                    {isResolving ? (
                        <ActivityIndicator size="small" color={c.primary} />
                    ) : (
                        <Text style={{ color: accountName ? '#10B981' : c.subtext, fontWeight: '600' }}>
                            {accountName || 'Waiting for valid account number...'}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: c.primary, opacity: (!accountName || isSaving) ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={!accountName || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save & Verify</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Bank Selection Modal */}
            <Modal visible={showBankModal} animationType="slide" presentationStyle="pageSheet">
                <View style={{ flex: 1, backgroundColor: c.background }}>
                    <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                        <Text style={[styles.modalTitle, { color: c.text }]}>Select Bank</Text>
                        <TouchableOpacity onPress={() => setShowBankModal(false)}>
                            <Text style={{ color: c.primary, fontSize: 16 }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 12 }}>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: c.card, color: c.text }]}
                            placeholder="Search banks..."
                            placeholderTextColor={c.subtext}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <FlatList
                        data={filteredBanks}
                        keyExtractor={item => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.bankItem, { borderBottomColor: c.border }]}
                                onPress={() => {
                                    setSelectedBank(item);
                                    setShowBankModal(false);
                                    if (accountNumber.length === 10) resolveAccount(accountNumber, item.code);
                                }}
                            >
                                <Text style={{ color: c.text, fontSize: 16 }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
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
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveBtn: {
        marginTop: 40,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    searchInput: {
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    bankItem: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});

export default WithdrawalSetupScreen;
