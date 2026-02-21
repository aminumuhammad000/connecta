import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Easing, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';

interface FloatingAIButtonProps {
    forcedRouteName?: string;
    navigationRef?: any;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ forcedRouteName, navigationRef }) => {
    const c = useThemeColors();
    const { isAuthenticated, user } = useAuth();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    // Animation refs for the "active" feel
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;

    // Use route name from parent state tracking
    const currentRouteName = forcedRouteName;

    // Don't show on Desktop or specific screens (including the AI chat itself)
    const hiddenScreens = ['AIChat', 'ConnectaAI', 'Landing', 'Login', 'Signup', 'VideoCall', 'Onboarding', 'IdentityVerification'];
    const isHidden = isDesktop || !isAuthenticated || (currentRouteName && hiddenScreens.includes(currentRouteName));

    useEffect(() => {
        if (isHidden) return;

        const rotation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 12000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const ripple = Animated.loop(
            Animated.sequence([
                Animated.timing(rippleAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.delay(1000),
                Animated.timing(rippleAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        );

        rotation.start();
        ripple.start();

        return () => {
            rotation.stop();
            ripple.stop();
        };
    }, [isHidden]);

    if (isHidden) return null;

    const rotatingRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handlePress = () => {
        if (navigationRef?.current) {
            const target = user?.userType === 'client' ? 'ClientMain' : 'FreelancerMain';
            try {
                // Navigate using root navigator's ref to the correct nested stack and screen
                navigationRef.current.navigate(target, { screen: 'AIChat' });
            } catch (error) {
                // Fallback for flat navigation
                navigationRef.current.navigate('AIChat');
            }
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    bottom: 80 + insets.bottom,
                    shadowColor: c.primary,
                }
            ]}
        >
            {/* Ambient Coral Pulse */}
            <Animated.View
                style={[
                    styles.glowAura,
                    {
                        backgroundColor: c.primary,
                        opacity: rippleAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0.3, 0]
                        }),
                        transform: [{
                            scale: rippleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.8]
                            })
                        }]
                    }
                ]}
            />

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={[styles.touchable, { backgroundColor: c.primary, borderColor: 'rgba(255,255,255,0.4)' }]}
            >
                {/* Connecta Coral Gradient */}
                <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotatingRotation }] }]}>
                    <LinearGradient
                        colors={[c.primary, '#FF7F50', '#FD6730', c.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    />
                </Animated.View>

                <MaterialIcons name="auto-awesome" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        zIndex: 99999, // Ensure absolute top level
        elevation: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    glowAura: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    touchable: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.5,
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
});
