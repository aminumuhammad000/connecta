import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}: ButtonProps) {
    const c = useThemeColors();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        };

        const sizeStyles = {
            small: { height: 32, paddingHorizontal: 12 },
            medium: { height: 44, paddingHorizontal: 20 },
            large: { height: 52, paddingHorizontal: 24 },
        };

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: disabled ? c.border : c.primary,
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: disabled ? c.border : c.isDark ? '#374151' : '#F3F4F6',
                };
            case 'outline':
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: disabled ? c.border : c.primary,
                };
            case 'ghost':
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: 'transparent',
                };
            default:
                return { ...baseStyle, ...sizeStyles[size] };
        }
    };

    const getTextStyle = (): TextStyle => {
        const sizeStyles = {
            small: { fontSize: 12 },
            medium: { fontSize: 15 },
            large: { fontSize: 16 },
        };

        let color = '#fff';
        if (variant === 'secondary') {
            color = c.text;
        } else if (variant === 'outline' || variant === 'ghost') {
            color = disabled ? c.subtext : c.primary;
        } else if (disabled) {
            color = c.subtext;
        }

        return {
            ...sizeStyles[size],
            color,
            fontWeight: '600',
        };
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#fff' : c.primary} size="small" />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
