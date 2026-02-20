import React, { useState, useEffect } from 'react';
import { Text, TextStyle, TextProps, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

interface TypewriterTextProps extends TextProps {
    text: string;
    speed?: number;
    delay?: number;
    style?: TextStyle | TextStyle[];
    onComplete?: () => void;
    showCursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 40,
    delay = 0,
    style,
    onComplete,
    showCursor = true,
    ...props
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const cursorOpacity = useSharedValue(1);

    useEffect(() => {
        cursorOpacity.value = withRepeat(
            withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })),
            -1,
            true
        );
    }, []);

    const cursorStyle = useAnimatedStyle(() => ({
        opacity: isFinished ? 0 : cursorOpacity.value,
    }));

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsStarted(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isStarted) return;

        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsFinished(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(typingInterval);
    }, [text, speed, isStarted]);

    return (
        <View style={styles.container}>
            <Text style={style} {...props}>
                {displayedText}
                {showCursor && !isFinished && (
                    <Animated.Text style={[style, cursorStyle, styles.cursor]}>|</Animated.Text>
                )}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cursor: {
        fontWeight: 'bold',
    }
});

export default TypewriterText;
