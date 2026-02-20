import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as NativeAnimated, Easing } from 'react-native';
import { useThemeColors } from '../theme/theme';
import TypewriterText from './TypewriterText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChatGreetingProps {
    messages: { text: string; delay?: number; speed?: number }[];
    onComplete?: () => void;
}

const ChatGreeting: React.FC<ChatGreetingProps> = ({ messages, onComplete }) => {
    const c = useThemeColors();
    const [visibleMessages, setVisibleMessages] = useState<number>(0);
    const fadeAnims = useRef<NativeAnimated.Value[]>([]);

    useEffect(() => {
        // Initialize animations
        fadeAnims.current = messages.map(() => new NativeAnimated.Value(0));

        const showNextMessage = (index: number) => {
            if (index >= messages.length) {
                if (onComplete) onComplete();
                return;
            }

            NativeAnimated.timing(fadeAnims.current[index], {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();

            setVisibleMessages(index + 1);
        };

        // Start sequence
        showNextMessage(0);
    }, [messages]);

    const handleMessageComplete = (index: number) => {
        if (index + 1 < messages.length) {
            setTimeout(() => {
                setVisibleMessages(index + 2);
                NativeAnimated.timing(fadeAnims.current[index + 1], {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }).start();
            }, 400); // Small pause between bubbles
        } else if (onComplete) {
            onComplete();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: c.primary }]}>
                    <MaterialCommunityIcons name="robot" size={20} color="#FFF" />
                </View>
                <Text style={[styles.botName, { color: c.subtext }]}>myconnecta</Text>
            </View>

            <View style={styles.bubblesList}>
                {messages.map((msg, index) => (
                    index < visibleMessages && (
                        <NativeAnimated.View
                            key={index}
                            style={[
                                styles.bubble,
                                {
                                    backgroundColor: c.card,
                                    borderColor: c.border,
                                    opacity: fadeAnims.current[index],
                                    transform: [{
                                        translateY: fadeAnims.current[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <TypewriterText
                                text={msg.text}
                                speed={msg.speed || 40}
                                delay={0}
                                style={[styles.messageText, { color: c.text }]}
                                onComplete={() => handleMessageComplete(index)}
                                showCursor={index === visibleMessages - 1}
                            />
                        </NativeAnimated.View>
                    )
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 24,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bubblesList: {
        gap: 8,
        paddingLeft: 40,
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderTopLeftRadius: 4,
        borderWidth: 1,
        maxWidth: '90%',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '500',
    },
});

export default ChatGreeting;
