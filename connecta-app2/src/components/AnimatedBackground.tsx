import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useThemeColors } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const AnimatedBackground: React.FC = () => {
    const c = useThemeColors();

    // Animation refs
    const blob1Pos = useRef(new Animated.Value(0)).current;
    const blob2Pos = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createLoop = (anim: Animated.Value, duration: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createLoop(blob1Pos, 8000).start();
        createLoop(blob2Pos, 12000).start();
    }, []);

    const blob1Style = {
        transform: [
            {
                translateY: blob1Pos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 30],
                }),
            },
            {
                translateX: blob1Pos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                }),
            },
        ],
    };

    const blob2Style = {
        transform: [
            {
                translateY: blob2Pos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40],
                }),
            },
            {
                translateX: blob2Pos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                }),
            },
        ],
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob1,
                    blob1Style,
                    { backgroundColor: 'rgba(253, 103, 48, 0.1)' }
                ]}
            />
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob2,
                    blob2Style,
                    { backgroundColor: 'rgba(66, 153, 225, 0.1)' }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    blob: {
        position: 'absolute',
        borderRadius: 999,
        zIndex: -1,
    },
    blob1: {
        width: 300,
        height: 300,
        top: -100,
        left: -100,
    },
    blob2: {
        width: 250,
        height: 250,
        top: 100,
        right: -50,
    },
});

export default AnimatedBackground;
