import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
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
            <View style={[styles.container, { backgroundColor: c.background }]}>
                <View style={[styles.header, { borderBottomColor: c.border, paddingTop: Platform.OS === 'ios' ? 50 : 16 }]}>
                    <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Secure Payment</Text>
                    <View style={{ width: 40 }} /> {/* Spacer to center title */}
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={c.primary} />
                        <Text style={[styles.loadingText, { color: c.text }]}>Loading payment page...</Text>
                    </View>
                )}

                <WebView
                    source={{ uri: paymentUrl }}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    style={styles.webview}
                />
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
});

export default PaymentWebView;
