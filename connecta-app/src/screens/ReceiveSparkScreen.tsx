import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useInAppAlert } from '../components/InAppAlert';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ReceiveSparkScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { showAlert } = useInAppAlert();
    const { user } = useAuth();

    const qrRef = useRef<any>();

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        showAlert({ title: 'Copied', message: `${label} copied to clipboard`, type: 'success' });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const shareDetails = async () => {
        try {
            await Share.share({
                message: `Send me Sparks on Connecta!\nEmail: ${user?.email}\nUser ID: ${user?._id}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const qrValue = JSON.stringify({
        type: 'connecta_spark_transfer',
        email: user?.email,
        id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <LinearGradient
                colors={[c.primary + '10', 'transparent']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Receive Sparks</Text>
                <TouchableOpacity onPress={shareDetails} style={styles.shareBtnTop}>
                    <Ionicons name="share-outline" size={22} color={c.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.sparkIconCtx}>
                    <MaterialIcons name="bolt" size={40} color="#FBBF24" />
                </View>

                <Text style={[styles.title, { color: c.text }]}>My Payment QR</Text>
                <Text style={[styles.sub, { color: c.subtext }]}>
                    Show this QR code to the sender or share your details below to receive sparks instantly.
                </Text>

                <View style={[styles.qrContainer, { backgroundColor: '#fff', borderColor: c.border }]}>
                    <QRCode
                        value={qrValue}
                        size={220}
                        color="#000"
                        backgroundColor="#fff"
                        logo={require('../../assets/logo.png')}
                        logoSize={50}
                        logoBackgroundColor='transparent'
                        getRef={(c) => (qrRef.current = c)}
                    />
                </View>

                <View style={styles.detailsList}>
                    <TouchableOpacity
                        style={[styles.detailItem, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => copyToClipboard(user?.email || '', 'Email')}
                    >
                        <View style={styles.detailIcon}>
                            <MaterialIcons name="email" size={20} color={c.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.detailLabel, { color: c.subtext }]}>Your Email</Text>
                            <Text style={[styles.detailValue, { color: c.text }]}>{user?.email}</Text>
                        </View>
                        <MaterialIcons name="content-copy" size={18} color={c.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.detailItem, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => copyToClipboard(user?._id || '', 'Account ID')}
                    >
                        <View style={styles.detailIcon}>
                            <MaterialIcons name="account-circle" size={20} color={c.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.detailLabel, { color: c.subtext }]}>Account ID</Text>
                            <Text style={[styles.detailValue, { color: c.text }]}>{user?._id}</Text>
                        </View>
                        <MaterialIcons name="content-copy" size={18} color={c.subtext} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.mainShareBtn, { backgroundColor: c.primary }]}
                    onPress={shareDetails}
                >
                    <MaterialIcons name="share" size={20} color="#fff" />
                    <Text style={styles.mainShareBtnText}>Share My Details</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={16} color={c.subtext} />
                    <Text style={[styles.infoText, { color: c.subtext }]}>
                        Sparks are used for premium AI services and boosting your profile on Connecta.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    shareBtnTop: { padding: 8 },
    content: { alignItems: 'center', padding: 24, paddingBottom: 40 },
    sparkIconCtx: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(251, 191, 36, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    sub: { fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22, opacity: 0.8 },
    qrContainer: {
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginBottom: 40,
    },
    detailsList: { width: '100%', gap: 12, marginBottom: 32 },
    detailItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
    detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
    detailLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailValue: { fontSize: 15, fontWeight: '700', marginTop: 1 },
    mainShareBtn: { flexDirection: 'row', height: 56, width: '100%', borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4 },
    mainShareBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 40, paddingHorizontal: 20 },
    infoText: { fontSize: 12, textAlign: 'center', lineHeight: 18 }
});

export default ReceiveSparkScreen;
