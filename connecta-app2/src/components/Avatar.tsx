import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface AvatarProps {
    uri?: string;
    name?: string;
    size?: number;
    style?: ViewStyle;
}

export default function Avatar({ uri, name, size = 48, style }: AvatarProps) {
    const c = useThemeColors();

    const getInitials = (fullName?: string) => {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return fullName[0].toUpperCase();
    };

    const initials = getInitials(name);

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: c.isDark ? '#374151' : '#E5E7EB',
                },
                style,
            ]}
        >
            {uri ? (
                <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
            ) : (
                <Text style={[styles.initials, { fontSize: size * 0.4, color: c.text }]}>{initials}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        resizeMode: 'cover',
    },
    initials: {
        fontWeight: '700',
    },
});
