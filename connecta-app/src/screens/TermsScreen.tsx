import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
    const c = useThemeColors();
    const navigation = useNavigation();

    const Section = ({ title, content }: { title: string, content: string }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
            <Text style={[styles.sectionText, { color: c.subtext }]}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.introContainer}>
                    <Ionicons name="shield-checkmark" size={64} color="#FF7F50" style={styles.introIcon} />
                    <Text style={[styles.lastUpdated, { color: c.subtext }]}>Last Updated: January 24, 2026</Text>
                    <Text style={[styles.introText, { color: c.text }]}>
                        Welcome to Connecta. Please read these Terms and Conditions carefully before using our platform. By accessing or using Connecta, you agree to be bound by these terms.
                    </Text>
                </View>

                <Section
                    title="1. Acceptance of Terms"
                    content="By creating an account on Connecta, whether as a Client or a Freelancer, you agree to comply with and be legally bound by the terms and conditions of these Terms of Service."
                />

                <Section
                    title="2. User Accounts"
                    content="You must be at least 18 years old to use this platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
                />

                <Section
                    title="3. Platform Services"
                    content="Connecta provides a marketplace where Clients and Freelancers can find each other, communicate, and manage projects. Connecta is not a party to the contracts between Users but provides the infrastructure to facilitate these engagements."
                />

                <Section
                    title="4. Payments & Fees"
                    content="Clients agree to pay Freelancers for work performed. Connecta may charge service fees for using the platform. All financial transactions must be conducted through the Connecta payment system to ensure security and dispute protection."
                />

                <Section
                    title="5. Intellectual Property"
                    content="Unless otherwise agreed in a specific contract, work delivered by a Freelancer to a Client becomes the intellectual property of the Client upon full payment. Connecta retains all rights to the platform's software, design, and trademarks."
                />

                <Section
                    title="6. User Conduct"
                    content="Users agree not to bypass the platform for payments, post fraudulent content, or harass other users. Any violation of our community standards may lead to immediate account suspension."
                />

                <Section
                    title="7. Dispute Resolution"
                    content="In the event of a dispute between a Client and a Freelancer, Connecta provides a mediation service. Users agree to participate in this process in good faith before seeking external legal remedies."
                />

                <Section
                    title="8. Limitation of Liability"
                    content="Connecta is not liable for any damages resulting from your use of the platform or the conduct of other users. We provide the platform 'as is' without warranties of any kind."
                />

                <Section
                    title="9. Termination"
                    content="Connecta reserves the right to terminate or suspend your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform."
                />

                <Section
                    title="10. Contact Us"
                    content="If you have any questions about these Terms, please contact our support team through the Help & Support section in the app."
                />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: c.subtext }]}>
                        © 2026 Connecta Inc. All rights reserved.
                    </Text>
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
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    container: {
        padding: 24,
    },
    introContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    introIcon: {
        marginBottom: 16,
    },
    lastUpdated: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    introText: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        fontWeight: '500',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        marginTop: 20,
        paddingTop: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
