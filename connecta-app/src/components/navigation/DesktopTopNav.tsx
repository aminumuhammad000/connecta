import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import { useThemeColors } from '../../theme/theme';
import Avatar from '../Avatar';
import { useAuth } from '../../context/AuthContext';

const DesktopTopNav = () => {
    const c = useThemeColors();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const isClient = user?.userType === 'client';

    // Get the current route name to highlight the active tab
    const activeRouteName = useNavigationState(state => {
        let route = state.routes[state.index];
        // Traverse nested navigators to find the active leaf route
        while (route.state && route.state.index !== undefined) {
            route = route.state.routes[route.state.index];
        }
        return route.name;
    });

    const freelancerNavItems = [
        { label: 'Home', icon: 'home', route: 'Home' },
        { label: 'Gigs', icon: 'briefcase', route: 'Gigs' },
        { label: 'Proposals', icon: 'document-text', route: 'Proposals' },
        { label: 'Messages', icon: 'chatbubble-ellipses', route: 'Messages' },
        { label: 'Profile', icon: 'person', route: 'Profile' },
    ];

    const clientNavItems = [
        { label: 'Dashboard', icon: 'home', route: 'Home' },
        { label: 'My Jobs', icon: 'briefcase', route: 'Jobs' },
        { label: 'Projects', icon: 'folder-open', route: 'Projects' },
        { label: 'Messages', icon: 'chatbubble-ellipses', route: 'Messages' },
        { label: 'Profile', icon: 'person', route: 'Profile' },
    ];

    const navItems = isClient ? clientNavItems : freelancerNavItems;

    const handleNav = (route: string) => {
        if (isClient) {
            navigation.navigate('ClientMain', {
                screen: 'ClientTabs',
                params: { screen: route }
            });
        } else {
            navigation.navigate('FreelancerMain', {
                screen: 'FreelancerTabs',
                params: { screen: route }
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: c.card, borderBottomColor: c.border }]}>
            <View style={styles.contentContainer}>
                {/* Left: Logo & Search */}
                <View style={styles.leftSection}>
                    <Image source={require('../../../assets/logo.png')} style={styles.logo} />

                    <View style={[styles.searchBar, { backgroundColor: c.background }]}>
                        <Ionicons name="search" size={18} color={c.subtext} style={{ marginLeft: 12 }} />
                        <TextInput
                            placeholder={isClient ? "Search freelancers..." : "Search jobs, people..."}
                            placeholderTextColor={c.subtext}
                            style={[styles.searchInput, { color: c.text }]}
                        />
                    </View>
                </View>

                {/* Right: Navigation */}
                <View style={styles.navSection}>
                    {navItems.map((item, index) => {
                        const isActive = activeRouteName === item.route;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.navItem,
                                    isActive && { borderBottomColor: c.primary }
                                ]}
                                onPress={() => handleNav(item.route)}
                            >
                                <View style={styles.iconWrapper}>
                                    <Ionicons
                                        name={isActive ? item.icon as any : `${item.icon}-outline` as any}
                                        size={22}
                                        color={isActive ? c.primary : c.subtext}
                                    />
                                    {item.label === 'Messages' && (
                                        <View style={[styles.badge, { backgroundColor: c.primary, borderColor: c.card }]}>
                                            <Text style={styles.badgeText}>2</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.navLabel,
                                    { color: isActive ? c.primary : c.subtext, fontWeight: isActive ? '600' : '500' }
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* User Profile Menu */}
                    <View style={[styles.divider, { backgroundColor: c.border }]} />

                    <TouchableOpacity
                        style={styles.profileItem}
                        onPress={() => handleNav('Profile')}
                    >
                        <Avatar
                            uri={(user as any)?.profilePicture || (user as any)?.profileImage}
                            name={user?.firstName}
                            size={32}
                        />
                        <View style={styles.profileMeta}>
                            <Text style={[styles.navLabel, { color: c.text }]}>Me</Text>
                            <Ionicons name="caret-down-outline" size={10} color={c.subtext} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 64,
        width: '100%',
        borderBottomWidth: 1,
        justifyContent: 'center',
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        elevation: 2, // native shadow
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logo: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 20,
        width: 280,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        height: '100%',
        // @ts-ignore - Web only prop
        outlineStyle: 'none',
    },
    navSection: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        gap: 28,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
        paddingHorizontal: 4,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
        gap: 4,
        paddingTop: 4,
    },
    iconWrapper: {
        position: 'relative',
    },
    navLabel: {
        fontSize: 11,
    },
    divider: {
        width: 1,
        height: 32,
        marginHorizontal: 8,
    },
    profileItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    profileMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '800',
    }
});

export default DesktopTopNav;
