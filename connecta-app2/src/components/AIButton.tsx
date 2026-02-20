import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Easing, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AIButtonProps {
    onPress: () => void;
    size?: number;
    color?: string;
}

export const AIButton: React.FC<AIButtonProps> = ({
    onPress,
    size = 18,
    color = '#fff',
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.1,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false, // backgroundColor interpolation doesn't support native driver
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ]),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, []);

    // Interpolate opacity for the glow effect
    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
    });

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            >
                <LinearGradient
                    colors={['#c94102ff', '#f86b53ff', '#f1941bff']} // Indigo -> Purple -> Pink (Gemini-ish)
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Overlay for pulsing glow intensity */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: 'white',
                            opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.3]
                            })
                        }
                    ]}
                />

                <MaterialIcons name="smart-toy" size={size} color={color} style={{ zIndex: 1 }} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Ensure gradient respects border radius
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
});
