import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Keyboard, ScrollView, Linking } from 'react-native';
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

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    responseType?: 'card' | 'list' | 'analytics' | 'text' | 'friendly_message';
    data?: any;
}

export default function ConnectaAIScreen({ navigation }: any) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { showAlert } = useInAppAlert();
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
    const flatListRef = useRef<FlatList>(null);

    const suggestions = [
        'Update profile',
        'Create cover letter',
        'Optimize my CV',
        'Create Portfolio'
    ];

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        Keyboard.dismiss();

        try {
            if (!user?._id) throw new Error('User ID not found');

            const response = await agentService.sendMessageToAgent(text, user._id, user.userType);

            if (response.success && response.result.success) {
<<<<<<< HEAD
                const result = response.result;
                const responseText = result.message || (typeof result.data === 'string' ? result.data : "Here is what I found:");
=======
                const resultData = response.result.data;
                let messageType: 'text' | 'jobs' | 'profiles' = 'text';
                let jobsData: any[] = [];
                let profilesData: any[] = [];
                let displayText = response.result.message || (typeof resultData === 'string' ? resultData : "Here is what I found:");

                // Detect response type
                if (typeof resultData === 'object' && resultData !== null) {
                    // Check for Jobs
                    if (resultData.data && Array.isArray(resultData.data)) {
                        // Keep robust check for job-like structures
                        const sample = resultData.data[0];
                        if (sample && (sample.title || sample.budget)) {
                            messageType = 'jobs';
                            jobsData = resultData.data;
                            displayText = response.result.message || `I found ${jobsData.length} gigs matching your request:`;
                        } else if (sample && (sample.firstName || sample.userType)) {
                            messageType = 'profiles';
                            profilesData = resultData.data;
                            displayText = response.result.message || `I found ${profilesData.length} profiles matching your request:`;
                        }
                    } else if (Array.isArray(resultData)) {
                        // Direct array handling
                        const sample = resultData[0];
                        if (sample && (sample.title || sample.budget)) {
                            messageType = 'jobs';
                            jobsData = resultData;
                        } else if (sample && (sample.firstName || sample.userType)) {
                            messageType = 'profiles';
                            profilesData = resultData;
                        }
                    }
                }
>>>>>>> 8af02241b3ff2760b8a639b633ea6df0df8faf41

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: typeof displayText === 'string' ? displayText : JSON.stringify(displayText),
                    sender: 'ai',
                    timestamp: new Date(),
<<<<<<< HEAD
                    responseType: result.responseType as any,
                    data: result.data
=======
                    type: messageType,
                    jobs: jobsData,
                    profiles: profilesData
>>>>>>> 8af02241b3ff2760b8a639b633ea6df0df8faf41
                };
                setMessages(prev => [...prev, aiMsg]);
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
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderJobCard = (job: any) => (
        <TouchableOpacity
            key={job._id || job.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate('JobDetail', { jobId: job._id || job.id })}
        >
            <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{job.title}</Text>
            <Text style={[styles.cardSubtitle, { color: c.subtext }]} numberOfLines={1}>{job.company || 'Confidential'}</Text>
            <View style={styles.cardFooter}>
                <Text style={[styles.cardPrice, { color: c.primary }]}>
                    {job.budget?.currency || '$'}{job.budget?.amount?.toLocaleString() || '0'}
                </Text>
                <View style={[styles.badge, { backgroundColor: c.surface }]}>
                    <Text style={[styles.badgeText, { color: c.subtext }]}>{job.type || 'Fixed'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderProfileCard = (profile: any) => (
        <TouchableOpacity
            key={profile._id || profile.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            // Navigate to generic public profile or specific freelancer profile
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

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
<<<<<<< HEAD

        // Helper to render content based on type
        const renderContent = () => {
            if (item.responseType === 'card' && item.data) {
                // Check if it's a list of gigs (common for get_matched_gigs)
                if (Array.isArray(item.data) || (item.data.gigs && Array.isArray(item.data.gigs))) {
                    const gigs = Array.isArray(item.data) ? item.data : item.data.gigs;
                    return (
                        <View style={{ marginTop: 8 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {gigs.map((gig: any, idx: number) => (
                                    <Card key={gig._id || idx} variant="elevated" style={{ width: 280, padding: 12 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: c.text }} numberOfLines={1}>{gig.title}</Text>
                                        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 8 }} numberOfLines={1}>{gig.company || "Unknown Client"}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                            <Badge label={gig.jobType || 'Fixed'} variant="neutral" size="small" />
                                            <Text style={{ fontWeight: '600', color: c.primary }}>{gig.budget}</Text>
                                        </View>
                                        <Button
                                            title={gig.isExternal ? "Visit Job" : "View Details"}
                                            size="small"
                                            onPress={() => {
                                                if (gig.isExternal && gig.applyUrl) {
                                                    Linking.openURL(gig.applyUrl);
                                                } else {
                                                    navigation.navigate('JobDetail', { id: gig._id });
                                                }
                                            }}
                                        />
                                    </Card>
                                ))}
                            </ScrollView>
                        </View>
                    );
                }

                // Check if it's a single profile (get_profile_details)
                if (item.data.user || item.data.firstName) {
                    const p = item.data.user || item.data; // Handle nested user object if present
                    return (
                        <Card variant="elevated" style={{ marginTop: 8, width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Avatar uri={p.avatar || p.profileImage} name={p.firstName} size={48} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: c.text }}>{p.firstName} {p.lastName}</Text>
                                    <Text style={{ color: c.subtext }}>{p.title || "Freelancer"}</Text>
                                </View>
                            </View>
                            {p.bio && <Text style={{ color: c.text, marginBottom: 12 }} numberOfLines={3}>{p.bio}</Text>}
                            <Button title="View Full Profile" size="small" variant="outline" onPress={() => navigation.navigate('Profile', { userId: p._id })} />
                        </Card>
                    );
                }
            }

            return (
                <Text style={[
                    styles.messageText,
                    isUser ? { color: 'white' } : { color: c.text }
                ]}>
                    {item.text}
                </Text>
            );
        };

        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble,
                isUser ? { backgroundColor: c.primary } : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 },
                item.responseType === 'card' ? { maxWidth: '95%' } : {}
            ]}>
                {!isUser && (
                    <View style={styles.aiIcon}>
                        <Ionicons name="sparkles" size={16} color={c.primary} />
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    {renderContent()}
                </View>
=======
        return (
            <View style={{ marginBottom: 16, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                    isUser ? { backgroundColor: c.primary } : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }
                ]}>
                    {!isUser && (
                        <View style={styles.aiIcon}>
                            <Ionicons name="sparkles" size={16} color={c.primary} />
                        </View>
                    )}
                    <Text style={[
                        styles.messageText,
                        isUser ? { color: 'white' } : { color: c.text }
                    ]}>
                        {item.text}
                    </Text>
                </View>

                {/* Render Horizontal List for Jobs */}
                {item.type === 'jobs' && item.jobs && item.jobs.length > 0 && (
                    <FlatList
                        horizontal
                        data={item.jobs}
                        renderItem={({ item }) => renderJobCard(item)}
                        keyExtractor={job => job._id || Math.random().toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContent}
                    />
                )}

                {/* Render Horizontal List for Profiles */}
                {item.type === 'profiles' && item.profiles && item.profiles.length > 0 && (
                    <FlatList
                        horizontal
                        data={item.profiles}
                        renderItem={({ item }) => renderProfileCard(item)}
                        keyExtractor={p => p._id || Math.random().toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContent}
                    />
                )}
>>>>>>> 8af02241b3ff2760b8a639b633ea6df0df8faf41
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Connecta AI</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {isTyping && (
                    <View style={styles.typingContainer}>
                        <ActivityIndicator size="small" color={c.primary} />
                        <Text style={[styles.typingText, { color: c.subtext }]}>AI is typing...</Text>
                    </View>
                )}

                {messages.length === 1 && (
                    <View style={styles.suggestionsContainer}>
                        <Text style={[styles.suggestionsTitle, { color: c.subtext }]}>Try asking about:</Text>
                        <View style={styles.suggestionsGrid}>
                            {suggestions.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.suggestionChip, { backgroundColor: c.card, borderColor: c.border }]}
                                    onPress={() => handleSend(s)}
                                >
                                    <Text style={[styles.suggestionText, { color: c.text }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: c.card,
                        borderTopColor: c.border,
                        paddingBottom: Math.max(insets.bottom, 12)
                    }
                ]}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add-circle-outline" size={24} color={c.subtext} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Message Connecta AI..."
                        placeholderTextColor={c.subtext}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: c.primary, opacity: !input.trim() || isTyping ? 0.5 : 1 }]}
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
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatContent: {
        padding: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    aiIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    messageText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 8,
    },
    typingText: {
        fontSize: 14,
    },
    suggestionsContainer: {
        padding: 16,
    },
    suggestionsTitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 12,
        // paddingBottom is now handled dynamically in the component
    },
    attachButton: {
        padding: 4,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // New Card Styles
    carouselContent: {
        paddingLeft: 4,
        paddingTop: 8,
        paddingBottom: 4,
        gap: 12,
    },
    card: {
        width: 220,
        padding: 12,
        borderRadius: 12,
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
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cardAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
    },
});
