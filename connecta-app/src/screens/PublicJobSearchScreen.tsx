import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../utils/constants';

const PublicJobSearchScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [query, setQuery] = useState(route.params?.initialQuery || '');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (route.params?.initialQuery) {
            searchJobs(route.params.initialQuery);
        }
    }, [route.params?.initialQuery]);

    const searchJobs = async (searchQuery?: string) => {
        const q = searchQuery || query;
        if (!q.trim()) return;
        setLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/jobs/search?q=${encodeURIComponent(q)}&isExternal=false`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("Search error", error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const renderJobItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.jobCard} onPress={() => navigation.navigate('PublicJobDetail', { id: item._id })}>
            <View style={styles.jobHeader}>
                <View style={styles.iconBox}>
                    <Feather name="briefcase" size={20} color="#666" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.companyName}>{item.company || 'Confidential'}</Text>
                </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.footer}>
                <Text style={styles.budget}>
                    {item.budget ? `₦${item.budget.toLocaleString()}` : 'Negotiable'}
                </Text>
                <Text style={styles.time}>Active</Text>
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
                        placeholder="Search jobs..."
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => searchJobs()}
                        returnKeyType="search"
                        autoFocus
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
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        hasSearched ? (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No jobs found matching "{query}"</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Feather name="search" size={48} color="#ddd" />
                                <Text style={styles.emptyText}>Search for jobs</Text>
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
    jobCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    companyName: {
        fontSize: 14,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
        paddingTop: 8,
    },
    budget: {
        fontWeight: '700',
        color: '#2D3748',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
});

export default PublicJobSearchScreen;
