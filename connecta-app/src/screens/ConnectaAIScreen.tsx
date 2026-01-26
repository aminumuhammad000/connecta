import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Keyboard,
    ScrollView,
    Linking,
    LayoutAnimation,
    UIManager,
    Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import * as agentService from '../services/agentService';
import { useInAppAlert } from '../components/InAppAlert';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    responseType?: 'card' | 'list' | 'analytics' | 'text' | 'friendly_message';
    data?: any;
}

const { width } = Dimensions.get('window');

import * as storage from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Modal } from 'react-native';

// ...

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: Date;
}

export default function ConnectaAIScreen({ navigation }: any) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { showAlert } = useInAppAlert();

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Hello! I'm your Connecta AI assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const stored = await storage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert string dates back to Date objects
                const formatted = parsed.map((s: any) => ({
                    ...s,
                    updatedAt: new Date(s.updatedAt),
                    messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                }));
                setSessions(formatted);

                // If there are sessions, load the latest one? 
                // Or just start fresh but keep them in history.
            }
        } catch (e) {
            console.error('Failed to load sessions', e);
        }
    };

    const saveCurrentSession = async (updatedMessages: Message[]) => {
        try {
            const sessionTitle = updatedMessages.find(m => m.sender === 'user')?.text.substring(0, 30) || 'New Chat';
            const newSession: ChatSession = {
                id: currentSessionId,
                title: sessionTitle,
                messages: updatedMessages,
                updatedAt: new Date()
            };

            setSessions(prev => {
                const filtered = prev.filter(s => s.id !== currentSessionId);
                const updated = [newSession, ...filtered];
                storage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(updated));
                return updated;
            });
        } catch (e) {
            console.error('Failed to save session', e);
        }
    };

    const startNewChat = () => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setMessages([
            {
                id: 'welcome',
                text: "Hello! I'm your Connecta AI assistant. How can I help you today?",
                sender: 'ai',
                timestamp: new Date()
            }
        ]);
        setShowHistory(false);
    };

    const loadSession = (session: ChatSession) => {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        setShowHistory(false);
    };

    const deleteSession = async (id: string) => {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        await storage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(updated));
        if (currentSessionId === id) {
            startNewChat();
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);
        Keyboard.dismiss();

        try {
            if (!user?._id) throw new Error('User ID not found');

            const response = await agentService.sendMessageToAgent(text, user._id, user.userType);

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            if (response.success && response.result) {
                const result = response.result;
                const responseText = result.message || (typeof result.data === 'string' ? result.data : "I'm sorry, I couldn't process that request.");

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: typeof responseText === 'string' ? responseText : JSON.stringify(responseText),
                    sender: 'ai',
                    timestamp: new Date(),
                    responseType: result.responseType as any,
                    data: result.data
                };
                const finalMessages = [...updatedMessages, aiMsg];
                setMessages(finalMessages);
                saveCurrentSession(finalMessages);
            } else {
                throw new Error('AI failed to respond');
            }
        } catch (error: any) {
            console.error('AI Error:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to get response from AI',
                type: 'error'
            });
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, connection failed. Please try again.",
                sender: 'ai',
                timestamp: new Date()
            };
            const finalMessages = [...updatedMessages, errorMsg];
            setMessages(finalMessages);
            saveCurrentSession(finalMessages);
        } finally {
            setIsTyping(false);
        }
    };

    const renderJobCard = (job: any) => (
        <Card
            key={job.key || job._id || job.id}
            variant="elevated"
            style={StyleSheet.flatten([styles.card, { backgroundColor: c.card, borderColor: c.border, width: 260 }])}
        >
            <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{job.title}</Text>
            <Text style={[styles.cardSubtitle, { color: c.subtext }]} numberOfLines={1}>{job.company || 'Confidential'}</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Badge label={job.jobType || job.type || 'Fixed'} variant="neutral" size="small" />
                <Text style={[styles.cardPrice, { color: c.primary }]}>
                    {typeof job.budget === 'object'
                        ? `${job.budget.currency || '$'}${job.budget.amount?.toLocaleString() || '0'}`
                        : job.budget}
                </Text>
            </View>

            <Button
                title={job.isExternal ? "Visit Job" : "View Details"}
                size="small"
                onPress={() => {
                    if (job.isExternal && job.applyUrl) {
                        Linking.openURL(job.applyUrl);
                    } else {
                        navigation.navigate('JobDetail', { id: job._id || job.id });
                    }
                }}
            />
        </Card>
    );

    const renderProfileCard = (profile: any) => (
        <TouchableOpacity
            key={profile._id || profile.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate('ClientProfile', { clientId: profile._id || profile.id })}
        >
            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: profile.profileImage || 'https://i.pravatar.cc/100' }}
                    style={styles.cardAvatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>
                        {profile.firstName} {profile.lastName}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: c.subtext }]} numberOfLines={1}>
                        {profile.title || 'Freelancer'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const cleanText = (text: string) => {
        if (!text) return '';
        // Remove bold/italic markers (* or **)
        let cleaned = text.replace(/\*\*/g, '').replace(/\*/g, '');
        // Remove headers (#)
        cleaned = cleaned.replace(/^#+\s/gm, '');
        // Remove other common markdown like `
        cleaned = cleaned.replace(/`/g, '');
        // Remove common AI symbols like ✦ or ✨ if they appear as artifacts
        cleaned = cleaned.replace(/[✦✨]/g, '');
        return cleaned.trim();
    };

    const suggestions = [
        'Update profile',
        'Create cover letter',
        'Optimize my CV',
        'Find jobs'
    ];

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';

        const renderContent = () => {
            if (item.responseType === 'card' && item.data) {
                // ... existing card logic ...
                if (Array.isArray(item.data) || (item.data.gigs && Array.isArray(item.data.gigs))) {
                    const gigs = Array.isArray(item.data) ? item.data : item.data.gigs;
                    return (
                        <View style={{ marginTop: 8 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {gigs.map((gig: any, idx: number) => renderJobCard({ ...gig, key: gig._id || gig.id || `gig-${idx}` }))}
                            </ScrollView>
                        </View>
                    );
                }
                if (item.data.user || item.data.firstName) {
                    const p = item.data.user || item.data;
                    return renderProfileCard(p);
                }
                if (item.data.title && item.data.budget) {
                    return (
                        <View style={{ marginTop: 8 }}>
                            {renderJobCard(item.data)}
                        </View>
                    );
                }
            }

            if (item.responseType === 'list' && Array.isArray(item.data)) {
                return (
                    <View style={{ marginTop: 8 }}>
                        {item.data.map((listItem: any, idx: number) => (
                            <View key={idx} style={{ padding: 10, backgroundColor: c.card, marginBottom: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: c.primary }}>
                                <Text style={{ color: c.text }}>{typeof listItem === 'string' ? listItem : (listItem.label || listItem.name || JSON.stringify(listItem))}</Text>
                            </View>
                        ))}
                    </View>
                );
            }

            if (item.responseType === 'analytics' && item.data) {
                return (
                    <View style={{ marginTop: 8, backgroundColor: c.card, borderRadius: 12, padding: 12, width: 260 }}>
                        <Text style={{ color: c.text, fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>
                            {item.data.title || "Analysis Result"}
                        </Text>
                        {(item.data.score !== undefined || item.data.strength !== undefined) && (
                            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: c.primary }}>
                                        {item.data.score || item.data.strength}%
                                    </Text>
                                </View>
                                <Text style={{ color: c.subtext, marginTop: 4 }}>Score</Text>
                            </View>
                        )}
                        {item.data.metrics && (
                            <View style={{ gap: 8 }}>
                                {Object.entries(item.data.metrics).map(([key, value]: [string, any]) => (
                                    <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border, paddingBottom: 4 }}>
                                        <Text style={{ color: c.subtext, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Text>
                                        <Text style={{ color: c.text, fontWeight: '600' }}>{String(value)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {item.data.suggestions && Array.isArray(item.data.suggestions) && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={{ color: c.text, fontWeight: '600', marginBottom: 6 }}>Suggestions:</Text>
                                {item.data.suggestions.map((s: string, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                                        <Text style={{ color: c.primary, marginRight: 6 }}>•</Text>
                                        <Text style={{ color: c.subtext, flex: 1, fontSize: 12 }}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            }

            return (
                <Text style={[
                    styles.messageText,
                    isUser ? { color: 'white' } : { color: c.text }
                ]}>
                    {cleanText(item.text)}
                </Text>
            );
        };

        const formatTime = (date: Date) => {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const formatDate = (date: Date) => {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        };

        if (isUser) {
            return (
                <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
                    <View style={{ alignItems: 'flex-end' }}>
                        <LinearGradient
                            colors={c.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.messageBubble, styles.userBubble]}
                        >
                            {renderContent()}
                        </LinearGradient>
                        <Text style={[styles.timestamp, { color: c.subtext, marginRight: 4 }]}>
                            {formatDate(item.timestamp)} {formatTime(item.timestamp)}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
                <View style={[styles.aiAvatarContainer, { backgroundColor: c.card }]}>
                    <MaterialIcons name="auto-awesome" size={16} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={[
                        styles.messageBubble,
                        styles.aiBubble,
                        { backgroundColor: c.card, shadowColor: c.shadows.small.shadowColor }
                    ]}>
                        {renderContent()}
                    </View>
                    <Text style={[styles.timestamp, { color: c.subtext, marginLeft: 4 }]}>
                        {formatDate(item.timestamp)} {formatTime(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        s.messages.some(m => m.text.toLowerCase().includes(historySearchQuery.toLowerCase()))
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={c.text} />
                    </TouchableOpacity>

                    <View style={styles.headerProfileContainer}>
                        <View style={[styles.headerAvatarContainer, { borderColor: c.border, backgroundColor: c.card }]}>
                            <MaterialIcons name="auto-awesome" size={24} color={c.primary} />
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: c.text }]}>Connecta AI</Text>
                            <View style={styles.statusContainer}>
                                <View style={styles.statusDot} />
                                <Text style={[styles.statusText, { color: c.primary }]}>Online</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.headerAction} onPress={() => setShowHistory(true)}>
                    <Ionicons name="time-outline" size={24} color={c.text} />
                </TouchableOpacity>
            </View>

            {/* History Modal */}
            <Modal
                visible={showHistory}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowHistory(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>Chat History</Text>
                            <TouchableOpacity onPress={() => setShowHistory(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={[styles.historySearch, { backgroundColor: c.card, borderColor: c.border }]}>
                                <Ionicons name="search" size={20} color={c.subtext} />
                                <TextInput
                                    style={[styles.historySearchInput, { color: c.text }]}
                                    placeholder="Search history..."
                                    placeholderTextColor={c.subtext}
                                    value={historySearchQuery}
                                    onChangeText={setHistorySearchQuery}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.newChatBtn, { backgroundColor: c.primary }]}
                                onPress={startNewChat}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.newChatBtnText}>New Chat</Text>
                            </TouchableOpacity>

                            <FlatList
                                data={filteredSessions}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View style={[styles.historyItem, { borderBottomColor: c.border }]}>
                                        <TouchableOpacity
                                            style={{ flex: 1 }}
                                            onPress={() => loadSession(item)}
                                        >
                                            <Text style={[styles.historyItemTitle, { color: c.text }]} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={[styles.historyItemDate, { color: c.subtext }]}>
                                                {item.updatedAt.toLocaleDateString()} {item.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteSession(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <View style={styles.emptyHistory}>
                                        <Text style={{ color: c.subtext }}>No history found</Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

                {isTyping && (
                    <View style={styles.typingContainer}>
                        <View style={[styles.typingBubble, { backgroundColor: c.card }]}>
                            <ActivityIndicator size="small" color={c.primary} />
                        </View>
                        <Text style={[styles.typingText, { color: c.subtext }]}>Connecta AI is typing...</Text>
                    </View>
                )}

                {messages.length === 1 && (
                    <View style={styles.suggestionsContainer}>
                        <Text style={[styles.suggestionsTitle, { color: c.subtext }]}>Suggestions</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                            {suggestions.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.suggestionChip, { backgroundColor: c.card, borderColor: c.border }]}
                                    onPress={() => handleSend(s)}
                                >
                                    <Text style={[styles.suggestionText, { color: c.text }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Input Area */}
                <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={c.isDark ? 'dark' : 'light'} style={styles.inputWrapper}>
                    <View style={[
                        styles.inputContainer,
                        {
                            backgroundColor: c.background,
                            borderColor: c.border,
                            paddingBottom: Math.max(insets.bottom, 12)
                        }
                    ]}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="add" size={28} color={c.primary} />
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask me anything..."
                            placeholderTextColor={c.subtext}
                            multiline
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                { backgroundColor: c.primary, opacity: !input.trim() || isTyping ? 0.5 : 1 }
                            ]}
                            onPress={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                        >
                            {isTyping ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="arrow-up" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 4,
        marginRight: 4,
    },
    headerProfileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    headerAvatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    headerAvatar: {
        width: 28,
        height: 28,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    headerAction: {
        padding: 4,
    },
    chatContent: {
        padding: 16,
        paddingBottom: 100,
        flexGrow: 1,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    aiAvatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    aiAvatar: {
        width: 20,
        height: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    typingBubble: {
        padding: 10,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        marginRight: 8,
    },
    typingText: {
        fontSize: 12,
    },
    suggestionsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    suggestionsTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionsScroll: {
        gap: 8,
        paddingRight: 16,
    },
    suggestionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        paddingTop: 12,
        gap: 10,
    },
    attachButton: {
        padding: 6,
        marginBottom: 4,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    // Card Styles
    card: {
        width: 240,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        marginBottom: 10,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: '700',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eee',
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
        paddingTop: 16,
    },
    historySearch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    historySearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    newChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    newChatBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    historyItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    historyItemDate: {
        fontSize: 12,
    },
    emptyHistory: {
        alignItems: 'center',
        marginTop: 40,
    },
});
