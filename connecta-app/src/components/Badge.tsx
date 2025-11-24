import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export default function Badge({ label, variant = 'neutral', size = 'medium', style }: BadgeProps) {
    const c = useThemeColors();

    const getColors = () => {
        switch (variant) {
            case 'success':
                return {
                    bg: c.isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5',
                    fg: c.isDark ? '#6EE7B7' : '#047857',
                };
            case 'warning':
                return {
                    bg: c.isDark ? 'rgba(251,191,36,0.2)' : '#FEF3C7',
                    fg: c.isDark ? '#FCD34D' : '#B45309',
                };
            case 'error':
                return {
                    bg: c.isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2',
                    fg: c.isDark ? '#F87171' : '#B91C1C',
                };
            case 'info':
                return {
                    bg: c.isDark ? 'rgba(59,130,246,0.2)' : '#DBEAFE',
                    fg: c.isDark ? '#60A5FA' : '#1E40AF',
                };
            case 'primary':
                return {
                    bg: c.primary + '33',
                    fg: c.primary,
                };
            default:
                return {
                    bg: c.isDark ? '#374151' : '#F3F4F6',
                    fg: c.isDark ? '#D1D5DB' : '#4B5563',
                };
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 };
            case 'large':
                return { paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 };
            default:
                return { paddingHorizontal: 10, paddingVertical: 6, fontSize: 12 };
        }
    };

    const colors = getColors();
    const sizeStyle = getSizeStyle();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: colors.bg,
                    paddingHorizontal: sizeStyle.paddingHorizontal,
                    paddingVertical: sizeStyle.paddingVertical,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.fg,
                        fontSize: sizeStyle.fontSize,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '700',
    },
});
