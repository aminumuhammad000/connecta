import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }: any) {
    const c = useThemeColors();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: c.card }]}
                >
                    <Ionicons name="chevron-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>About Connecta</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo copy.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.appName, { color: c.text }]}>Connecta</Text>
                    <Text style={[styles.version, { color: c.subtext }]}>Version 1.0.0</Text>
                </View>

                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>Our Mission</Text>
                    <Text style={[styles.cardText, { color: c.subtext }]}>
                        Connecta is designed to bridge the gap between world-class talent and visionary clients.
                        We believe in empowering freelancers to build sustainable careers while helping businesses
                        find the perfect expertise to grow.
                    </Text>
                </View>

                <View style={styles.featureGrid}>
                    <View style={[styles.featureItem, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#3B82F620' }]}>
                            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
                        </View>
                        <Text style={[styles.featureTitle, { color: c.text }]}>Secure</Text>
                        <Text style={[styles.featureDesc, { color: c.subtext }]}>Safe payments and verified profiles.</Text>
                    </View>

                    <View style={[styles.featureItem, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                            <Ionicons name="speedometer" size={24} color="#10B981" />
                        </View>
                        <Text style={[styles.featureTitle, { color: c.text }]}>Fast</Text>
                        <Text style={[styles.featureDesc, { color: c.subtext }]}>Instant matching and real-time chat.</Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>Why Connecta?</Text>
                    <View style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                        <Text style={[styles.bulletText, { color: c.subtext }]}>Curated high-quality job listings</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                        <Text style={[styles.bulletText, { color: c.subtext }]}>Advanced AI-powered matching</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                        <Text style={[styles.bulletText, { color: c.subtext }]}>Low service fees for freelancers</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: c.subtext }]}>© 2026 Connecta Technologies</Text>
                    <Text style={[styles.footerText, { color: c.subtext }]}>Made with ❤️ for the future of work</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logoImage: {
        width: 140,
        height: 140,
        borderRadius: 30,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        marginTop: 16,
        letterSpacing: -0.5,
    },
    version: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        opacity: 0.6,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    featureGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    featureItem: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    bulletText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.5,
    },
});
