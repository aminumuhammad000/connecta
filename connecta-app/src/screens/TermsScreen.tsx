import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
    const c = useThemeColors();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: c.text }]}>Terms & Conditions</Text>
                <Text style={[styles.text, { color: c.subtext }]}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    text: { fontSize: 16, lineHeight: 24 },
});
