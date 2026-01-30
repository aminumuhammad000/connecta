import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

interface PaymentWebViewProps {
    visible: boolean;
    paymentUrl: string;
    onSuccess: (transactionId: string) => void;
    onCancel: () => void;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({
    visible,
    paymentUrl,
    onSuccess,
    onCancel,
}) => {
    const c = useThemeColors();
    const { width } = Dimensions.get('window');
    const [loading, setLoading] = useState(true);

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // Check if the URL contains success indicators
        if (url.includes('payment/callback') || url.includes('status=successful')) {
            // Extract transaction_id from URL
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const transactionId = urlParams.get('transaction_id');

            if (transactionId) {
                onSuccess(transactionId);
            }
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <View style={[styles.container, {
                backgroundColor: c.background,
                width: '100%',
                maxWidth: 800,
                alignSelf: 'center',
                borderLeftWidth: Platform.OS === 'web' && width > 800 ? 1 : 0,
                borderRightWidth: Platform.OS === 'web' && width > 800 ? 1 : 0,
                borderColor: c.border
            }]}>
                <View style={[styles.header, { borderBottomColor: c.border, paddingTop: Platform.OS === 'ios' ? 50 : 16 }]}>
                    <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Secure Payment</Text>
                    <View style={{ width: 40 }} /> {/* Spacer to center title */}
                </View>

                {loading && Platform.OS !== 'web' && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={c.primary} />
                        <Text style={[styles.loadingText, { color: c.text }]}>Loading payment page...</Text>
                    </View>
                )}

                {Platform.OS === 'web' ? (
                    <View style={styles.webContainer}>
                        <Text style={[styles.webText, { color: c.text }]}>
                            Complete your payment securely in a new browser tab.
                        </Text>
                        <TouchableOpacity
                            style={[styles.webButton, { backgroundColor: c.primary }]}
                            onPress={() => {
                                window.open(paymentUrl, '_blank');
                                // In a real scenario, we'd wait for a callback or deep link.
                                // For this POC/Web version, we might assume user closes modal manually or we poll.
                                // But effectively getting the transaction ID back is hard without a backend callback pushing to frontend via socket.
                                // For now, we will just open it.
                            }}
                        >
                            <Text style={styles.webButtonText}>Open Payment Page</Text>
                        </TouchableOpacity>
                        <Text style={[styles.webSubText, { color: c.subtext }]}>
                            After payment, return here.
                        </Text>

                        {/* Dev Test Button for Success */}
                        <TouchableOpacity
                            onPress={() => onSuccess('web-test-transaction-id')}
                            style={{ marginTop: 20 }}
                        >
                            <Text style={{ color: c.subtext, fontSize: 12 }}>(Dev: Simulate Success)</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <WebView
                        source={{ uri: paymentUrl }}
                        onNavigationStateChange={handleNavigationStateChange}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        style={styles.webview}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    backBtn: {
        padding: 8,
        width: 40,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    webview: {
        flex: 1,
    },
    webContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    webText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    webButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 200,
        alignItems: 'center',
    },
    webButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    webSubText: {
        marginTop: 16,
        fontSize: 14,
    }
});

export default PaymentWebView;
