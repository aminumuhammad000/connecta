import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import Button from './Button';
import { useTranslation } from '../utils/i18n';
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
    const { t } = useTranslation();
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

    const totalFields = 6;
    const completedFields = totalFields - missingFields.length;
    const progressPercentage = (completedFields / totalFields) * 100;
    const rewardSparks = missingFields.length * 10;

    const renderMissingItem = (item: string, index: number) => {
        let iconName: any = 'error-outline';
        let label = item;

        switch (item) {
            case 'bio':
                iconName = 'description';
                label = t('bio' as any) || 'Bio / Description';
                break;
            case 'skills':
                iconName = 'star';
                label = t('skills' as any) || 'Skills';
                break;
            case 'location':
                iconName = 'location-on';
                label = t('location' as any) || 'Location';
                break;
            case 'avatar':
                iconName = 'account-circle';
                label = t('profile_picture' as any) || 'Profile Picture';
                break;
            case 'phone':
                iconName = 'phone';
                label = t('phone' as any) || 'Phone Number';
                break;
            case 'experience':
                iconName = 'work';
                label = t('experience' as any) || 'Work Experience';
                break;
            case 'education':
                iconName = 'school';
                label = t('education' as any) || 'Education';
                break;
            case 'portfolio':
                iconName = 'folder-open';
                label = t('portfolio' as any) || 'Portfolio';
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
                                        {t('complete_profile_title' as any) || 'Complete Your Profile'}
                                    </Text>
                                    <Text style={[styles.subtitle, { color: c.subtext }]}>
                                        {t('complete_profile_sub' as any) || 'Unlock all features and earn rewards'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                                        {completedFields} / {totalFields} {t('completed' as any) || 'Completed'}
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

                            <View style={[styles.rewardBadge, { backgroundColor: '#FFD70020', borderColor: '#FFD700' }]}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <MaterialIcons name="bolt" size={22} color="#FFD700" />
                                        <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>
                                            {t('earn_reward' as any) || 'Earn'} <Text style={{ color: '#FFD700' }}>{rewardSparks} Sparks</Text>
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                                        <MaterialIcons name="info-outline" size={16} color={c.subtext} style={{ marginTop: 2 }} />
                                        <Text style={{ fontSize: 12, color: c.subtext, flex: 1, lineHeight: 17 }}>
                                            {t('rewards_benefit' as any) || 'Complete your profile to earn rewards! Rewards help you get priority job match emails, WhatsApp notifications, and other important updates.'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.listContainer}>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: c.subtext, marginBottom: 8 }}>
                                    {t('missing_fields' as any) || 'Complete these sections:'}
                                </Text>
                                {missingFields.slice(0, 3).map(renderMissingItem)}
                                {missingFields.length > 3 && (
                                    <Text style={{ fontSize: 12, color: c.subtext, fontWeight: '600', marginTop: 4 }}>
                                        +{missingFields.length - 3} {t('more' as any) || 'more'}
                                    </Text>
                                )}
                            </View>

                            <Button
                                title={t('complete_now' as any) || 'Complete Profile Now'}
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
