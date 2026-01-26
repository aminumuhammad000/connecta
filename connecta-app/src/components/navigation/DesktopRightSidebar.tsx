import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as messageService from '../../services/messageService';
import Avatar from '../Avatar';

const DesktopRightSidebar = () => {
    const c = useThemeColors();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiQuery, setAiQuery] = useState('');

    useEffect(() => {
        if (user?._id) {
            fetchRecentChats();
        }
    }, [user]);

    const fetchRecentChats = async () => {
        try {
            const data = await messageService.getUserConversations(user!._id);
            if (Array.isArray(data)) {
                // Take top 3
                setConversations(data.slice(0, 3));
            }
        } catch (error) {
            console.error('Failed to load specific sidebar chats', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatPress = (conv: any) => {
        // Same logic as ChatsScreen to find other user
        let otherUser;
        if (conv.participants && conv.participants.length > 0) {
            otherUser = conv.participants.find((p: any) => p._id !== user?._id);
        }
        if (!otherUser) {
            otherUser = conv.clientId?._id === user?._id
                ? conv.freelancerId
                : conv.clientId;
        }

        navigation.navigate('MessagesDetail', {
            conversationId: conv._id,
            userName: `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User',
            userAvatar: otherUser?.profileImage || otherUser?.avatar,
            receiverId: otherUser?._id
        });
    };

    const handleAiSubmit = () => {
        // Navigate to AI screen, passing the query if possible (or just open it)
        navigation.navigate('ConnectaAI', { initialQuery: aiQuery });
        setAiQuery('');
    };

    return (
        <View style={styles.container}>
            {/* Connecta AI Widget */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialIcons name="auto-awesome" size={16} color={c.primary} />
                        <Text style={[styles.cardTitle, { color: c.text }]}>Connecta AI</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                </View>

                <Text style={[styles.aiDescription, { color: c.subtext }]}>
                    Ask me to find jobs, optimize your profile, or write proposals.
                </Text>

                <View style={[styles.aiInputContainer, { backgroundColor: c.background, borderColor: c.border }]}>
                    <TextInput
                        placeholder="Ask Connecta AI..."
                        placeholderTextColor={c.subtext}
                        style={[styles.aiInput, { color: c.text }]}
                        value={aiQuery}
                        onChangeText={setAiQuery}
                        onSubmitEditing={handleAiSubmit}
                    />
                    <TouchableOpacity onPress={handleAiSubmit} style={styles.aiSendBtn}>
                        <Ionicons name="arrow-up-circle" size={24} color={aiQuery ? c.primary : c.subtext} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Messages */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>Recent Messages</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('FreelancerTabs', { screen: 'Messages' })}>
                        <Text style={[styles.seeAllLink, { color: c.primary }]}>View all</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color={c.primary} />
                ) : conversations.length > 0 ? (
                    <View style={styles.list}>
                        {conversations.map((conv, index) => {
                            let otherUser;
                            if (conv.participants && conv.participants.length > 0) {
                                otherUser = conv.participants.find((p: any) => p._id !== user?._id);
                            } else {
                                otherUser = conv.clientId?._id === user?._id ? conv.freelancerId : conv.clientId;
                            }

                            const name = `${otherUser?.firstName || 'User'} ${otherUser?.lastName || ''}`;
                            const lastMsg = conv.lastMessage || 'Start a conversation';

                            return (
                                <TouchableOpacity key={conv._id} style={styles.messageItem} onPress={() => handleChatPress(conv)}>
                                    <Avatar
                                        uri={otherUser?.profileImage || otherUser?.avatar}
                                        name={name}
                                        size={40}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.msgName, { color: c.text }]} numberOfLines={1}>{name}</Text>
                                        <Text style={[styles.msgPreview, { color: c.subtext }]} numberOfLines={1}>
                                            {conv.lastSenderId === user?._id ? 'You: ' : ''}{lastMsg}
                                        </Text>
                                    </View>
                                    {(conv.unreadCount?.[user?._id || ''] || 0) > 0 && (
                                        <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: c.subtext, fontSize: 13 }}>No recent messages</Text>
                    </View>
                )}
            </View>

            {/* Footer Links */}
            <View style={styles.footer}>
                <View style={styles.copyrightRow}>
                    <Image source={require('../../../assets/logo.png')} style={{ width: 14, height: 14, opacity: 0.6 }} />
                    <Text style={[styles.copyright, { color: c.text }]}>Connecta © 2026</Text>
                </View>
                <View style={styles.footerLinks}>
                    <Text style={[styles.footerLink, { color: c.subtext }]}>Privacy</Text>
                    <Text style={[styles.footerLink, { color: c.subtext }]}>Terms</Text>
                    <Text style={[styles.footerLink, { color: c.subtext }]}>Help</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 300,
        gap: 20,
    },
    card: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        padding: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    aiDescription: {
        fontSize: 13,
        marginBottom: 16,
        lineHeight: 18,
    },
    aiInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 12,
        paddingRight: 4,
        height: 40,
    },
    aiInput: {
        flex: 1,
        fontSize: 13,
        height: '100%',
        // @ts-ignore
        outlineStyle: 'none'
    },
    aiSendBtn: {
        padding: 4,
    },
    seeAllLink: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    msgName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    msgPreview: {
        fontSize: 12,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    copyrightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    copyright: {
        fontSize: 11,
        fontWeight: '600',
    },
    footerLinks: {
        flexDirection: 'row',
        gap: 12,
    },
    footerLink: {
        fontSize: 11,
    }
});

export default DesktopRightSidebar;
