
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
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/theme";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SidebarProps {
    isVisible: boolean;
    onClose: () => void;
    navigation: any;
}

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export default function Sidebar({ isVisible, onClose, navigation }: SidebarProps) {
    const c = useThemeColors();
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();
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
        await logout();
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

    if (!isVisible) return null;

    return (
        <View style={[styles.overlay, { zIndex: isVisible ? 1000 : -1 }]} pointerEvents={isVisible ? "auto" : "none"}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Profile'); }}>
                        <View style={[styles.userInfo, { borderBottomColor: c.border }]}>
                            <Avatar uri={user?.profileImage || user?.avatar} name={user?.firstName} size={60} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={[styles.userName, { color: c.text }]}>
                                    {user?.firstName} {user?.lastName}
                                </Text>
                                <Text style={[styles.userRole, { color: c.subtext }]}>
                                    {user?.userType === 'client' ? 'Client' : 'Freelancer'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10 }}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => {
                                onClose();
                                if (item.screen) navigation.navigate(item.screen);
                            }}
                        >
                            <MaterialIcons name={item.icon as any} size={24} color={c.subtext} />
                            <Text style={[styles.menuLabel, { color: c.text }]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: c.border }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={24} color="#EF4444" />
                        <Text style={[styles.menuLabel, { color: "#EF4444" }]}>Log Out</Text>
                    </TouchableOpacity>
                    <Text style={[styles.version, { color: c.subtext }]}>v1.0.0</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sidebar: {
        height: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        textTransform: "capitalize",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuLabel: {
        fontSize: 16,
        marginLeft: 16,
        fontWeight: "500",
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 10,
        paddingBottom: 20,
    },
    version: {
        textAlign: "center",
        fontSize: 12,
        marginTop: 10,
    },
});
