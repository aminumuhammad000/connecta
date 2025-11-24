import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';

const ProposalDetailScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            {/* Top App Bar */}
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Proposal Details</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialIcons name="more-vert" size={22} color={c.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    {/* Status Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <View style={[styles.statusBadge, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                            <Text style={[styles.statusText, { color: '#F59E0B' }]}>Pending</Text>
                        </View>
                        <Text style={{ color: c.subtext, fontSize: 12 }}>Submitted on Oct 26, 2024</Text>
                    </View>

                    {/* Job Title */}
                    <Text style={[styles.title, { color: c.text }]}>UI/UX Designer for Mobile App</Text>

                    {/* Client Info */}
                    <View style={[styles.clientCard, { borderColor: c.border, backgroundColor: c.card }]}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQuTpi8W0GMXLNYIGw2ZoGXa07wgvbTBZNSK0mijj-45lyvzpyzjkfddIq7Fl0amYxo3MjGAbO_JDTxRidyV-EivrF42jj79Rdv21Nk7z8zdvbG9lYZpH6LB6McTPNXJDOT0nUBC8uXj3DrZ5757YV9cMe9_EPNa2ONasmmtCdXmRBbCW_qQu04cjzghMg7k_C-jAv-HRSzJBVb9fEFrDTjl9b7sCe0zptaj8_pi_FEkhiorrI0DU2DCi8W9nwlIuVp3-l5S8hyFk' }}
                            style={styles.avatar}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.clientName, { color: c.text }]}>Laura Williams</Text>
                            <Text style={{ color: c.subtext, fontSize: 11 }}>San Francisco, CA</Text>
                            <Text style={{ color: c.subtext, fontSize: 10, marginTop: 4 }}>12 Jobs Posted • Member Since 2023</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                    </View>

                    {/* Proposal Details */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Your Proposal</Text>

                        {/* Budget & Timeline */}
                        <View style={[styles.infoGrid, { borderTopColor: c.border, borderBottomColor: c.border }]}>
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Your Bid</Text>
                                <Text style={[styles.infoValue, { color: c.text }]}>$3,500</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: c.subtext }]}>Timeline</Text>
                                <Text style={[styles.infoValue, { color: c.text }]}>2 weeks</Text>
                            </View>
                        </View>

                        {/* Cover Letter */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Cover Letter</Text>
                            <Text style={{ color: c.subtext, lineHeight: 20, fontSize: 13, marginTop: 8 }}>
                                Hello! I'm excited to apply for this UI/UX Designer position. With over 5 years of experience in mobile app design, I've successfully delivered numerous projects for startups and established companies.
                                {'\n\n'}
                                I specialize in creating intuitive, user-centered designs that not only look great but also provide excellent user experiences. My approach involves thorough user research, wireframing, prototyping, and iterative testing to ensure the final product meets both user needs and business goals.
                                {'\n\n'}
                                I'm confident I can deliver high-quality designs within your timeline. I look forward to discussing this project further!
                            </Text>
                        </View>

                        {/* Attachments */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={[styles.sectionTitle, { color: c.text }]}>Attachments</Text>
                            <View style={{ gap: 8, marginTop: 8 }}>
                                <View style={[styles.attachment, { borderColor: c.border }]}>
                                    <MaterialIcons name="description" size={20} color={c.primary} />
                                    <Text style={[styles.attachmentLabel, { color: c.text }]}>Portfolio_2024.pdf</Text>
                                    <MaterialIcons name="download" size={20} color={c.subtext} />
                                </View>
                                <View style={[styles.attachment, { borderColor: c.border }]}>
                                    <MaterialIcons name="image" size={20} color={c.primary} />
                                    <Text style={[styles.attachmentLabel, { color: c.text }]}>Sample_Designs.png</Text>
                                    <MaterialIcons name="download" size={20} color={c.subtext} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed CTA */}
            <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
                <TouchableOpacity style={[styles.secondaryBtn, { borderColor: c.border }]}>
                    <Text style={[styles.secondaryBtnText, { color: c.text }]}>Edit Proposal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: c.primary }]}>
                    <Text style={styles.primaryBtnText}>Message Client</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    appBarTitle: { fontSize: 16, fontWeight: '600' },

    statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },

    title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2, marginBottom: 16 },

    clientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    clientName: { fontSize: 14, fontWeight: '600' },

    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

    infoGrid: {
        marginTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: { width: '50%', paddingVertical: 14 },
    infoLabel: { fontSize: 11, fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },

    attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    attachmentLabel: { flex: 1, fontSize: 13, fontWeight: '500' },

    ctaBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        gap: 12,
    },
    primaryBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    secondaryBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    secondaryBtnText: { fontSize: 15, fontWeight: '600' },
});

export default ProposalDetailScreen;
