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
            borderRadius: 16,
            padding,
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.03)',
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: c.border,
                };
            default:
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.02)',
                };
        }
    };

    return <View style={[getCardStyle(), style]}>{children}</View>;
}
