import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const c = useThemeColors();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: c.text }]}>About Connecta</Text>
                <Text style={[styles.text, { color: c.subtext }]}>Version 1.0.0</Text>
                <Text style={[styles.text, { color: c.subtext, marginTop: 10 }]}>
                    Connecta is the leading platform for freelancers and clients.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    text: { fontSize: 16, textAlign: 'center' },
});
