import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, Platform } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { countries, Country } from '../utils/countries';

interface CountryPickerProps {
    visible: boolean;
    onSelect: (country: Country) => void;
    onClose: () => void;
}

const CountryPicker: React.FC<CountryPickerProps> = ({ visible, onSelect, onClose }) => {
    const c = useThemeColors();
    const [search, setSearch] = useState('');

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: c.card }]}>
                    <View style={[styles.header, { borderBottomColor: c.border }]}>
                        <Text style={[styles.title, { color: c.text }]}>Select Country</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={c.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: c.background, borderColor: c.border }]}>
                        <Ionicons name="search" size={20} color={c.subtext} />
                        <TextInput
                            style={[styles.searchInput, { color: c.text }]}
                            placeholder="Search country..."
                            placeholderTextColor={c.subtext}
                            value={search}
                            onChangeText={setSearch}
                            autoFocus={Platform.OS !== 'web'}
                        />
                    </View>

                    <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.countryItem, { borderBottomColor: c.border }]}
                                onPress={() => {
                                    onSelect(item);
                                    setSearch('');
                                }}
                            >
                                <Text style={styles.emoji}>{item.emoji}</Text>
                                <Text style={[styles.countryName, { color: c.text }]}>{item.name}</Text>
                                <Text style={[styles.countryCode, { color: c.subtext }]}>{item.code}</Text>
                            </TouchableOpacity>
                        )}
                        initialNumToRender={20}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        height: '80%',
        maxWidth: 600,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 20,
        ...Platform.select({
            web: {
                height: '90%',
                marginTop: '5%',
                borderRadius: 30,
            }
        })
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    emoji: {
        fontSize: 24,
        marginRight: 16,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    countryCode: {
        fontSize: 14,
    },
});

export default CountryPicker;
