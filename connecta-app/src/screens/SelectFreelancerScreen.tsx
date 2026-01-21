import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { get } from '../services/api';
import { useInAppAlert } from '../components/InAppAlert';

export default function SelectFreelancerScreen({ navigation, route }: any) {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const { roleId, projectId, onSelect } = route.params;

    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const fetchFreelancers = async () => {
        try {
            const response: any = await get('/api/users/freelancers');
            console.log('Freelancers response:', response);
            // Handle { success: true, data: [...] } or direct array [...]
            const list = Array.isArray(response) ? response : (response.data || []);
            setFreelancers(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            showAlert({ title: 'Error', message: 'Failed to load freelancers', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredFreelancers = freelancers.filter(f => {
        const name = `${f.firstName} ${f.lastName}`.toLowerCase();
        const skills = f.skills?.join(' ').toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || skills.includes(query);
    });

    const handleSelect = (freelancer: any) => {
        if (onSelect) {
            onSelect(freelancer);
            navigation.goBack();
        } else {
            // Navigate back with params (clearer pattern)
            navigation.navigate({
                name: 'CollaboWorkspace',
                params: { selectedFreelancer: freelancer, targetRoleId: roleId, projectId },
                merge: true,
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.freelancerCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => handleSelect(item)}
        >
            <Avatar uri={item.profileImage || item.avatar} name={`${item.firstName} ${item.lastName}`} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: c.text }]}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.title, { color: c.subtext }]} numberOfLines={1}>
                    {item.title || 'Freelancer'}
                </Text>
                {item.skills && item.skills.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {item.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <View key={idx} style={{ backgroundColor: c.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ color: c.primary, fontSize: 11, fontWeight: '600' }}>{skill}</Text>
                            </View>
                        ))}
                        {item.skills.length > 3 && (
                            <Text style={{ color: c.subtext, fontSize: 11 }}>+{item.skills.length - 3}</Text>
                        )}
                    </View>
                )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color={c.subtext} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Select Freelancer</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={{ padding: 16 }}>
                <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
                    <MaterialIcons name="search" size={20} color={c.subtext} />
                    <TextInput
                        style={[styles.searchInput, { color: c.text }]}
                        placeholder="Search by name or skills..."
                        placeholderTextColor={c.subtext}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredFreelancers}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingTop: 0 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', padding: 40 }}>
                            <MaterialIcons name="person-search" size={48} color={c.subtext} />
                            <Text style={{ color: c.subtext, marginTop: 12 }}>No freelancers found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
    },
    freelancerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    title: {
        fontSize: 14,
        marginTop: 2,
    },
});
