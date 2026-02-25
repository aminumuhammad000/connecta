import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type PopupType = 'success' | 'warning' | 'error' | 'info';

interface StatusSparkPopupProps {
    visible: boolean;
    type?: PopupType;
    title: string;
    message: string;
    onClose: () => void;
}

const StatusSparkPopup: React.FC<StatusSparkPopupProps> = ({
    visible,
    type = 'success',
    title,
    message,
    onClose
}) => {
    const c = useThemeColors();
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const messageOpacity = useRef(new Animated.Value(0)).current;
    const messageSlide = useRef(new Animated.Value(10)).current;

    // Spark animation values - increased to 12 for more "wow"
    const sparkAnims = useRef([...Array(12)].map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 1.5 + 0.5)
    }))).current;

    const getColors = (): [string, string, string] => {
        switch (type) {
            case 'success': return ['#FF8A00', '#FD6730', '#F97316'];
            case 'warning': return ['#FBBF24', '#F59E0B', '#D97706'];
            case 'error': return ['#F87171', '#EF4444', '#B91C1C'];
            case 'info': return ['#60A5FA', '#3B82F6', '#1D4ED8'];
            default: return ['#FF8A00', '#FD6730', '#F97316'];
        }
    };

    const getIcon = () => {
        const iconSize = 48;
        switch (type) {
            case 'success': return <Ionicons name="checkmark-done" size={iconSize} color="#FFF" />;
            case 'warning': return <MaterialIcons name="warning" size={iconSize} color="#FFF" />;
            case 'error': return <MaterialIcons name="error" size={iconSize} color="#FFF" />;
            case 'info': return <MaterialIcons name="info" size={iconSize} color="#FFF" />;
        }
    };

    const getSparkColors = (): [string, string] => {
        switch (type) {
            case 'success': return ['#FD6730', '#FFBD3F'];
            case 'warning': return ['#F59E0B', '#FDE047'];
            case 'error': return ['#EF4444', '#FCA5A5'];
            case 'info': return ['#3B82F6', '#93C5FD'];
            default: return ['#FD6730', '#FFBD3F'];
        }
    };

    useEffect(() => {
        if (visible) {
            // Explicitly reset everything so it always starts from zero
            scaleValue.setValue(0);
            opacityValue.setValue(0);
            messageOpacity.setValue(0);
            messageSlide.setValue(10);
            iconScale.setValue(0);

            // Main entrance
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 40
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true
                })
            ]).start();

            // Haptics
            if (Platform.OS !== 'web') {
                try {
                    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                } catch (e) {
                    // Fail gracefully
                }
            }

            // Icon bounce and message fade-in
            Animated.sequence([
                Animated.delay(100),
                Animated.parallel([
                    Animated.spring(iconScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        friction: 4,
                        tension: 110
                    }),
                    Animated.timing(messageOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true
                    }),
                    Animated.spring(messageSlide, {
                        toValue: 0,
                        useNativeDriver: true,
                        friction: 7
                    })
                ])
            ]).start();

            // Sparkle explosion
            const sparkColors = getSparkColors();
            sparkAnims.forEach((anim, i) => {
                const angle = (i / sparkAnims.length) * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                const duration = 1000 + Math.random() * 600;

                Animated.sequence([
                    Animated.delay(300),
                    Animated.parallel([
                        Animated.timing(anim.x, {
                            toValue: Math.cos(angle) * distance,
                            duration,
                            useNativeDriver: true,
                            easing: (t) => 1 - Math.pow(1 - t, 3)
                        }),
                        Animated.timing(anim.y, {
                            toValue: Math.sin(angle) * distance,
                            duration,
                            useNativeDriver: true,
                            easing: (t) => 1 - Math.pow(1 - t, 3)
                        }),
                        Animated.sequence([
                            Animated.timing(anim.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                            Animated.timing(anim.opacity, { toValue: 0, duration: duration - 200, useNativeDriver: true })
                        ]),
                        Animated.timing(anim.scale, {
                            toValue: 0.1,
                            duration,
                            useNativeDriver: true
                        })
                    ])
                ]).start();
            });
        } else {
            // Close animation
            Animated.parallel([
                Animated.timing(scaleValue, { toValue: 0.8, duration: 250, useNativeDriver: true }),
                Animated.timing(opacityValue, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(iconScale, { toValue: 0, duration: 200, useNativeDriver: true })
            ]).start();

            // Reset sparks
            sparkAnims.forEach(anim => {
                anim.x.setValue(0);
                anim.y.setValue(0);
                anim.opacity.setValue(0);
            });
        }
    }, [visible, type]);

    if (!visible) return null;

    const mainColors = getColors();
    const sparks = getSparkColors();

    const containerStyle = [
        styles.container,
        {
            backgroundColor: c.isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            transform: [{ scale: scaleValue }],
            opacity: opacityValue
        }
    ];

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
                </Animated.View>

                <Animated.View style={containerStyle}>
                    <BlurView intensity={Platform.OS === 'ios' ? 30 : 100} tint={c.isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                        <LinearGradient
                            colors={c.isDark ? ['rgba(45,45,45,0.98)', 'rgba(25,25,25,0.95)'] : ['rgba(255,255,255,0.95)', 'rgba(245,245,245,0.98)']}
                            style={styles.gradient}
                        >
                            {/* Sparks / Particles */}
                            {sparkAnims.map((anim, i) => (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.spark,
                                        {
                                            backgroundColor: i % 2 === 0 ? sparks[0] : sparks[1],
                                            opacity: anim.opacity,
                                            transform: [
                                                { translateX: anim.x },
                                                { translateY: anim.y },
                                                { scale: anim.scale }
                                            ]
                                        }
                                    ]}
                                />
                            ))}

                            {/* Center Icon Section */}
                            <View style={styles.iconWrapper}>
                                {/* Multi-layered pulsing effects */}
                                <Animated.View style={[
                                    styles.pulseCircle,
                                    {
                                        borderColor: mainColors[0],
                                        borderWidth: 1.5,
                                        transform: [{ scale: iconScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] }) }],
                                        opacity: iconScale.interpolate({ inputRange: [0.4, 1], outputRange: [0, 0.2] })
                                    }
                                ]} />
                                <Animated.View style={[
                                    styles.pulseCircle,
                                    {
                                        borderColor: mainColors[1],
                                        borderWidth: 1,
                                        transform: [{ scale: iconScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) }],
                                        opacity: iconScale.interpolate({ inputRange: [0.6, 1], outputRange: [0, 0.4] })
                                    }
                                ]} />

                                <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                                    <LinearGradient
                                        colors={[mainColors[0], mainColors[1], mainColors[2]]}
                                        style={styles.iconCircle}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        {getIcon()}

                                        {/* Glossy overlay on icon */}
                                        <View style={{
                                            position: 'absolute',
                                            top: 4, left: 4, right: 4, height: '40%',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            borderRadius: 40
                                        }} />
                                    </LinearGradient>
                                </Animated.View>
                            </View>

                            <Animated.View style={{
                                opacity: messageOpacity,
                                transform: [{ translateY: messageSlide }],
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Text style={[styles.title, { color: c.text }]}>{title}</Text>

                                <View style={{
                                    paddingHorizontal: 10,
                                    marginBottom: 32
                                }}>
                                    <Text style={[styles.message, { color: c.subtext }]}>{message}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={onClose}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={[mainColors[0], mainColors[1]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.buttonText}>Awesome, Got it</Text>
                                        <Ionicons name="sparkles" size={18} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </LinearGradient>
                    </BlurView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    container: {
        width: Dimensions.get('window').width * 0.88,
        maxWidth: 400,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
    },
    blurContainer: {
        // Removed flex: 1 to prevent height collapse
    },
    gradient: {
        paddingTop: 48,
        paddingBottom: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    pulseCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    spark: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        top: '35%',
        left: '48%',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 14,
        textAlign: 'center',
        letterSpacing: -0.8,
    },
    message: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
        opacity: 0.9,
    },
    button: {
        width: '100%',
        height: 62,
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
    }
});

export default StatusSparkPopup;
