import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Easing } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Avatar';
import { LinearGradient } from 'expo-linear-gradient';

const NavItem = ({ label, icon, routeName, isActive, onPress, colorSet }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Simple hover effect simulation
    const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.timing(activeAnim, {
            toValue: isActive ? 1 : 0,
            duration: 300,
            useNativeDriver: false, // Color interpolation needs false
            easing: Easing.out(Easing.ease),
        }).start();
    }, [isActive]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const bgColor = activeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', colorSet.primary + '15'] // 15% opacity primary
    });

    const textColor = activeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colorSet.text, colorSet.primary]
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            style={{ marginBottom: 4 }}
        >
            <Animated.View style={[styles.navItem, { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}>
                {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: colorSet.primary }]} />
                )}
                <Feather name={icon} size={20} color={isActive ? colorSet.primary : colorSet.subtext} style={{ opacity: isActive ? 1 : 0.7 }} />
                <Animated.Text style={[styles.navLabel, { color: textColor, fontWeight: isActive ? '700' : '500' }]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const DesktopSideNav = () => {
    const c = useThemeColors();
    const navigation = useNavigation<any>();

    // We'll track active tab locally for visual feedback since we are outside the tab navigator
    // In a real app, we might sync this with navigation state listeners
    const [activeTab, setActiveTab] = useState('Home');
    const { user, logout } = useAuth();

    const handleNav = (route: string) => {
        setActiveTab(route);
        navigation.navigate('FreelancerTabs', { screen: route });
    };

    const navItems = [
        { label: 'Dashboard', icon: 'grid', route: 'Home' },
        { label: 'Find Work', icon: 'search', route: 'Gigs' },
        { label: 'My Proposals', icon: 'file-text', route: 'Proposals' },
        { label: 'Messages', icon: 'message-square', route: 'Messages' },
        { label: 'My Profile', icon: 'user', route: 'Profile' },
    ];

    const toolsItems = [
        { label: 'My Projects', icon: 'briefcase', route: 'FreelancerProjects' },
        { label: 'Wallet', icon: 'credit-card', route: 'Wallet' },
        { label: 'Settings', icon: 'settings', route: 'Settings' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: '#fff', borderRightColor: c.border }]}>
            {/* Logo Area */}
            <View style={styles.logoContainer}>
                <Image source={require('../../../assets/logo.png')} style={{ width: 130, height: 36, resizeMode: 'contain' }} />
                <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                </View>
            </View>

            {/* User Access Card */}
            <LinearGradient
                colors={c.isDark ? ['#2D3748', '#1A202C'] : ['#F7FAFC', '#EDF2F7']}
                style={[styles.userCard, { borderColor: c.border }]}
            >
                <View style={styles.userInfo}>
                    <Avatar
                        uri={(user as any)?.profilePicture}
                        name={user?.firstName}
                        size={42}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>{user?.firstName} {user?.lastName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#48BB78' }} />
                            <Text style={[styles.userRole, { color: c.subtext }]} numberOfLines={1}>Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.miniBtn}>
                        <Feather name="bell" size={16} color={c.subtext} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Navigation Links */}
            <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.sectionLabel}>MAIN MENU</Text>
                <View style={styles.navGroup}>
                    {navItems.map((item, index) => (
                        <NavItem
                            key={index}
                            {...item}
                            isActive={activeTab === item.route}
                            onPress={() => handleNav(item.route)}
                            colorSet={c}
                        />
                    ))}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>TOOLS & FINANCE</Text>
                <View style={styles.navGroup}>
                    {toolsItems.map((item, index) => (
                        <NavItem
                            key={index}
                            {...item}
                            isActive={false} // These navigate away
                            onPress={() => navigation.navigate(item.route)}
                            colorSet={c}
                            routeName={item.route}
                        />
                    ))}
                </View>

                {/* Promo Card */}
                <LinearGradient
                    colors={['#FD6730', '#FF8F6B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.promoCard}
                >
                    <View style={styles.promoIcon}>
                        <Feather name="zap" size={20} color="#FFF" />
                    </View>
                    <Text style={styles.promoTitle}>Upgrade to Plus</Text>
                    <Text style={styles.promoDesc}>Get more connects and see who viewed your profile.</Text>
                    <TouchableOpacity style={styles.promoBtn}>
                        <Text style={styles.promoBtnText}>View Plans</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>

            {/* Footer / Logout */}
            <View style={[styles.footer, { borderTopColor: c.border }]}>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <View style={[styles.logoutIcon, { backgroundColor: '#FEF2F2' }]}>
                        <Feather name="log-out" size={18} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 280,
        height: '100%',
        borderRightWidth: 1,
        paddingVertical: 24,
        paddingHorizontal: 20,
        display: 'flex',
        flexDirection: 'column',
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        zIndex: 50,
        elevation: 5,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 8,
        gap: 8,
    },
    proBadge: {
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    proText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#3182CE',
    },
    userCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userName: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 2,
    },
    userRole: {
        fontSize: 12,
    },
    miniBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navScroll: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#A0AEC0',
        marginBottom: 12,
        paddingHorizontal: 12,
        letterSpacing: 1,
    },
    navGroup: {
        gap: 6,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
        overflow: 'hidden',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    navLabel: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#EDF2F7',
        marginVertical: 24,
        marginHorizontal: 8,
    },
    promoCard: {
        borderRadius: 16,
        padding: 16,
        marginTop: 32,
        alignItems: 'flex-start',
    },
    promoIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    promoTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    promoDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
        lineHeight: 18,
    },
    promoBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    promoBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FD6730',
    },
    footer: {
        paddingTop: 20,
        borderTopWidth: 1,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 12,
        // hover effect could be added here too
    },
    logoutIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    }
});

export default DesktopSideNav;
