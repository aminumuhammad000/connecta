import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import { useThemeColors } from '../../theme/theme';
import Avatar from '../Avatar';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import dashboardService from '../../services/dashboardService';

const DesktopTopNav = () => {
    const c = useThemeColors();
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const isClient = user?.userType === 'client';
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const { socket } = useSocket();

    React.useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                if (isClient) {
                    const stats = await dashboardService.getClientStats();
                    setUnreadCount(stats.newMessages || 0);
                } else {
                    const stats = await dashboardService.getFreelancerStats();
                    // Custom property I just added to backend
                    setUnreadCount((stats as any).newMessages || 0);
                }
            } catch (error) {
                console.error("Failed to fetch unread messages", error);
            }
        };

        fetchUnreadCount();

        if (socket) {
            const handleNewMessage = () => {
                setUnreadCount(prev => prev + 1);
            };

            // Listen for new messages to update badge in real-time
            socket.on('message:receive', handleNewMessage);

            return () => {
                socket.off('message:receive', handleNewMessage);
            };
        }
    }, [isClient, socket]);

    // Get the current route name to highlight the active tab
    const activeRouteName = useNavigationState(state => {
        let route = state.routes[state.index];
        // Traverse nested navigators to find the active leaf route
        while (route.state && route.state.index !== undefined) {
            route = route.state.routes[route.state.index] as any;
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
        if (route === 'Messages') {
            setUnreadCount(0);
        }

        const targetMain = isClient ? 'ClientMain' : 'FreelancerMain';
        const tabNavigator = isClient ? 'ClientTabs' : 'FreelancerTabs';

        if (isClient) {
            const isTab = ['Home', 'Jobs', 'Projects', 'Messages', 'Profile'].includes(route);
            if (isTab) {
                navigation.navigate(targetMain, {
                    screen: tabNavigator,
                    params: { screen: route }
                });
            } else {
                navigation.navigate(targetMain, { screen: route });
            }
        } else {
            const isTab = ['Home', 'Gigs', 'Messages', 'Profile'].includes(route);
            if (isTab) {
                navigation.navigate(targetMain, {
                    screen: tabNavigator,
                    params: { screen: route }
                });
            } else {
                navigation.navigate(targetMain, { screen: route });
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: c.card, borderBottomColor: c.border }]}>
            <View style={styles.contentContainer}>
                {/* Left: Logo & Search */}
                <View style={styles.leftSection}>
                    <Logo size={36} />

                    <View style={[styles.searchBar, { backgroundColor: c.background }]}>
                        <Ionicons name="search" size={18} color={c.subtext} style={{ marginLeft: 12 }} />
                        <TextInput
                            placeholder={isClient ? "Search freelancers..." : "Search jobs, people..."}
                            placeholderTextColor={c.subtext}
                            style={[styles.searchInput, { color: c.text } as any]}
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
                                    {item.label === 'Messages' && unreadCount > 0 && (
                                        <View style={[styles.badge, { backgroundColor: c.error, borderColor: c.card }]}>
                                            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
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

                    {/* Profile & Dropdown */}
                    <View style={{ zIndex: 200 }}>
                        <TouchableOpacity
                            style={styles.profileItem}
                            onPress={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <Avatar
                                uri={(user as any)?.profilePicture || (user as any)?.profileImage}
                                name={user?.firstName}
                                size={32}
                            />
                            <View style={styles.profileMeta}>
                                <Text style={[styles.navLabel, { color: c.text }]}>Me</Text>
                                <Ionicons name={showProfileMenu ? "caret-up-outline" : "caret-down-outline"} size={10} color={c.subtext} />
                            </View>
                        </TouchableOpacity>

                        {showProfileMenu && (
                            <View style={[styles.dropdownMenu, { backgroundColor: c.card, borderColor: c.border, shadowColor: c.text }]}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => { setShowProfileMenu(false); handleNav('Settings'); }}
                                >
                                    <Ionicons name="settings-outline" size={16} color={c.subtext} />
                                    <Text style={[styles.dropdownText, { color: c.text }]}>Settings</Text>
                                </TouchableOpacity>

                                <View style={[styles.dropdownDivider, { backgroundColor: c.border }]} />

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={async () => {
                                        setShowProfileMenu(false);
                                        try {
                                            await logout();
                                            if (Platform.OS === 'web') {
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: 'Auth', params: { screen: 'Login' } }],
                                                });
                                            } else {
                                                // Mobile fallback
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: 'Auth' }],
                                                });
                                            }
                                        } catch (e) {
                                            console.error("Logout failed", e);
                                        }
                                    }}
                                >
                                    <Ionicons name="log-out-outline" size={16} color={c.error} />
                                    <Text style={[styles.dropdownText, { color: c.error }]}>Log Out</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
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
        ...({ outlineStyle: 'none' } as any),
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
    },
    dropdownMenu: {
        position: 'absolute',
        top: 48,
        right: 0,
        width: 180,
        borderRadius: 12,
        borderWidth: 1,
        padding: 6,
        // Shadow for web
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 10,
    },
    dropdownText: {
        fontSize: 13,
        fontWeight: '500',
    },
    dropdownDivider: {
        height: 1,
        marginVertical: 4,
        marginHorizontal: 4,
    }
});

export default DesktopTopNav;
