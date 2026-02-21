import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';

interface SparkPillProps {
    sparks: number;
}

const SparkPill: React.FC<SparkPillProps> = ({ sparks }) => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const scale = useSharedValue(1);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(withTiming(1.1, { duration: 100 }), withSpring(1));
        // Navigation to Rewards Screen - Need to make sure this route is registered
        (navigation as any).navigate('Rewards');
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View entering={FadeInRight.delay(500)}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                style={[styles.pill, { backgroundColor: c.card, borderColor: c.primary + '30' }]}
            >
                <Animated.View style={[styles.content, animatedStyle]}>
                    <MaterialCommunityIcons name="lightning-bolt" size={16} color={c.primary} />
                    <Text style={[styles.text, { color: c.text }]}>{sparks}</Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: '800',
    },
});

export default SparkPill;
