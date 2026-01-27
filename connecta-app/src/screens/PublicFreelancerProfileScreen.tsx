import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { useNavigation, useRoute } from '@react-navigation/native';

const PublicFreelancerProfileScreen: React.FC = () => {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || {};

    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadProfile();
        }
    }, [id]);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await profileService.getProfileByUserId(id);
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHire = () => {
        navigation.navigate('Auth', { screen: 'Signup' });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
                <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={22} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: c.text }]}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Text style={{ color: c.subtext, fontSize: 16 }}>Freelancer not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={[styles.appBar, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
                    <MaterialIcons name="arrow-back" size={22} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: c.text }]}>Freelancer Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
                {/* Profile Header */}
                <View style={[styles.sectionPad, profile?.isPremium && { backgroundColor: c.isDark ? '#3D2800' : '#FFFBEB', paddingBottom: 24, paddingTop: 20 }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.avatarContainer, profile?.isPremium && styles.premiumBorder]}>
                                <Image source={{ uri: profile?.profilePicture || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` }} style={styles.avatar} />
                                {profile?.isPremium && (
                                    <View style={styles.premiumIconBadge}>
                                        <MaterialIcons name="workspace-premium" size={14} color="#FFF" />
                                    </View>
                                )}
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.name, { color: c.text }]}>{profile?.firstName} {profile?.lastName}</Text>
                                    {profile?.isVerified && (
                                        <MaterialIcons name="verified" size={20} color="#F59E0B" style={{ marginLeft: 4 }} />
                                    )}
                                </View>
                                {profile?.isPremium && (
                                    <View style={styles.premiumBadge}>
                                        <MaterialIcons name="star" size={12} color="#FFF" />
                                        <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
                                    </View>
                                )}
                                <Text style={[styles.role, { color: c.subtext }]}>{profile?.profession || 'Freelancer'}</Text>
                                <View style={styles.verifiedRow}>
                                    <MaterialIcons name="location-on" size={14} color={c.subtext} />
                                    <Text style={[styles.location, { color: c.subtext }]}>{profile?.country || 'Remote'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reputation & Badges */}
                <View style={[styles.sectionPad, { marginTop: 12 }]}>
                    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 20 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={{ color: c.subtext, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Job Success</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: profile?.jobSuccessScore >= 90 ? '#DCFCE7' : '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="verified-user" size={28} color={profile?.jobSuccessScore >= 90 ? '#16A34A' : c.subtext} />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={{ fontSize: 28, fontWeight: '800', color: c.text }}>{profile?.jobSuccessScore || 100}%</Text>
                                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>Client Satisfaction</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: c.subtext, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rating</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#B45309', marginRight: 4 }}>{profile?.rating || '5.0'}</Text>
                                    <MaterialIcons name="star" size={20} color="#F59E0B" />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* About */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
                    <Text style={[styles.about, { color: c.subtext }]}>{profile?.bio || 'No bio added yet.'}</Text>
                </View>

                {/* Skills */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Skills</Text>
                    <View style={styles.skillsRow}>
                        {profile?.skills?.length > 0 ? (
                            profile.skills.map((s: string) => (
                                <View key={s} style={[styles.skillChip, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>
                                    <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700' }}>{s}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: c.subtext }}>No skills listed.</Text>
                        )}
                    </View>
                </View>

                {/* Portfolio */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Portfolio Preview</Text>
                    {profile?.portfolio?.length > 0 ? (
                        <View style={{ gap: 16 }}>
                            {profile.portfolio.slice(0, 2).map((item: any, i: number) => (
                                <View key={i} style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
                                    <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300' }} style={{ width: '100%', height: 160 }} />
                                    <View style={{ padding: 12 }}>
                                        <Text style={[styles.cardTitle, { color: c.text }]}>{item.title || 'Untitled'}</Text>
                                        <Text style={{ color: c.subtext, fontSize: 12 }}>{item.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No portfolio items publicly visible.</Text>
                    )}
                </View>

                {/* Reviews */}
                <View style={{ padding: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Reviews</Text>
                    {profile?.reviews?.length > 0 ? (
                        <View style={{ gap: 12 }}>
                            {profile.reviews.map((review: any, index: number) => (
                                <View key={index} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontWeight: '600', color: c.text }}>{review.reviewerId?.firstName || 'Client'}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name="star" size={14} color="#F59E0B" />
                                            <Text style={{ marginLeft: 4, fontWeight: '600', color: c.text }}>{review.rating}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: c.subtext, fontSize: 13, lineHeight: 18 }}>{review.comment}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: c.subtext }}>No reviews yet.</Text>
                    )}
                </View>

                {/* Login CTA */}
                <View style={{ margin: 16, padding: 24, backgroundColor: c.isDark ? '#2C2C2E' : '#ebf8ff', borderRadius: 16, alignItems: 'center', gap: 12 }}>
                    <MaterialIcons name="lock-outline" size={32} color={c.primary} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, textAlign: 'center' }}>
                        Hire {profile.firstName} for your project
                    </Text>
                    <Text style={{ fontSize: 14, color: c.subtext, textAlign: 'center' }}>
                        Sign up to message, interview, and hire top talent securely.
                    </Text>
                </View>

            </ScrollView>

            {/* Fixed CTA */}
            <View style={[styles.ctaBar, { borderTopColor: c.border, paddingBottom: 8 + insets.bottom, backgroundColor: c.background }]}>
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: c.primary }]}
                    onPress={handleHire}
                >
                    <Text style={styles.applyText}>Login to Hire</Text>
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
    sectionPad: { paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ddd' },
    name: { fontSize: 20, fontWeight: '800' },
    role: { fontSize: 14, marginTop: 2, fontWeight: '500' },
    location: { fontSize: 13, marginLeft: 4 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },

    avatarContainer: { position: 'relative' },
    premiumBorder: { borderWidth: 3, borderColor: '#F59E0B', borderRadius: 999, padding: 2 },
    premiumIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F59E0B', borderRadius: 999, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
    premiumText: { color: '#FFF', fontSize: 10, fontWeight: '700', marginLeft: 2 },

    card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    about: { fontSize: 14, lineHeight: 22 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 13, fontWeight: '700' },
    cardTitle: { fontSize: 16, fontWeight: '700' },

    ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 8 },
    applyBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    applyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default PublicFreelancerProfileScreen;
