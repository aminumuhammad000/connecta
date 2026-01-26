import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useThemeColors } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import * as messageService from '../services/messageService';
import * as collaboService from '../services/collaboService';
import * as proposalService from '../services/proposalService';
import { useAuth } from '../context/AuthContext';
import { Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatsScreen({ navigation }: any) {
    const c = useThemeColors();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [collaboChats, setCollaboChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const fetchConversations = async () => {
        try {
            if (!user?._id) return;

            // Fetch regular conversations
            const convData = await messageService.getUserConversations(user._id);
            setConversations(Array.isArray(convData) ? convData : []);

            // Fetch collabo projects based on user type
            let collaboData = [];
            try {
                if (user.userType === 'client') {
                    collaboData = await collaboService.getMyCollaboProjects();
                } else {
                    collaboData = await collaboService.getFreelancerCollaboProjects();
                }
            } catch (collaboError) {
                console.log('No collabo projects found:', collaboError);
            }

            setCollaboChats(Array.isArray(collaboData) ? collaboData : []);

            // Fetch clients for new chat if user is freelancer
            if (user.userType === 'freelancer') {
                fetchClients();
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
            setCollaboChats([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchClients = async () => {
        try {
            setLoadingClients(true);
            const proposals = await proposalService.getFreelancerProposals(user!._id);

            // Extract unique clients from proposals
            const uniqueClientsMap = new Map();
            proposals.forEach((p: any) => {
                if (p.clientId && p.clientId._id) {
                    uniqueClientsMap.set(p.clientId._id, p.clientId);
                }
            });

            setClients(Array.from(uniqueClientsMap.values()));
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoadingClients(false);
        }
    };

    const startNewChat = (client: any) => {
        setShowNewChatModal(false);
        navigation.navigate('MessagesDetail', {
            receiverId: client._id,
            userName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client',
            userAvatar: client.profileImage || client.avatar
        });
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

    // Combine regular conversations and collabo chats
    const allChats = [
        ...conversations.map(c => ({ ...c, type: 'conversation' })),
        ...collaboChats.map(c => ({ ...c, type: 'collabo' }))
    ];

    const filteredConversations = allChats.filter(conv => {
        if (conv.type === 'collabo') {
            const projectTitle = conv.title || '';
            return projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
        }

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
        // Handle collabo team chats
        if (item.type === 'collabo') {
            const teamSize = item.roles?.filter((r: any) => r.status === 'filled').length || 0;
            const totalRoles = item.roles?.length || 0;

            return (
                <TouchableOpacity
                    style={[styles.conversationItem, { backgroundColor: c.card, borderColor: c.border }]}
                    onPress={() => navigation.navigate('CollaboWorkspace', { projectId: item._id })}
                >
                    <View style={[styles.avatar, { backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="people" size={28} color={c.primary} />
                    </View>
                    <View style={styles.conversationDetails}>
                        <View style={styles.row}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                                <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>TEAM</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text numberOfLines={1} style={[styles.lastMessage, { color: c.subtext }]}>
                                {teamSize}/{totalRoles} members • {item.status || 'Active'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        // Regular conversation
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

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={{ flex: 1, maxWidth: isDesktop ? 1200 : '100%', width: '100%', alignSelf: 'center' }}>
                <View style={[styles.header, { borderBottomColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={c.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: c.text }]}>Chats</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => user?.userType === 'freelancer' ? setShowNewChatModal(true) : navigation.navigate('PublicFreelancerSearch')}
                        style={[styles.newChatBtn, { backgroundColor: c.primary }]}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
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

                {user?.userType === 'freelancer' && clients.length > 0 && (
                    <View style={styles.quickChatContainer}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Start a Conversation</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={clients}
                            keyExtractor={item => `quick-${item._id}`}
                            contentContainerStyle={styles.quickChatList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.quickChatItem}
                                    onPress={() => startNewChat(item)}
                                >
                                    <View style={styles.quickAvatarWrapper}>
                                        <Avatar
                                            uri={item.profileImage || item.avatar}
                                            name={`${item.firstName} ${item.lastName}`}
                                            size={60}
                                        />
                                        <View style={[styles.onlineIndicator, { backgroundColor: '#10B981', borderColor: c.background }]} />
                                    </View>
                                    <Text style={[styles.quickName, { color: c.text }]} numberOfLines={1}>
                                        {item.firstName}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

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
                )
                }

                {/* New Chat Modal */}
                <Modal
                    visible={showNewChatModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowNewChatModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                            <BlurView intensity={80} tint={c.isDark ? 'dark' : 'light'} style={styles.modalHeaderBlur}>
                                <LinearGradient
                                    colors={[c.primary, c.primary + 'CC']}
                                    style={styles.modalHeaderGradient}
                                >
                                    <View style={styles.modalHeaderRow}>
                                        <Text style={styles.modalTitle}>New Chat</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowNewChatModal(false)}
                                            style={styles.closeBtn}
                                        >
                                            <Ionicons name="close" size={24} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.modalSearchBox}>
                                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                                        <TextInput
                                            style={styles.modalSearchInput}
                                            placeholder="Search clients..."
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            value={clientSearch}
                                            onChangeText={setClientSearch}
                                        />
                                    </View>
                                </LinearGradient>
                            </BlurView>

                            <View style={styles.clientListContainer}>
                                <Text style={[styles.sectionLabel, { color: c.subtext }]}>CLIENTS FROM PROPOSALS</Text>

                                {loadingClients ? (
                                    <ActivityIndicator size="small" color={c.primary} style={{ marginTop: 20 }} />
                                ) : (
                                    <FlatList
                                        data={clients.filter(cl =>
                                            `${cl.firstName} ${cl.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
                                        )}
                                        keyExtractor={item => item._id}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.clientItem}
                                                onPress={() => startNewChat(item)}
                                            >
                                                <Avatar
                                                    uri={item.profileImage || item.avatar}
                                                    name={`${item.firstName} ${item.lastName}`}
                                                    size={44}
                                                />
                                                <View style={styles.clientInfo}>
                                                    <Text style={[styles.clientName, { color: c.text }]}>
                                                        {item.firstName} {item.lastName}
                                                    </Text>
                                                    <Text style={[styles.clientSub, { color: c.subtext }]}>
                                                        {item.email}
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color={c.border} />
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={
                                            <View style={styles.emptyClients}>
                                                <Text style={{ color: c.subtext }}>No clients found</Text>
                                            </View>
                                        }
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
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
    newChatBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '88%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    modalHeaderBlur: {
        width: '100%',
    },
    modalHeaderGradient: {
        padding: 24,
        paddingBottom: 32,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    modalSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 12,
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    clientListContainer: {
        flex: 1,
        padding: 20,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 16,
    },
    clientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    clientInfo: {
        flex: 1,
        marginLeft: 16,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '700',
    },
    clientSub: {
        fontSize: 13,
        marginTop: 2,
    },
    emptyClients: {
        alignItems: 'center',
        padding: 40,
    },
    quickChatContainer: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginLeft: 16,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
    quickChatList: {
        paddingHorizontal: 12,
    },
    quickChatItem: {
        alignItems: 'center',
        width: 80,
        marginHorizontal: 4,
    },
    quickAvatarWrapper: {
        position: 'relative',
        padding: 3,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#FD6730',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    quickName: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    }
});
