import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Animated, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import * as rewardService from '../services/rewardService';
import { useInAppAlert } from '../components/InAppAlert';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import { Modal, Image } from 'react-native';

const { width } = Dimensions.get('window');

const SendSparkScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();

    const [permission, requestPermission] = useCameraPermissions();
    const [showScanner, setShowScanner] = useState(false);
    const [step, setStep] = useState(1); // 1: Recipient, 2: Amount, 3: PIN
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [recipientData, setRecipientData] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [txnDetails, setTxnDetails] = useState<any>(null);

    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: step,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [step]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'connecta_spark_transfer' && parsed.email) {
                setRecipientEmail(parsed.email);
                setShowScanner(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                validateRecipient(parsed.email);
            } else {
                showAlert({ title: 'Invalid QR', message: 'This is not a valid Connecta Spark QR code', type: 'error' });
            }
        } catch (e) {
            showAlert({ title: 'Invalid QR', message: 'Could not read QR code data', type: 'error' });
        }
    };

    const validateRecipient = async (email: string) => {
        const emailToValidate = email || recipientEmail;
        if (!emailToValidate) {
            showAlert({ title: 'Hint', message: 'Please enter recipient email', type: 'info' });
            return;
        }

        try {
            setIsValidating(true);
            const isEmail = emailToValidate.includes('@');
            const res = await rewardService.validateRecipient(
                isEmail ? { email: emailToValidate } : { userId: emailToValidate }
            );
            setRecipientData(res.data || res.user);
            setStep(2);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error: any) {
            showAlert({ title: 'Not Found', message: error.message || 'Recipient not found', type: 'error' });
        } finally {
            setIsValidating(false);
        }
    };

    const handleAmountSubmit = () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            showAlert({ title: 'Invalid Amount', message: 'Please enter a valid amount of Sparks', type: 'error' });
            return;
        }
        setStep(3);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handlePinPress = (val: string) => {
        if (pin.length < 4) {
            const newPin = pin + val;
            setPin(newPin);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (newPin.length === 4) {
                processTransfer(newPin);
            }
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const processTransfer = async (finalPin: string) => {
        try {
            setIsSending(true);
            const res = await rewardService.transferSparks({
                recipientEmail: recipientData.email,
                amount: parseFloat(amount),
                transactionPin: finalPin
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Set transaction details for the modal
            setTxnDetails({
                amount: amount,
                recipientName: `${recipientData.firstName} ${recipientData.lastName}`,
                recipientEmail: recipientData.email,
                date: new Date().toLocaleString(),
                reference: `SPK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            });

            setShowSuccessModal(true);
        } catch (error: any) {
            showAlert({ title: 'Transfer Failed', message: error.message || 'Check your PIN and balance', type: 'error' });
            setPin(''); // Reset PIN on failure
        } finally {
            setIsSending(false);
        }
    };

    const handleShareReceipt = async () => {
        if (!txnDetails) return;

        const message = `Connecta Spark Transfer Successful! ✨\n\n` +
            `Sent: ${txnDetails.amount} Sparks\n` +
            `To: ${txnDetails.recipientName}\n` +
            `Date: ${txnDetails.date}\n` +
            `Ref: ${txnDetails.reference}\n\n` +
            `Join me on Connecta!`;

        try {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                // For simplicity sharing as text, in a real app might generate an image/PDF
                Alert.alert("Share Receipt", "Share your transaction details", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Share as Text", onPress: () => Sharing.shareAsync("", { dialogTitle: "Connecta Receipt", mimeType: "text/plain", UTI: "public.plain-text" }) }
                ]);
            }
        } catch (error) {
            console.error("Sharing failed", error);
        }
    };

    const renderSuccessModal = () => (
        <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.successCard, { backgroundColor: c.card }]}>
                    <LinearGradient
                        colors={[c.primary, '#4F46E5']}
                        style={styles.successHeader}
                    >
                        <View style={styles.successIconBg}>
                            <MaterialIcons name="check" size={40} color="#fff" />
                        </View>
                        <Text style={styles.successHeaderTitle}>Transfer Successful</Text>
                    </LinearGradient>

                    <View style={styles.receiptContent}>
                        <View style={styles.receiptRow}>
                            <Text style={[styles.receiptLabel, { color: c.subtext }]}>Amount Sent</Text>
                            <View style={styles.receiptValueWrap}>
                                <MaterialIcons name="bolt" size={20} color="#FBBF24" />
                                <Text style={[styles.receiptAmount, { color: c.text }]}>{txnDetails?.amount} Sparks</Text>
                            </View>
                        </View>

                        <View style={styles.receiptDivider} />

                        <View style={styles.receiptRow}>
                            <Text style={[styles.receiptLabel, { color: c.subtext }]}>Recipient</Text>
                            <Text style={[styles.receiptValue, { color: c.text }]}>{txnDetails?.recipientName}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={[styles.receiptLabel, { color: c.subtext }]}>Email</Text>
                            <Text style={[styles.receiptValue, { color: c.text, fontSize: 13 }]}>{txnDetails?.recipientEmail}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={[styles.receiptLabel, { color: c.subtext }]}>Date</Text>
                            <Text style={[styles.receiptValue, { color: c.text }]}>{txnDetails?.date}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={[styles.receiptLabel, { color: c.subtext }]}>Reference</Text>
                            <Text style={[styles.receiptValue, { color: c.primary, fontWeight: '700' }]}>{txnDetails?.reference}</Text>
                        </View>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity
                            style={[styles.shareBtn, { borderColor: c.primary }]}
                            onPress={handleShareReceipt}
                        >
                            <Ionicons name="share-social-outline" size={20} color={c.primary} />
                            <Text style={[styles.shareBtnText, { color: c.primary }]}>Share Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.doneBtn, { backgroundColor: c.primary }]}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );

    const renderScanner = () => {
        if (!permission) return null;
        if (!permission.granted) {
            return (
                <View style={styles.scannerOverlay}>
                    <View style={[styles.scannerModal, { backgroundColor: c.card }]}>
                        <Ionicons name="camera-outline" size={48} color={c.primary} />
                        <Text style={[styles.scannerTitle, { color: c.text }]}>Camera Access</Text>
                        <Text style={[styles.scannerSub, { color: c.subtext }]}>We need camera permission to scan QR codes.</Text>
                        <TouchableOpacity style={[styles.grantBtn, { backgroundColor: c.primary }]} onPress={requestPermission}>
                            <Text style={styles.grantBtnText}>Grant Permission</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowScanner(false)} style={{ marginTop: 16 }}>
                            <Text style={{ color: c.subtext }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.scannerWrapper}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />
                <View style={styles.scannerUI}>
                    <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeScanner}>
                        <MaterialIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.scanTarget}>
                        <View style={[styles.targetCorner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
                        <View style={[styles.targetCorner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
                        <View style={[styles.targetCorner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
                        <View style={[styles.targetCorner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />
                    </View>
                    <Text style={styles.scanText}>Center the QR code to scan</Text>
                </View>
            </View>
        );
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.label, { color: c.text }]}>Recipient Email</Text>
            <View style={[styles.inputGroup, { borderColor: c.border, backgroundColor: c.card }]}>
                <MaterialIcons name="email" size={20} color={c.subtext} style={{ marginRight: 12 }} />
                <TextInput
                    style={[styles.input, { color: c.text }]}
                    placeholder="Enter email or Account ID"
                    placeholderTextColor={c.subtext}
                    value={recipientEmail}
                    onChangeText={setRecipientEmail}
                    keyboardType="default"
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity
                style={[styles.qrButton, { borderColor: c.primary }]}
                onPress={() => setShowScanner(true)}
            >
                <MaterialIcons name="qr-code-scanner" size={24} color={c.primary} />
                <Text style={[styles.qrButtonText, { color: c.primary }]}>Scan QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: c.primary }]}
                onPress={() => validateRecipient('')}
                disabled={isValidating}
            >
                {isValidating ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Next Step</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.recipientBadge}>
                <View style={[styles.recipientAvatar, { backgroundColor: c.primary }]}>
                    {recipientData?.profileImage ? (
                        <Image source={{ uri: recipientData.profileImage }} style={styles.recipientAvatar} />
                    ) : (
                        <Text style={styles.avatarText}>{recipientData?.name?.[0] || recipientData?.firstName?.[0] || '?'}</Text>
                    )}
                </View>
                <View>
                    <Text style={[styles.recipientName, { color: c.text }]}>{recipientData?.name || `${recipientData?.firstName} ${recipientData?.lastName}`}</Text>
                    <Text style={[styles.recipientEmail, { color: c.subtext }]}>{recipientData?.email}</Text>
                </View>
            </View>

            <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>Amount to Send</Text>
            <View style={[styles.amountGroup, { borderColor: c.border, backgroundColor: c.card }]}>
                <MaterialIcons name="bolt" size={32} color="#FBBF24" style={{ marginRight: 12 }} />
                <TextInput
                    style={[styles.amountInput, { color: c.text }]}
                    placeholder="0"
                    placeholderTextColor={c.subtext}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    autoFocus
                />
            </View>

            <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: c.primary, marginTop: 32 }]}
                onPress={handleAmountSubmit}
            >
                <Text style={styles.mainBtnText}>Confirm Amount</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 16, alignSelf: 'center' }}>
                <Text style={{ color: c.subtext }}>Change Recipient</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.label, { color: c.text, textAlign: 'center' }]}>Enter Transaction PIN</Text>
            <Text style={[styles.sub, { color: c.subtext, textAlign: 'center', marginBottom: 32 }]}>
                To send {amount} Sparks to {recipientData?.firstName}
            </Text>

            <View style={styles.pinDisplay}>
                {[0, 1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.pinDot,
                            { borderColor: c.primary, backgroundColor: pin.length > i ? c.primary : 'transparent' }
                        ]}
                    />
                ))}
            </View>

            <View style={styles.padRow}>
                {[1, 2, 3].map(n => (
                    <TouchableOpacity key={n} style={[styles.padBtn, { backgroundColor: c.card }]} onPress={() => handlePinPress(n.toString())}>
                        <Text style={[styles.padBtnText, { color: c.text }]}>{n}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.padRow}>
                {[4, 5, 6].map(n => (
                    <TouchableOpacity key={n} style={[styles.padBtn, { backgroundColor: c.card }]} onPress={() => handlePinPress(n.toString())}>
                        <Text style={[styles.padBtnText, { color: c.text }]}>{n}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.padRow}>
                {[7, 8, 9].map(n => (
                    <TouchableOpacity key={n} style={[styles.padBtn, { backgroundColor: c.card }]} onPress={() => handlePinPress(n.toString())}>
                        <Text style={[styles.padBtnText, { color: c.text }]}>{n}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.padRow}>
                <View style={{ width: 70 }} />
                <TouchableOpacity style={[styles.padBtn, { backgroundColor: c.card }]} onPress={() => handlePinPress('0')}>
                    <Text style={[styles.padBtnText, { color: c.text }]}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.padBtn} onPress={handleBackspace}>
                    <MaterialIcons name="backspace" size={24} color={c.text} />
                </TouchableOpacity>
            </View>

            {isSending && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={c.primary} />
                    <Text style={{ color: c.text, marginTop: 12, fontWeight: '700' }}>Processing Transfer...</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Send Sparks</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </ScrollView>

            {showSuccessModal && renderSuccessModal()}
            {showScanner && renderScanner()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    stepContainer: { padding: 24, flex: 1 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    sub: { fontSize: 14, marginBottom: 12 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 20 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    qrButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', gap: 10, marginBottom: 40 },
    qrButtonText: { fontSize: 15, fontWeight: '700' },
    mainBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    recipientBadge: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 24 },
    recipientAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    recipientName: { fontSize: 18, fontWeight: '800' },
    recipientEmail: { fontSize: 14 },
    amountGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 24, paddingHorizontal: 20, height: 80 },
    amountInput: { flex: 1, fontSize: 32, fontWeight: '900' },
    pinDisplay: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 48 },
    pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
    padRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
    padBtn: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
    padBtnText: { fontSize: 24, fontWeight: '800' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    scannerWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
    scannerUI: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    closeScanner: { position: 'absolute', top: 50, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    scanTarget: { width: 250, height: 250, position: 'relative' },
    targetCorner: { position: 'absolute', width: 40, height: 40, borderColor: '#fff' },
    scanText: { color: '#fff', marginTop: 40, fontWeight: '700', fontSize: 16 },
    scannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 32 },
    scannerModal: { padding: 32, borderRadius: 32, alignItems: 'center', width: '100%' },
    scannerTitle: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8 },
    scannerSub: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    grantBtn: { height: 50, paddingHorizontal: 30, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    grantBtnText: { color: '#fff', fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { width: '100%', borderRadius: 32, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    successHeader: { padding: 40, alignItems: 'center' },
    successIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successHeaderTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    receiptContent: { padding: 32 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    receiptLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    receiptValue: { fontSize: 16, fontWeight: '700' },
    receiptValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    receiptAmount: { fontSize: 20, fontWeight: '900' },
    receiptDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 8, marginBottom: 24 },
    successActions: { padding: 32, paddingTop: 0, gap: 16 },
    shareBtn: { height: 56, borderRadius: 16, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    shareBtnText: { fontSize: 16, fontWeight: '800' },
    doneBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    doneBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});

export default SendSparkScreen;
