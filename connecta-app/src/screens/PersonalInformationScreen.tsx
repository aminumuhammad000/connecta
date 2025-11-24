import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function PersonalInformationScreen({ navigation }: any) {
    const c = useThemeColors();
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [phone, setPhone] = useState('+1 (555) 123-4567');
    const [location, setLocation] = useState('San Francisco, CA');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Personal Information</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Full Name</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={[styles.input, { color: c.text }]}
                            placeholderTextColor={c.subtext}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Email Address</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            style={[styles.input, { color: c.text }]}
                            keyboardType="email-address"
                            placeholderTextColor={c.subtext}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Phone Number</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            style={[styles.input, { color: c.text }]}
                            keyboardType="phone-pad"
                            placeholderTextColor={c.subtext}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: c.subtext }]}>Location</Text>
                    <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={[styles.input, { color: c.text }]}
                            placeholderTextColor={c.subtext}
                        />
                    </View>
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: c.primary }]}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputWrap: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    input: {
        height: 48,
        fontSize: 15,
    },
    saveButton: {
        marginTop: 24,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
