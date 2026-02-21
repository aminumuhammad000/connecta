import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeOutUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface RewardCelebrationProps {
    visible: boolean;
    onClose: () => void;
    sparks: number;
    title: string;
}

const RewardCelebration: React.FC<RewardCelebrationProps> = ({ visible, onClose, sparks, title }) => {
    const c = useThemeColors();
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            scale.value = withSpring(1);
            opacity.value = withTiming(1, { duration: 500 });

            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            scale.value = withTiming(0.5);
            opacity.value = withTiming(0);
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />

                <Animated.View
                    entering={FadeInDown.springify()}
                    exiting={FadeOutUp}
                    style={[styles.card, { backgroundColor: c.card }, animatedStyle]}
                >
                    <View style={[styles.iconBox, { backgroundColor: c.primary }]}>
                        <MaterialCommunityIcons name="lightning-bolt" size={48} color="#FFF" />
                    </View>

                    <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                    <View style={styles.sparkRow}>
                        <Text style={[styles.sparkLabel, { color: c.subtext }]}>YOU EARNED</Text>
                        <Text style={[styles.sparkVal, { color: c.primary }]}>+{sparks} Sparks</Text>
                    </View>

                    <Animated.View entering={FadeInDown.delay(300)} style={styles.badge}>
                        <Text style={styles.badgeText}>Professional Milestone</Text>
                    </Animated.View>
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
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    card: {
        width: width * 0.8,
        padding: 32,
        borderRadius: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    iconBox: {
        width: 100,
        height: 100,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        transform: [{ rotate: '-10deg' }]
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5
    },
    sparkRow: {
        alignItems: 'center',
        marginBottom: 24
    },
    sparkLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 4
    },
    sparkVal: {
        fontSize: 32,
        fontWeight: '900'
    },
    badge: {
        backgroundColor: 'rgba(253, 103, 48, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12
    },
    badgeText: {
        color: '#FD6730',
        fontSize: 14,
        fontWeight: '700'
    }
});

export default RewardCelebration;
