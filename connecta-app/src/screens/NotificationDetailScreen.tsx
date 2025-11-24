import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Notification = {
    id: string;
    title: string;
    description: string;
    time: string;
};

type Props = {
    navigation: NativeStackNavigationProp<any, any>;
    route: { params: { notification: Notification } };
};

export default function NotificationDetailScreen({ navigation, route }: Props) {
    const c = useThemeColors();
    const { notification } = route.params;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Notification</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.title, { color: c.text }]}>{notification.title}</Text>
                <Text style={[styles.time, { color: c.subtext }]}>{notification.time}</Text>
                <Text style={[styles.description, { color: c.subtext }]}>{notification.description}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    backButton: { padding: 4 },
    headerTitle: { marginLeft: 12, fontSize: 20, fontWeight: '600' },
    card: { margin: 16, padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    time: { fontSize: 12, marginBottom: 12 },
    description: { fontSize: 14 },
});
