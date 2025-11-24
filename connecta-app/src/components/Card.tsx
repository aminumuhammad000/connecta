import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: number;
    style?: ViewStyle;
}

export default function Card({ children, variant = 'default', padding = 16, style }: CardProps) {
    const c = useThemeColors();

    const getCardStyle = () => {
        const baseStyle: ViewStyle = {
            backgroundColor: c.card,
            borderRadius: 12,
            padding,
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: c.border,
                };
            default:
                return baseStyle;
        }
    };

    return <View style={[getCardStyle(), style]}>{children}</View>;
}
