import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useThemeColors } from '../theme/theme';

// Mock data for conversations
const MOCK_CONVERSATIONS = [
    {
        _id: '1',
        participants: [
            { _id: 'u2', firstName: 'Cameron', lastName: 'Williamson', profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBL5PbqSun56WA-UjupXWGWeuaDbSTOR1IRDiKb4clTLqdFRGbNjuNuIQOfa9N--K5Oph-Wn95F62EOpGONs4EJksFyqqQcRLPDaLPdwoqIxt5dhSK-5qXgSxRHiwv4Xp5xsuP5bfTiemssdp_wbmItn8PQaixxiUzPGmh4nzpJryGSi-f4aVzU06PzTTL0vlMWpUEu3oE3HKQGt2gxacDtsXm-94mZ9bVQami9u3E0Yngr0p0XfcEkHFIOFVMlSbBBBruLPPp87E' }
        ],
        lastMessage: { text: "I'm available this afternoon after 2 PM.", createdAt: new Date().toISOString(), senderId: 'u1' },
        unreadCount: { 'u1': 0 },
        projectId: { title: 'E-commerce App' }
    },
    {
        _id: '2',
        participants: [
            { _id: 'u3', firstName: 'Esther', lastName: 'Howard', profileImage: null }
        ],
        lastMessage: { text: "Please check the latest designs.", createdAt: new Date(Date.now() - 86400000).toISOString(), senderId: 'u3' },
        unreadCount: { 'u1': 2 },
        projectId: { title: 'Website Redesign' }
    }
];

export default function ChatsScreen({ navigation }: any) {
    const c = useThemeColors();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        // Simulate fetch
        setTimeout(() => {
            setConversations(MOCK_CONVERSATIONS);
            setLoading(false);
        }, 1000);
    };

    const handleConversationPress = (conversation: any) => {
        const otherUser = conversation.participants[0]; // Simplified
        navigation.navigate('MessagesDetail', {
            conversationId: conversation._id,
            userName: `${otherUser.firstName} ${otherUser.lastName}`,
            userAvatar: otherUser.profileImage
        });
    };

    const filteredConversations = conversations.filter(conv => {
        const name = `${conv.participants[0].firstName} ${conv.participants[0].lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const renderItem = ({ item }: { item: any }) => {
        const otherUser = item.participants[0];
        const name = `${otherUser.firstName} ${otherUser.lastName}`;
        const lastMsg = item.lastMessage?.text || 'No messages';
        const time = new Date(item.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const unread = item.unreadCount['u1'] || 0;

        return (
            <TouchableOpacity
                style={[styles.conversationItem, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => handleConversationPress(item)}
            >
                <View style={styles.avatar}>
                    <Avatar uri={otherUser.profileImage || undefined} name={name} size={50} />
                </View>
                <View style={styles.conversationDetails}>
                    <View style={styles.row}>
                        <Text style={[styles.name, { color: c.text }]}>{name}</Text>
                        <Text style={[styles.time, { color: c.subtext }]}>{time}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text numberOfLines={1} style={[styles.lastMessage, { color: c.subtext }]}>
                            {item.lastMessage?.senderId === 'u1' ? 'You: ' : ''}{lastMsg}
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
