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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/theme";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
    isVisible: boolean;
    onClose: () => void;
    navigation: any;
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export default function Sidebar({ isVisible, onClose, navigation }: SidebarProps) {
    const c = useThemeColors();
    const { user, logout } = useAuth();
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
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
                    duration: 250,
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
        { icon: "person", label: "My Profile", screen: "Profile" },
        { icon: "settings", label: "Settings", screen: "Settings" },
        { icon: "account-balance-wallet", label: "Wallet", screen: user?.userType === "client" ? "ClientPayments" : "Wallet" },
        { icon: "description", label: "Contracts", screen: user?.userType === "client" ? "Projects" : "FreelancerProjects" },
        { icon: "help", label: "Help & Support", screen: "HelpSupport" },
        { icon: "gavel", label: "Terms & Conditions", screen: "Terms" },
        { icon: "info", label: "About Connecta", screen: "About" },
    ];

    return (
        <Modal
            transparent
            visible={isVisible}
            onRequestClose={onClose}
            animationType="none"
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: fadeAnim,
                            }
                        ]}
                    />
                </TouchableWithoutFeedback>

                {/* Sidebar Content */}
                <Animated.View
                    style={[
                        styles.sidebar,
                        {
                            width: SIDEBAR_WIDTH,
                            backgroundColor: c.card,
                            transform: [{ translateX: slideAnim }],
                            borderTopRightRadius: 24,
                            borderBottomRightRadius: 24,
                        },
                    ]}
                >
                    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                        <View style={styles.header}>
                            <View style={styles.headerTop}>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <MaterialIcons name="close" size={20} color={c.text} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Profile'); }}>
                                <View style={[styles.userInfo, { borderBottomColor: c.border }]}>
                                    <View style={styles.avatarContainer}>
                                        <Avatar uri={user?.profileImage || user?.avatar} name={user?.firstName} size={52} />
                                        <View style={[styles.onlineIndicator, { backgroundColor: '#10B981' }]} />
                                    </View>
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
                                            {user?.firstName || 'User'} {user?.lastName || ''}
                                        </Text>
                                        <Text style={[styles.userRole, { color: c.primary }]}>
                                            {user?.userType === 'client' ? 'Client' : 'Freelancer'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 8 }}>
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={`menu-item-${index}`}
                                    style={styles.menuItem}
                                    onPress={() => {
                                        onClose();
                                        if (item.screen) navigation.navigate(item.screen);
                                    }}
                                >
                                    <MaterialIcons
                                        name={item.icon as any}
                                        size={22}
                                        color={c.subtext}
                                    />
                                    <Text style={[styles.menuLabel, { color: c.text }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={[styles.footer, { borderTopColor: c.border }]}>
                            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                <MaterialIcons name="logout" size={20} color="#EF4444" />
                                <Text style={[styles.menuLabel, { color: "#EF4444" }]}>Log Out</Text>
                            </TouchableOpacity>
                            <Text style={[styles.version, { color: c.subtext }]}>v1.0.0</Text>
                        </View>
                    </SafeAreaView>
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
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sidebar: {
        height: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatarContainer: {
        position: 'relative',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 1,
        letterSpacing: -0.3,
    },
    userRole: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        fontWeight: '700',
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 12,
        marginVertical: 2,
        borderRadius: 24,
    },
    menuLabel: {
        fontSize: 14,
        marginLeft: 16,
        fontWeight: "500",
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    version: {
        textAlign: "center",
        fontSize: 10,
        marginTop: 8,
        fontWeight: '500',
        opacity: 0.4,
    },
});
