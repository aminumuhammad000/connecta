import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import Button from './Button';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileCompletionCardProps {
    visible: boolean;
    missingFields: string[];
    onComplete: () => void;
    onSkip?: () => void;
}

const { width } = Dimensions.get('window');

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
    visible,
    missingFields,
    onComplete,
    onSkip
}) => {
    const c = useThemeColors();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 50
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const totalFields = 11;
    const completedFields = Math.max(0, totalFields - missingFields.length);
    const progressPercentage = (completedFields / totalFields) * 100;
    const rewardSparks = missingFields.length * 10;

    const renderMissingItem = (item: string, index: number) => {
        let iconName: any = 'error-outline';
        let label = item;

        switch (item) {
            case 'bio':
                iconName = 'description';
                label = 'Bio / Description';
                break;
            case 'skills':
                iconName = 'star';
                label = 'Skills';
                break;
            case 'location':
                iconName = 'location-on';
                label = 'Location';
                break;
            case 'avatar':
                iconName = 'account-circle';
                label = 'Profile Picture';
                break;
            case 'phone':
                iconName = 'phone';
                label = 'Phone Number';
                break;
            case 'experience':
                iconName = 'work';
                label = 'Work Experience';
                break;
            case 'education':
                iconName = 'school';
                label = 'Education';
                break;
            case 'whatsapp':
                iconName = 'chat';
                label = 'WhatsApp Number';
                break;
            case 'title':
                iconName = 'work-outline';
                label = 'Professional Title';
                break;
            case 'preferences':
                iconName = 'settings';
                label = 'Job Preferences';
                break;
            case 'portfolio':
                iconName = 'folder-open';
                label = 'Portfolio';
                break;
            case 'employment':
                iconName = 'business-center';
                label = 'Work Experience';
                break;
        }

        return (
            <TouchableOpacity
                key={item}
                style={[styles.missingItem, { backgroundColor: c.background }]}
                onPress={onComplete}
                activeOpacity={0.7}
            >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: c.primary }}>{index + 1}</Text>
                </View>
                <MaterialIcons name={iconName} size={20} color={c.text} />
                <Text style={[styles.missingText, { color: c.text }]}>{label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onSkip}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onSkip}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            }
                        ]}
                    >
                        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                            {onSkip && (
                                <TouchableOpacity
                                    onPress={onSkip}
                                    style={styles.skipButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialIcons name="close" size={20} color={c.subtext} />
                                </TouchableOpacity>
                            )}

                            <View style={styles.header}>
                                <View>
                                    <Text style={[styles.title, { color: c.text }]}>
                                        {'Complete Your Profile'}
                                    </Text>
                                     <Text style={[styles.subtitle, { color: c.subtext }]}>
                                         {'Complete these steps to unlock all features'}
                                     </Text>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                                        {completedFields} / {totalFields} {'Completed'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.primary }}>
                                            {Math.round(progressPercentage)}%
                                        </Text>
                                        <MaterialIcons name="trending-up" size={18} color={c.primary} />
                                    </View>
                                </View>
                                <View style={[styles.progressBarContainer, { backgroundColor: c.border }]}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${progressPercentage}%`,
                                                backgroundColor: c.primary
                                            }
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={[c.primary, '#FF6347']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    </Animated.View>
                                </View>
                            </View>



                            <View style={styles.listContainer}>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: c.subtext, marginBottom: 8 }}>
                                    {'Complete these sections:'}
                                </Text>
                                {missingFields.slice(0, 3).map(renderMissingItem)}
                                {missingFields.length > 3 && (
                                    <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600', marginTop: 4 }}>
                                        +{missingFields.length - 3} {'more'}
                                    </Text>
                                )}
                            </View>

                            <Button
                                title="Complete Profile Now"
                                onPress={onComplete}
                                variant="primary"
                                size="medium"
                                style={{ width: '100%' }}
                            />
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    skipButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    progressSection: {
        marginBottom: 16,
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    rewardBadge: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    listContainer: {
        marginBottom: 16,
    },
    missingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 10,
        marginBottom: 8,
    },
    missingText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    }
});

export default ProfileCompletionCard;
