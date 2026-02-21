import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export type AlertType = 'success' | 'error' | 'warning';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    type = 'success',
    onClose
}) => {
    const c = useThemeColors();
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: Platform.OS !== 'web',
                    friction: 5,
                    tension: 40
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: Platform.OS !== 'web'
                })
            ]).start();
        } else {
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: Platform.OS !== 'web'
            }).start();
            Animated.timing(opacityValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: Platform.OS !== 'web'
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#FF7F50'; // Coral
            case 'error': return '#EF4444'; // Red
            case 'warning': return '#F59E0B'; // Amber
            default: return c.primary;
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            backgroundColor: c.card,
                            transform: [{ scale: scaleValue }],
                            borderColor: c.border
                        }
                    ]}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
                        <MaterialIcons name={getIcon()} size={40} color={getColor()} />
                    </View>

                    <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: c.subtext }]}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: getColor() }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertContainer: {
        width: width * 0.85,
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        ...Platform.select({
            web: { boxShadow: '0 10px 10px rgba(0, 0, 0, 0.25)' },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 10.84,
            }
        }),
        elevation: 10,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default CustomAlert;
