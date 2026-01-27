import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../utils/constants';

const PublicFreelancerSearchScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [query, setQuery] = useState(route.params?.initialQuery || '');
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (route.params?.initialQuery) {
            searchFreelancers(route.params.initialQuery);
        }
    }, [route.params?.initialQuery]);

    const searchFreelancers = async (searchQuery?: string) => {
        const q = searchQuery || query;
        if (!q.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users?userType=freelancer&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.success) {
                setFreelancers(data.data);
            } else {
                setFreelancers([]);
            }
        } catch (error) {
            console.error("Search error", error);
            setFreelancers([]);
        } finally {
            setLoading(false);
        }
    };

    const renderFreelancerItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PublicFreelancerProfile', { id: item._id })}>
            <Image
                source={{ uri: item.profilePicture || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=random` }}
                style={styles.avatar}
            />
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                    {item.isVerified && <Ionicons name="checkmark-circle" size={16} color="#FD6730" />}
                </View>
                <Text style={styles.profession}>{item.profession || 'Freelancer'}</Text>

                <View style={styles.skillsRow}>
                    {item.skills?.slice(0, 3).map((skill: string, index: number) => (
                        <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                    {item.skills?.length > 3 && (
                        <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    <View style={styles.ratingBox}>
                        <Ionicons name="star" size={14} color="#F6E05E" />
                        <Text style={styles.rating}>4.9</Text>
                    </View>
                    <Text style={styles.rate}>From ₦{item.hourlyRate || '5,000'}/hr</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Find Talent (e.g. Designer)..."
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => searchFreelancers()}
                        returnKeyType="search"
                        autoFocus={!route.params?.initialQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Feather name="x" size={18} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FD6730" />
                </View>
            ) : (
                <FlatList
                    data={freelancers}
                    renderItem={renderFreelancerItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        hasSearched ? (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No freelancers found for "{query}"</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Feather name="users" size={48} color="#ddd" />
                                <Text style={styles.emptyText}>Search for top talent</Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    profession: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    skillTag: {
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    skillText: {
        fontSize: 12,
        color: '#4A5568',
    },
    moreSkills: {
        fontSize: 12,
        color: '#A0AEC0',
        alignSelf: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A5568',
    },
    rate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FD6730',
    },
    emptyText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
});

export default PublicFreelancerSearchScreen;
