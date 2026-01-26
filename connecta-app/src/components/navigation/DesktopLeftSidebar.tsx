import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyProfile } from '../../services/profileService';
import { Profile } from '../../types';

const DesktopLeftSidebar = ({ navigation }: any) => {
    const c = useThemeColors();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const isClient = user?.userType === 'client';

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            if (!user?._id) return;
            try {
                // If client, we might use a different service or same. Assuming getMyProfile works for both or returns user.
                const data = await getMyProfile();
                if (isMounted) setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile in sidebar:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { isMounted = false; };
    }, [user?._id]);

    const displayTitle = isClient
        ? ((user as any)?.companyName || 'Client Account')
        : (profile?.jobTitle || (user as any)?.profession || 'Freelancer');

    const location = profile?.location || (user as any)?.location || 'Global';

    // Stats Logic
    const stats = isClient ? [
        { label: 'Active Jobs', value: (user as any)?.activeJobsCount || '0' },
        { label: 'Total Hires', value: (user as any)?.totalHires || '0' },
    ] : [
        { label: 'Profile views', value: (user as any)?.views || 142 },
        { label: 'Job Success', value: `${profile?.rating ? Math.round((profile.rating / 5) * 100) : 100}%` },
    ];

    return (
        <View style={styles.container}>
            {/* Identity Card */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                {/* Cover Banner with Gradient */}
                <View style={styles.bannerContainer}>
                    <LinearGradient
                        colors={isClient ? [c.primary, '#2563EB'] : [c.primary, '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    />
                </View>

                {/* Avatar */}
                <View style={[styles.avatarContainer, { backgroundColor: c.card, borderColor: c.card }]}>
                    <Image
                        source={{ uri: (user as any)?.profilePicture || profile?.avatar || (user as any)?.profileImage || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={[styles.name, { color: c.text }]}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={[styles.headline, { color: c.subtext }]}>
                        {displayTitle}
                    </Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={12} color={c.subtext} />
                        <Text style={[styles.location, { color: c.subtext }]}>{location}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { borderTopColor: c.border }]}>
                    {stats.map((stat, i) => (
                        <TouchableOpacity key={i} style={styles.statItem}>
                            <View>
                                <Text style={[styles.statLabel, { color: c.subtext }]}>{stat.label}</Text>
                            </View>
                            <Text style={[styles.statValue, { color: c.primary }]}>{stat.value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Premium Upsell (Freelancer Only usually) */}
                {!isClient && !user?.isPremium && (
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

                {/* My Items Action */}
                <TouchableOpacity
                    style={[styles.myItemBtn, { borderTopColor: c.border }]}
                    onPress={() => {
                        if (isClient) {
                            navigation.navigate('PostJob');
                        } else {
                            navigation.navigate('FreelancerMain', { screen: 'FreelancerProjects' });
                        }
                    }}
                >
                    <Ionicons name={isClient ? "add-circle-outline" : "briefcase-outline"} size={18} color={c.subtext} />
                    <Text style={[styles.myItemText, { color: c.text }]}>
                        {isClient ? "Post a New Job" : "My Jobs"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Shortcuts Card */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, paddingVertical: 8 }]}>
                {!isClient ? (
                    <>
                        <TouchableOpacity
                            style={styles.shortcutItem}
                            onPress={() => navigation.navigate('FreelancerMain', { screen: 'FreelancerTabs', params: { screen: 'Proposals' } })}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: c.primary + '15' }]}>
                                <Ionicons name="document-text" size={16} color={c.primary} />
                            </View>
                            <Text style={[styles.shortcutText, { color: c.text }]}>Proposals</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shortcutItem}
                            onPress={() => navigation.navigate('FreelancerMain', { screen: 'Wallet' })}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#F59E0B15' }]}>
                                <Ionicons name="wallet" size={16} color="#F59E0B" />
                            </View>
                            <Text style={[styles.shortcutText, { color: c.text }]}>Wallet</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.shortcutItem}
                            onPress={() => navigation.navigate('ClientPayments')}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#10B98115' }]}>
                                <Ionicons name="card" size={16} color="#10B981" />
                            </View>
                            <Text style={[styles.shortcutText, { color: c.text }]}>Billing & Payments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.shortcutItem}
                            onPress={() => navigation.navigate('ClientEditProfile')}
                        >
                            <View style={[styles.shortcutIcon, { backgroundColor: '#3B82F615' }]}>
                                <Ionicons name="business" size={16} color="#3B82F6" />
                            </View>
                            <Text style={[styles.shortcutText, { color: c.text }]}>Company Profile</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity
                    style={styles.shortcutItem}
                    // For client, navigating to settings or collabo is fine. Assuming Collabo is shared.
                    onPress={() => {
                        if (isClient) {
                            // Navigate to Projects tab where Collabo projects are listed
                            navigation.navigate('ClientTabs', { screen: 'Projects' });
                        } else {
                            navigation.navigate('FreelancerMain', { screen: 'FreelancerProjects', params: { tab: 'collabo' } });
                        }
                    }}
                >
                    <View style={[styles.shortcutIcon, { backgroundColor: '#6366F115' }]}>
                        <Ionicons name="people" size={16} color="#6366F1" />
                    </View>
                    <Text style={[styles.shortcutText, { color: c.text }]}>Collabo Team</Text>
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.shortcutItem}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <View style={[styles.shortcutIcon, { backgroundColor: '#8B5CF615' }]}>
                        <Ionicons name="settings" size={16} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.shortcutText, { color: c.text }]}>Settings</Text>
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
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    location: {
        fontSize: 12,
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
    },
    shortcutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 12,
    },
    shortcutIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortcutText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    newBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    newBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '700',
    }
});

export default DesktopLeftSidebar;
