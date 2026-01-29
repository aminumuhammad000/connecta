import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { getAllCountries, getStatesForCountry, formatLocation, parseLocation } from '../utils/countries';

interface LocationPickerProps {
    value: string; // Full location string like "Lagos, Nigeria"
    onValueChange: (location: string) => void;
    label?: string;
}

const LocationPickerSeparate: React.FC<LocationPickerProps> = ({ value, onValueChange, label = 'Location' }) => {
    const c = useThemeColors();
    const [showCountrySheet, setShowCountrySheet] = useState(false);
    const [showStateSheet, setShowStateSheet] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Parse current value
    const parsed = parseLocation(value);
    const [selectedCountry, setSelectedCountry] = useState(parsed.country);
    const [selectedState, setSelectedState] = useState(parsed.state);

    // Update when value changes externally
    useEffect(() => {
        const newParsed = parseLocation(value);
        setSelectedCountry(newParsed.country);
        setSelectedState(newParsed.state);
    }, [value]);

    const allCountries = getAllCountries();
    const statesForCountry = selectedCountry ? getStatesForCountry(selectedCountry) : [];

    const filteredCountries = searchQuery
        ? allCountries.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        : allCountries;

    const filteredStates = searchQuery
        ? statesForCountry.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : statesForCountry;

    const handleCountrySelect = (country: string) => {
        setSelectedCountry(country);
        setSelectedState(''); // Reset state when country changes
        setShowCountrySheet(false);
        setSearchQuery('');

        // If this country has no states, set location immediately
        const states = getStatesForCountry(country);
        if (states.length === 1 && states[0] === 'Other') {
            onValueChange(country);
        }
    };

    const handleStateSelect = (state: string) => {
        setSelectedState(state);
        setShowStateSheet(false);
        setSearchQuery('');

        // Format and update location
        const formattedLocation = formatLocation(state, selectedCountry);
        onValueChange(formattedLocation);
    };

    return (
        <View>
            {label && <Text style={[styles.sectionLabel, { color: c.subtext }]}>{label}</Text>}

            <View style={styles.row}>
                {/* Country Selector */}
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.fieldLabel, { color: c.subtext }]}>COUNTRY</Text>
                    <TouchableOpacity
                        style={[styles.selector, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => setShowCountrySheet(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.selectorText, { color: selectedCountry ? c.text : c.subtext }]}>
                            {selectedCountry || 'Select country'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={c.subtext} />
                    </TouchableOpacity>
                </View>

                {/* State Selector */}
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.fieldLabel, { color: c.subtext }]}>STATE</Text>
                    <TouchableOpacity
                        style={[
                            styles.selector,
                            {
                                backgroundColor: c.card,
                                borderColor: c.border,
                                opacity: selectedCountry ? 1 : 0.5
                            }
                        ]}
                        onPress={() => selectedCountry && setShowStateSheet(true)}
                        activeOpacity={0.7}
                        disabled={!selectedCountry}
                    >
                        <Text style={[styles.selectorText, { color: selectedState ? c.text : c.subtext }]} numberOfLines={1}>
                            {selectedState || (selectedCountry ? 'State' : 'N/A')}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={c.subtext} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Country Modal */}
            <Modal
                visible={showCountrySheet}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowCountrySheet(false);
                    setSearchQuery('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>Select Country</Text>
                            <TouchableOpacity onPress={() => {
                                setShowCountrySheet(false);
                                setSearchQuery('');
                            }} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Ionicons name="search" size={20} color={c.subtext} />
                            <TextInput
                                style={[styles.searchInput, { color: c.text }]}
                                placeholder="Search countries..."
                                placeholderTextColor={c.subtext}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <ScrollView style={styles.listContainer}>
                            {filteredCountries.map((country) => (
                                <TouchableOpacity
                                    key={country}
                                    style={[
                                        styles.option,
                                        selectedCountry === country && { backgroundColor: c.isDark ? 'rgba(253,103,48,0.1)' : '#FFF5F0' }
                                    ]}
                                    onPress={() => handleCountrySelect(country)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: selectedCountry === country ? c.primary : c.text }
                                    ]}>
                                        {country}
                                    </Text>
                                    {selectedCountry === country && (
                                        <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* State Modal */}
            <Modal
                visible={showStateSheet}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowStateSheet(false);
                    setSearchQuery('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>Select State/Region ({selectedCountry})</Text>
                            <TouchableOpacity onPress={() => {
                                setShowStateSheet(false);
                                setSearchQuery('');
                            }} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Ionicons name="search" size={20} color={c.subtext} />
                            <TextInput
                                style={[styles.searchInput, { color: c.text }]}
                                placeholder="Search states..."
                                placeholderTextColor={c.subtext}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <ScrollView style={styles.listContainer}>
                            {filteredStates.map((state) => (
                                <TouchableOpacity
                                    key={state}
                                    style={[
                                        styles.option,
                                        selectedState === state && { backgroundColor: c.isDark ? 'rgba(253,103,48,0.1)' : '#FFF5F0' }
                                    ]}
                                    onPress={() => handleStateSelect(state)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: selectedState === state ? c.primary : c.text }
                                    ]}>
                                        {state}
                                    </Text>
                                    {selectedState === state && (
                                        <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
    },
    fieldContainer: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    selectorText: {
        flex: 1,
        fontSize: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    listContainer: {
        maxHeight: 400,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    optionText: {
        fontSize: 15,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
});

export default LocationPickerSeparate;
