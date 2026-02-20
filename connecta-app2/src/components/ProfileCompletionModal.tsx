import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import Button from './Button';

interface ProfileCompletionModalProps {
    visible: boolean;
    missingFields: string[];
    onComplete: () => void;
    onSkip?: () => void;
}

const { width } = Dimensions.get('window');

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
    visible,
    missingFields,
    onComplete,
    onSkip
}) => {
    const c = useThemeColors();
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 6,
                    tension: 50
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
            Animated.timing(opacityValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    const renderMissingItem = (item: string) => {
        let iconName: any = 'error-outline';
        let label = item;

        switch (item) {
            case 'bio':
                iconName = 'short-text';
                label = 'Bio / Description';
                break;
            case 'skills':
                iconName = 'star-outline';
                label = 'Skills';
                break;
            case 'location':
                iconName = 'location-on';
                label = 'Location';
                break;
            case 'avatar':
                iconName = 'person-outline';
                label = 'Profile Picture';
                break;
        }

        return (
            <View key={item} style={[styles.missingItem, { backgroundColor: c.background }]}>
                <MaterialIcons name={iconName} size={20} color={c.subtext} />
                <Text style={[styles.missingText, { color: c.text }]}>{label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </View>
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: c.card,
                            transform: [{ scale: scaleValue }],
                            borderColor: c.border
                        }
                    ]}
                >
                    <View style={[styles.headerIcon, { backgroundColor: '#FCD34D33' }]}>
                        <MaterialIcons name="assignment-ind" size={48} color="#F59E0B" />
                    </View>

                    <Text style={[styles.title, { color: c.text }]}>Complete Your Profile</Text>
                    <Text style={[styles.subtitle, { color: c.subtext }]}>
                        To start applying for jobs, please complete the following sections:
                    </Text>

                    <View style={styles.listContainer}>
                        {missingFields.map(renderMissingItem)}
                    </View>

                    <Button
                        title="Complete Now"
                        onPress={onComplete}
                        variant="primary"
                        size="large"
                        style={{ width: '100%' }}
                    />

                    {onSkip && (
                        <TouchableOpacity onPress={onSkip} style={{ marginTop: 16 }}>
                            <Text style={{ color: c.subtext, fontSize: 14, fontWeight: '600' }}>Not Now</Text>
                        </TouchableOpacity>
                    )}
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContainer: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    listContainer: {
        width: '100%',
        gap: 10,
        marginBottom: 24,
    },
    missingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    missingText: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    }
});

export default ProfileCompletionModal;
