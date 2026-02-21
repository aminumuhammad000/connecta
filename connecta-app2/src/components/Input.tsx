import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    containerStyle?: ViewStyle;
}

export default function Input({ label, error, icon, containerStyle, ...textInputProps }: InputProps) {
    const c = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: c.text }]}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: c.card,
                        borderColor: error ? '#EF4444' : isFocused ? c.primary : c.border,
                        borderWidth: isFocused || error ? 1.5 : 1,
                    },
                ]}
            >
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={20}
                        color={error ? '#EF4444' : isFocused ? c.primary : c.subtext}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    {...textInputProps}
                    style={[
                        styles.input,
                        {
                            color: c.text,
                            flex: 1,
                        },
                    ]}
                    placeholderTextColor={c.subtext}
                    onFocus={(e) => {
                        setIsFocused(true);
                        textInputProps.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        textInputProps.onBlur?.(e);
                    }}
                />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        height: 60,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    error: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 4,
    },
});
