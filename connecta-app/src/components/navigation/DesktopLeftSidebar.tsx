import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DesktopLeftSidebar = ({ navigation }: any) => {
    const c = useThemeColors();
    const { user } = useAuth();

    // Ensure we have a default navigation object if none provided (though it usually is)
    // or handle internal navigation if needed.

    return (
        <View style={styles.container}>
            {/* Identity Card */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                {/* Cover Banner with Gradient */}
                <View style={styles.bannerContainer}>
                    <LinearGradient
                        colors={[c.primary, '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    />
                </View>

                {/* Avatar */}
                <View style={[styles.avatarContainer, { backgroundColor: c.card, borderColor: c.card }]}>
                    <Image
                        source={{ uri: (user as any)?.profilePicture || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={[styles.name, { color: c.text }]}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={[styles.headline, { color: c.subtext }]}>
                        {(user as any)?.profession || 'Connecta Freelancer'}
                    </Text>
                    <Text style={[styles.location, { color: c.subtext }]}>{(user as any)?.location || 'Global'}</Text>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { borderTopColor: c.border }]}>
                    <TouchableOpacity style={styles.statItem}>
                        <View>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Profile views</Text>
                        </View>
                        <Text style={[styles.statValue, { color: c.primary }]}>{(user as any)?.views || 142}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem}>
                        <View>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>Job Success</Text>
                        </View>
                        <Text style={[styles.statValue, { color: c.primary }]}>{(user as any)?.jobSuccessScore || 100}%</Text>
                    </TouchableOpacity>
                </View>

                {/* Premium Upsell */}
                {!user?.isPremium && (
                    <TouchableOpacity style={[styles.premiumRow, { borderTopColor: c.border, backgroundColor: c.primary + '10' }]}>
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']}
                            style={styles.premiumIcon}
                        >
                            <Ionicons name="diamond" size={10} color="#FFF" />
                        </LinearGradient>
                        <View>
                            <Text style={[styles.premiumText, { color: c.subtext }]}>Upgrade to Pro</Text>
                            <Text style={[styles.premiumLink, { color: c.text }]}>Get 2x more leads</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* My Items */}
                <TouchableOpacity style={[styles.myItemBtn, { borderTopColor: c.border }]}>
                    <Ionicons name="bookmark" size={18} color={c.subtext} />
                    <Text style={[styles.myItemText, { color: c.text }]}>Saved Jobs</Text>
                </TouchableOpacity>
            </View>

            {/* Sticky/Recent Card */}
            <View style={[styles.card, { paddingVertical: 12, paddingHorizontal: 0, backgroundColor: c.card, borderColor: c.border }]}>
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Featured</Text>
                </View>

                {['Connecta AI', 'Collabo Teams', 'Skill Verification', 'Escrow Payments'].map((tag, idx) => (
                    <TouchableOpacity key={idx} style={styles.recentItem}>
                        <Feather name="hash" size={14} color={c.subtext} />
                        <Text style={[styles.recentText, { color: c.subtext }]} numberOfLines={1}>{tag}</Text>
                    </TouchableOpacity>
                ))}

                <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                    <Text style={[styles.sectionTitle, { color: c.primary }]}>My Communities</Text>
                </View>
                {['Freelance Developers', 'Connecta Official'].map((tag, idx) => (
                    <TouchableOpacity key={idx} style={styles.recentItem}>
                        <Feather name="users" size={14} color={c.subtext} />
                        <Text style={[styles.recentText, { color: c.subtext }]} numberOfLines={1}>{tag}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.discoverBtn, { borderTopColor: c.border }]}>
                    <Text style={[styles.discoverText, { color: c.subtext }]}>Discover more</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 250,
        gap: 20,
    },
    card: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
    },
    bannerContainer: {
        height: 64,
        overflow: 'hidden',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    avatarContainer: {
        height: 72,
        width: 72,
        borderRadius: 36,
        borderWidth: 3,
        alignSelf: 'center',
        marginTop: -36,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
    },
    userInfo: {
        marginTop: 12,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    headline: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    location: {
        fontSize: 12,
        marginTop: 4,
    },
    statsContainer: {
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    statSub: {
        fontSize: 11,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    premiumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    premiumIcon: {
        width: 16,
        height: 16,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    premiumText: {
        fontSize: 11,
    },
    premiumLink: {
        fontSize: 12,
        fontWeight: '700',
    },
    myItemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
    },
    myItemText: {
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    recentText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    discoverBtn: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        marginTop: 8,
    },
    discoverText: {
        fontSize: 14,
        fontWeight: '600',
    }
});

export default DesktopLeftSidebar;
