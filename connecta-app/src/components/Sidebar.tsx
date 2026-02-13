import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    Modal,
    Platform,
    StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/theme";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface SidebarProps {
    isVisible: boolean;
    onClose: () => void;
    navigation: any;
}

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(width * 0.7, 280);

export default function Sidebar({ isVisible, onClose, navigation }: SidebarProps) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    mass: 0.8,
                    stiffness: 100,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    const handleLogout = async () => {
        onClose();
        try {
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
            });
        } catch (error) {
            console.error('[Sidebar] Logout failed:', error);
        }
    };

    const menuItems = [
        { icon: "person-outline", label: "My Profile", screen: "Profile", color: "#4F46E5" },
        { icon: "wallet-outline", label: "Wallet", screen: user?.userType === "client" ? "ClientPayments" : "Wallet", color: "#10B981" },
        user?.userType === 'client'
            ? { icon: "add-circle-outline", label: "Post a Job", screen: "PostJob", color: "#6366F1" }
            : { icon: "options-outline", label: "Job Preferences", screen: "JobPreferences", color: "#6366F1" },
        { icon: "document-text-outline", label: "Contracts", screen: user?.userType === "client" ? "Projects" : "FreelancerProjects", color: "#F59E0B" },
        { icon: "settings-outline", label: "Settings", screen: "Settings", color: "#6B7280" },
        { icon: "help-circle-outline", label: "Help & Support", screen: "HelpSupport", color: "#EC4899" },
        { icon: "shield-checkmark-outline", label: "Terms & Conditions", screen: "Terms", color: "#8B5CF6" },
        { icon: "information-circle-outline", label: "About Connecta", screen: "About", color: "#3B82F6" },
    ].filter(Boolean);

    return (
        <Modal
            transparent
            visible={isVisible}
            onRequestClose={onClose}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                {/* Blur Backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                    </Animated.View>
                </TouchableWithoutFeedback>

                {/* Sidebar Content */}
                <Animated.View
                    style={[
                        styles.sidebar,
                        {
                            width: SIDEBAR_WIDTH,
                            backgroundColor: c.card,
                            transform: [{ translateX: slideAnim }],
                            paddingTop: insets.top,
                        },
                    ]}
                >
                    {/* Header with Gradient */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={c.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.headerGradient, { paddingTop: 10 }]}
                        >
                            <View style={styles.headerContent}>
                                <View style={styles.headerTopRow}>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.profileSection}
                                    onPress={() => { onClose(); navigation.navigate('Profile'); }}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.avatarWrapper}>
                                        <Avatar uri={user?.profileImage || user?.avatar} name={user?.firstName} size={52} />
                                        <View style={styles.onlineBadge} />
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {user?.firstName || 'User'}
                                        </Text>
                                        <View style={styles.roleBadge}>
                                            <Text style={styles.roleText}>
                                                {user?.userType === 'client' ? 'Client' : 'Freelancer'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Menu Items */}
                    <ScrollView
                        style={styles.menuScroll}
                        contentContainerStyle={styles.menuContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={`menu-item-${index}`}
                                style={[styles.menuItem, { borderBottomColor: c.border }]}
                                onPress={() => {
                                    onClose();
                                    if (item.screen) navigation.navigate(item.screen);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={18}
                                        color={item.color}
                                    />
                                </View>
                                <Text style={[styles.menuLabel, { color: c.text }]}>
                                    {item.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={c.subtext} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 20) }]}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <View style={[styles.iconContainer, { backgroundColor: '#EF444415', width: 32, height: 32, borderRadius: 10 }]}>
                                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                            </View>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                        <Text style={[styles.version, { color: c.subtext }]}>Version 1.0.0</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sidebar: {
        flex: 1,
        height: '100%',
        ...Platform.select({
            web: { boxShadow: '10px 0 20px rgba(0, 0, 0, 0.2)' },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 10, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            }
        }),
        elevation: 20,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
    },
    headerContainer: {
        width: '100%',
    },
    headerGradient: {
        width: '100%',
        paddingBottom: 16,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 12,
        padding: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 40,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: 'white',
        marginBottom: 2,
        ...Platform.select({
            web: { textShadow: '0px 1px 2px rgba(0,0,0,0.1)' },
            default: {
                textShadowColor: 'rgba(0,0,0,0.1)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
            }
        }),
    },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'white',
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    menuScroll: {
        flex: 1,
    },
    menuContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginBottom: 2,
        borderRadius: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
    },
    footer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: "600",
        color: '#EF4444',
    },
    version: {
        textAlign: "center",
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
        opacity: 0.4,
    },
});
