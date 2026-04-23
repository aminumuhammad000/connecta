import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useThemeColors } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import * as messageService from '../services/messageService';
import * as proposalService from '../services/proposalService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatsScreen({ navigation }: any) {
    const c = useThemeColors();
    const { user } = useAuth();
    const { onlineUsers } = useSocket();
    const [conversations, setConversations] = useState<any[]>([]);
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
            const convData = await messageService.getUserConversations();
            setConversations(Array.isArray(convData) ? convData : []);


            // Fetch clients for new chat if user is freelancer
            if (user.userType === 'freelancer') {
                fetchClients();
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
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

    const handleConversationPress = (item: any) => {
        const otherUser = item.otherUser;
        navigation.navigate('MessagesDetail', {
            conversationId: item._id,
            userName: `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User',
            userAvatar: otherUser?.profileImage || otherUser?.avatar,
            receiverId: otherUser?._id,
            projectId: item.projectId?._id || item.projectId
        });
    };

    const groupedChats = React.useMemo(() => {
        const groups = new Map<string, any>();
        
        conversations.forEach(conv => {
            let otherUser;
            const currentUserId = user?._id?.toString();
            
            if (conv.participants && conv.participants.length > 0) {
                otherUser = conv.participants.find((p: any) => {
                    const pId = (p._id || p).toString();
                    return pId !== currentUserId;
                });
            }
            
            if (!otherUser) {
                const client = conv.clientId;
                const freelancer = conv.freelancerId;
                const clientId = (client?._id || client)?.toString();
                otherUser = clientId === currentUserId ? freelancer : client;
            }
            
            if (!otherUser) return;
            
            const otherId = otherUser._id;
            const unread = conv.unreadCount?.[user?._id || ''] || 0;
            
            if (groups.has(otherId)) {
                // merge
                const existing = groups.get(otherId);
                existing.unreadCountTotal = (existing.unreadCountTotal || 0) + unread;
                
                // take the latest message
                if (new Date(conv.lastMessageAt) > new Date(existing.lastMessageAt || 0)) {
                    existing._id = conv._id;
                    existing.lastMessage = conv.lastMessage;
                    existing.lastMessageAt = conv.lastMessageAt;
                    existing.projectId = conv.projectId;
                }
            } else {
                groups.set(otherId, {
                    ...conv,
                    otherUser,
                    unreadCountTotal: unread
                });
            }
        });
        
        return Array.from(groups.values()).sort((a, b) => 
            new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
    }, [conversations, user?._id]);

    const filteredConversations = groupedChats.filter(conv => {
        const name = `${conv.otherUser?.firstName || ''} ${conv.otherUser?.lastName || ''}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const renderItem = ({ item }: { item: any }) => {
        const otherUser = item.otherUser;

        const name = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User';
        const lastMsg = item.lastMessage || 'No messages';
        const time = item.lastMessageAt
            ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
        const unread = item.unreadCountTotal || 0;
        const isOnline = onlineUsers.includes(otherUser?._id);
        
        const isInternal = user?.userType === 'freelancer' && otherUser?.userType === 'client'; // Simple check, adapt if you have an isInternal flag on user

        return (
            <TouchableOpacity
                style={[styles.conversationItem, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <Avatar 
                        uri={otherUser?.profileImage || otherUser?.avatar || undefined} 
                        name={name} 
                        size={56} 
                    />
                    {isOnline && (
                        <View style={[styles.onlineStatus, { backgroundColor: '#10B981', borderColor: c.card }]} />
                    )}
                </View>
                
                <View style={styles.conversationDetails}>
                    <View style={styles.row}>
                        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{name}</Text>
                        <Text style={[styles.time, { color: c.subtext }]}>{time}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Text numberOfLines={1} style={[styles.lastMessage, { color: unread > 0 ? c.text : c.subtext, fontWeight: unread > 0 ? '700' : '400' }]}>
                            {lastMsg}
                        </Text>
                        {unread > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: '#EF4444' }]}>
                                <Text style={styles.unreadText}>{unread}</Text>
                            </View>
                        )}
                    </View>
                    
                    {item.projectId && (
                        <View style={[styles.projectTag, { backgroundColor: c.primary + '10' }]}>
                             <MaterialIcons name="work-outline" size={12} color={c.primary} />
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
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} />
                        }
                        ListHeaderComponent={
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[styles.sectionTitle, { color: c.text, opacity: 0.5 }]}>Recent Messages</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={64} color={c.subtext} />
                                <Text style={[styles.emptyTitle, { color: c.text }]}>No Conversations Yet</Text>
                                <Text style={[styles.emptyText, { color: c.subtext }]}>
                                    {user?.userType === 'freelancer'
                                        ? "Once you start applying or chatting with clients, your messages will appear here."
                                        : "Find freelancers and start a conversation to see your chats here."}
                                </Text>
                                {user?.userType === 'freelancer' && (
                                    <TouchableOpacity
                                        style={[styles.emptyStateBtn, { backgroundColor: c.primary }]}
                                        onPress={() => navigation.navigate('Jobs')}
                                    >
                                        <Text style={styles.emptyStateBtnText}>Find Jobs</Text>
                                    </TouchableOpacity>
                                )}
                                {user?.userType === 'client' && (
                                    <TouchableOpacity
                                        style={[styles.emptyStateBtn, { backgroundColor: c.primary }]}
                                        onPress={() => navigation.navigate('PublicFreelancerSearch')}
                                    >
                                        <Text style={styles.emptyStateBtnText}>Find Freelancers</Text>
                                    </TouchableOpacity>
                                )}
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
                    <View style={[styles.modalOverlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={[
                            styles.modalContent,
                            { backgroundColor: c.background },
                            isDesktop && { width: '100%', maxWidth: 500, height: '70%', borderRadius: 24 }
                        ]}>
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
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    conversationDetails: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
        flex: 1,
    },
    time: {
        fontSize: 11,
        fontWeight: '600',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 12,
    },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '900',
    },
    projectTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    projectTitle: {
        fontSize: 11,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 20,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.6,
        lineHeight: 22,
    },
    emptyStateBtn: {
        marginTop: 32,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#FD6730',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    emptyStateBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    quickChatContainer: {
        paddingVertical: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 16,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    quickChatList: {
        paddingHorizontal: 16,
    },
    quickChatItem: {
        alignItems: 'center',
        width: 80,
        marginRight: 12,
    },
    quickAvatarWrapper: {
        position: 'relative',
        padding: 2,
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
        fontWeight: '700',
    }
});
