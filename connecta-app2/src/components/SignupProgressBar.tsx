import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/theme';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withSequence,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';

interface SignupProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const SignupProgressBar: React.FC<SignupProgressBarProps> = ({ currentStep, totalSteps }) => {
    const c = useThemeColors();

    // Create an array for the steps
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <View style={styles.container}>
            <View style={styles.stepsContainer}>
                {steps.map((step) => {
                    const isActive = step <= currentStep;
                    const isCurrent = step === currentStep;

                    return (
                        <View key={step} style={styles.stepWrapper}>
                            <StepSegment
                                step={step}
                                isActive={isActive}
                                isCurrent={isCurrent}
                                colors={c}
                            />
                        </View>
                    );
                })}
            </View>
            <View style={styles.labelContainer}>
                <Text style={[styles.stepLabel, { color: c.subtext }]}>
                    Step <Text style={{ color: c.text, fontWeight: '800' }}>{currentStep}</Text> of {totalSteps}
                </Text>
                {currentStep === totalSteps && (
                    <Text style={[styles.completionLabel, { color: c.primary }]}>Final Step! 🎉</Text>
                )}
            </View>
        </View>
    );
};

interface StepSegmentProps {
    step: number;
    isActive: boolean;
    isCurrent: boolean;
    colors: any;
}

const StepSegment: React.FC<StepSegmentProps> = ({ isActive, isCurrent, colors }) => {
    const scale = useSharedValue(1);
    const progress = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(isActive ? 1 : 0, { damping: 15, stiffness: 100 });
        if (isCurrent) {
            scale.value = withSequence(
                withTiming(1.2, { duration: 200 }),
                withSpring(1)
            );
        }
    }, [isActive, isCurrent]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                [colors.border + '40', colors.primary]
            ),
            transform: [{ scale: scale.value }],
            height: isCurrent ? 5 : 4,
            opacity: isActive ? 1 : 0.6,
        };
    });

    return <Animated.View style={[styles.segment, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 16,
        paddingHorizontal: 4,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 6,
    },
    stepWrapper: {
        flex: 1,
    },
    segment: {
        width: '100%',
        borderRadius: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    stepLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    completionLabel: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    }
});

export default SignupProgressBar;
