import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useThemeColors } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import * as messageService from '../services/messageService';
import { useAuth } from '../context/AuthContext';

export default function ChatsScreen({ navigation }: any) {
    const c = useThemeColors();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const fetchConversations = async () => {
        try {
            if (!user?._id) return;

            const data = await messageService.getUserConversations(user._id);
            setConversations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const handleConversationPress = (conversation: any) => {
        // Determine the other user
        let otherUser;
        if (conversation.participants && conversation.participants.length > 0) {
            otherUser = conversation.participants.find((p: any) => p._id !== user?._id);
        }
        if (!otherUser) {
            otherUser = conversation.clientId?._id === user?._id
                ? conversation.freelancerId
                : conversation.clientId;
        }

        navigation.navigate('MessagesDetail', {
            conversationId: conversation._id,
            userName: `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User',
            userAvatar: otherUser?.profileImage || otherUser?.avatar,
            receiverId: otherUser?._id // Pass receiverId to help MessagesScreen if needed
        });
    };

    const filteredConversations = conversations.filter(conv => {
        let otherUser;
        if (conv.participants && conv.participants.length > 0) {
            otherUser = conv.participants.find((p: any) => p._id !== user?._id);
        }
        if (!otherUser) {
            const client = conv.clientId;
            const freelancer = conv.freelancerId;
            otherUser = client?._id === user?._id ? freelancer : client;
        }
        const name = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const renderItem = ({ item }: { item: any }) => {
        // Determine the other user
        let otherUser;

        // Strategy 1: Check participants array (new generic chats)
        if (item.participants && item.participants.length > 0) {
            otherUser = item.participants.find((p: any) => p._id !== user?._id);
        }

        // Strategy 2: Fallback to legacy clientId/freelancerId
        if (!otherUser) {
            otherUser = item.clientId?._id === user?._id
                ? item.freelancerId
                : item.clientId;
        }

        const name = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User';
        const lastMsg = item.lastMessage || 'No messages';
        const time = item.lastMessageAt
            ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
        const unread = item.unreadCount?.[user?._id || ''] || 0;
        const isPremium = otherUser?.isPremium;

        return (
            <TouchableOpacity
                style={[styles.conversationItem, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => handleConversationPress(item)}
            >
                <View style={styles.avatar}>
                    <Avatar uri={otherUser?.profileImage || otherUser?.avatar || undefined} name={name} size={50} />
                </View>
                <View style={styles.conversationDetails}>
                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{name}</Text>
                            {isPremium && (
                                <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
                            )}
                        </View>
                        <Text style={[styles.time, { color: c.subtext, marginLeft: 8 }]}>{time}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text numberOfLines={1} style={[styles.lastMessage, { color: c.subtext }]}>
                            {lastMsg}
                        </Text>
                        {unread > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: c.primary }]}>
                                <Text style={styles.unreadText}>{unread}</Text>
                            </View>
                        )}
                    </View>
                    {item.projectId && (
                        <View style={styles.projectTag}>
                            <Ionicons name="briefcase-outline" size={12} color={c.primary} />
                            <Text style={[styles.projectTitle, { color: c.primary }]}>{item.projectId.title}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <Text style={[styles.headerTitle, { color: c.text }]}>Chats</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Ionicons name="search" size={20} color={c.subtext} />
                    <TextInput
                        style={[styles.searchInput, { color: c.text }]}
                        placeholder="Search conversations..."
                        placeholderTextColor={c.subtext}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color={c.subtext} />
                            <Text style={[styles.emptyText, { color: c.subtext }]}>No conversations yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
    },
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
        fontSize: 16,
    },
    listContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    conversationDetails: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    projectTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    projectTitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});
