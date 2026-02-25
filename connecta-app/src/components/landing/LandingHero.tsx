import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/theme';

const { width } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';

const LandingHero = ({ isDesktop }: { isDesktop?: boolean }) => {
    const navigation = useNavigation<any>();
    const c = useThemeColors();
    const [activeTab, setActiveTab] = useState<'freelancer' | 'jobs'>('freelancer');
    const [titleIndex, setTitleIndex] = useState(0);
    const [searchText, setSearchText] = useState('');

    const handleSearch = () => {
        if (activeTab === 'jobs') {
            navigation.navigate('PublicSearch', { initialQuery: searchText });
        } else {
            navigation.navigate('PublicFreelancerSearch', { initialQuery: searchText });
        }
    };

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const orbit1Anim = useRef(new Animated.Value(0)).current;
    const orbit2Anim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    const titles = [
        "Not Just Jobs, The Right Ones.",
        "Where Talent Meets Opportunity.",
        "Your Skills. Our Universe.",
        "Stop Searching. Start Connecting.",
        "The Professional Network.",
        "Hire The Top 1%."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
            ]).start();

            setTimeout(() => {
                setTitleIndex((prev) => (prev + 1) % titles.length);
            }, 300);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Orbit Animations
        Animated.loop(
            Animated.timing(orbit1Anim, {
                toValue: 1,
                duration: 25000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        Animated.loop(
            Animated.timing(orbit2Anim, {
                toValue: 1,
                duration: 45000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        // Float Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -15, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();
    }, []);

    const spin1 = orbit1Anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const spin2 = orbit2Anim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }); // Counter-clockwise

    return (
        <View style={styles.container}>
            {/* Background Blobs (Simplified for Mobile Perf) */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            {/* Orbit Visuals (Desktop: Right Side, Mobile: Top Absolute) */}
            <View style={[styles.orbitContainer, isDesktop && styles.desktopOrbitContainer]}>

                {/* Desktop Header Buttons (Absolute Top Right of Orbit Container) */}
                {isDesktop && (
                    <View style={styles.desktopHeaderBtns}>
                        <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
                            <Text style={styles.headerLoginText}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerJoinBtn} onPress={() => navigation.navigate('Auth', { screen: 'RoleSelection' })}>
                            <Text style={styles.headerJoinText}>Join Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Center Sun/Logo */}
                <View style={styles.sun}>
                    <LinearGradient colors={['#FD6730', '#FF8F6B']} style={styles.sunGradient} />
                    <View style={styles.sunInner}>
                        <Image source={require('../../../assets/logo copy.png')} style={styles.logoIcon} />
                    </View>
                </View>

                {/* Orbit 1 */}
                <Animated.View style={[styles.orbitRing, { width: 280, height: 280, transform: [{ rotate: spin1 }] }]}>
                    <View style={[styles.planet, { top: -20, left: '50%', marginLeft: -20 }]}>
                        <Feather name="code" size={20} color="#3182CE" />
                    </View>
                </Animated.View>

                {/* Orbit 2 */}
                <Animated.View style={[styles.orbitRing, { width: 380, height: 380, borderStyle: 'dashed', borderColor: '#E2E8F0', transform: [{ rotate: spin2 }] }]}>
                    <View style={[styles.planet, { top: '50%', right: -24, marginTop: -24 }]}>
                        <MaterialCommunityIcons name="star" size={24} color="#ECC94B" />
                    </View>
                </Animated.View>

                {/* Floating Badges */}
                <Animated.View style={[styles.floatBadge, { top: 40, right: 20, transform: [{ translateY: floatAnim }] }]}>
                    <Feather name="shield" size={16} color="#48BB78" />
                    <Text style={styles.floatText}>Verified</Text>
                </Animated.View>
            </View>

            {/* Content Overlay */}
            <View style={[styles.content, isDesktop && styles.desktopContent]}>
                <View style={styles.titleContainer}>
                    <Animated.Text style={[styles.title, { opacity: fadeAnim }, isDesktop && styles.desktopTitle]}>
                        {titles[titleIndex].split(',').map((part, i) => (
                            <Text key={i} style={i === 1 ? { color: '#FD6730' } : {}}>{part}{i === 0 ? '\n' : ''}</Text>
                        ))}
                    </Animated.Text>
                </View>

                <Text style={[styles.subtitle, isDesktop && styles.desktopSubtitle]}>
                    One login, endless gigs. AI-matched projects instantly.
                </Text>

                {/* Search Box */}
                <View style={[styles.searchCard, isDesktop && styles.desktopSearchCard]}>
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'freelancer' && styles.activeTab]}
                            onPress={() => setActiveTab('freelancer')}
                        >
                            <Feather name="users" size={14} color={activeTab === 'freelancer' ? '#FD6730' : '#A0AEC0'} />
                            <Text style={[styles.tabText, activeTab === 'freelancer' && styles.activeTabText]}>Find Talent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                            onPress={() => setActiveTab('jobs')}
                        >
                            <Feather name="briefcase" size={14} color={activeTab === 'jobs' ? '#FD6730' : '#A0AEC0'} />
                            <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Browse Jobs</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <TextInput
                            placeholder={activeTab === 'freelancer' ? "Try 'React Dev'..." : "Try 'SEO Project'..."}
                            style={styles.input}
                            placeholderTextColor="#A0AEC0"
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                            <Feather name="search" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Social Proof */}
                <View style={[styles.socialProof, isDesktop && { justifyContent: 'flex-start' }]}>
                    <View style={styles.avatarRow}>
                        {[1, 2, 3].map((i) => (
                            <Image
                                key={i}
                                source={{ uri: `https://i.pravatar.cc/100?u=${i + 20}` }}
                                style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
                            />
                        ))}
                        <View style={[styles.avatar, styles.moreAvatar]}>
                            <Text style={styles.moreText}>+2k</Text>
                        </View>
                    </View>
                    <Text style={styles.ratingText}>
                        <Text style={{ color: '#FD6730', fontWeight: 'bold' }}>4.9/5</Text> rating
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        minHeight: 600,
        // Desktop support: On desktop we might want row layout for container if we move orbit to right
        // But simpler: keep container relative, move content to left, orbit to right absolute
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.6,
    },
    blob1: {
        width: 300,
        height: 300,
        backgroundColor: 'rgba(253, 103, 48, 0.1)', // Orange-50
        top: -100,
        left: -100,
    },
    blob2: {
        width: 250,
        height: 250,
        backgroundColor: 'rgba(66, 153, 225, 0.1)', // Blue-50
        top: 100,
        right: -50,
    },
    orbitContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8, // Fade it back a bit so text pops
    },
    sun: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    sunGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 70,
        opacity: 0.2,
    },
    sunInner: {
        width: 100,
        height: 100,
        backgroundColor: '#FFF',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFF5F0',
        elevation: 10,
        ...Platform.select({
            web: { boxShadow: '0 0 20px rgba(253, 103, 48, 0.3)' },
            default: {
                shadowColor: '#FD6730',
                shadowOpacity: 0.3,
                shadowRadius: 20,
            }
        }),
    },
    logoIcon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    orbitRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(253, 103, 48, 0.2)',
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    planet: {
        position: 'absolute',
        width: 40,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' },
            default: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 5,
            }
        }),
        elevation: 5,
    },
    floatBadge: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        ...Platform.select({
            web: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        }),
        elevation: 4,
        zIndex: 20,
    },
    floatText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A5568',
    },
    content: {
        paddingHorizontal: 24,
        zIndex: 30, // Above orbits
        marginTop: 240, // Push down to let orbits show a bit at top
    },
    titleContainer: {
        minHeight: 120,
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1A202C',
        lineHeight: 44,
        textAlign: 'center', // Mobile center looks better
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    searchCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: 8,
        ...Platform.select({
            web: { boxShadow: '0 10px 20px rgba(253, 103, 48, 0.1)' },
            default: {
                shadowColor: '#FD6730',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            }
        }),
        elevation: 10,
        marginBottom: 32,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#F7FAFC',
        borderRadius: 16,
        padding: 4,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#FFF',
        ...Platform.select({
            web: { boxShadow: '0 0 2px rgba(0, 0, 0, 0.05)' },
            default: {
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 2,
            }
        }),
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#A0AEC0',
    },
    activeTabText: {
        color: '#FD6730',
        fontWeight: '700',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC', // Or white if card is tinted
        borderRadius: 16,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'transparent', // Can add focus state
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2D3748',
        fontWeight: '500',
        height: 48,
    },
    searchBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#FD6730',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { boxShadow: '0 0 8px rgba(253, 103, 48, 0.4)' },
            default: {
                shadowColor: '#FD6730',
                shadowOpacity: 0.4,
                shadowRadius: 8,
            }
        }),
    },
    socialProof: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    avatarRow: {
        flexDirection: 'row',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    moreAvatar: {
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -10,
    },
    moreText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#718096',
    },
    ratingText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },
    // Desktop Styles
    desktopOrbitContainer: {
        position: 'absolute',
        left: '50%', // Start from middle
        right: 0,
        top: 0,
        bottom: 0,
        width: '50%', // Take exactly half
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
    },
    desktopContent: {
        marginTop: 60,
        width: '50%', // Take left half
        paddingRight: 60,
        height: 650, // Ensure height for vertical centering
        justifyContent: 'center',
        zIndex: 50, // Ensure on top
    },
    desktopTitle: {
        textAlign: 'left',
        fontSize: 64,
        lineHeight: 72,
    },
    desktopSubtitle: {
        textAlign: 'left',
        fontSize: 20,
        maxWidth: 500,
    },
    desktopSearchCard: {
        width: 480, // Wider search on desktop
    },
    desktopHeaderBtns: {
        position: 'absolute',
        top: 40,
        right: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        zIndex: 100,
    },
    headerLoginText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A5568',
    },
    headerJoinBtn: {
        backgroundColor: '#FD6730',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        ...Platform.select({
            web: { boxShadow: '0 0 10px rgba(253, 103, 48, 0.3)' },
            default: {
                shadowColor: '#FD6730',
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }
        }),
        elevation: 4,
    },
    headerJoinText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default LandingHero;
