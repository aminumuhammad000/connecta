import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import * as messageService from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useFocusEffect } from '@react-navigation/native';

import { Message } from '../types';

// Extend Message to support populated senderId if necessary
type ChatMessage = Message & { senderId: any; receiverId: any };

const MessagesScreen: React.FC<any> = ({ navigation, route }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { socket, onlineUsers, refreshUnreadCount } = useSocket();
  /* State */
  const { conversationId: paramConversationId, userName, userAvatar } = route?.params || {};
  const [activeConversationId, setActiveConversationId] = useState<string | null>(paramConversationId || null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const receiverId = route?.params?.receiverId || route?.params?.otherUserId; // Extract explicitly
  const isOnline = useMemo(() => onlineUsers.includes(receiverId), [onlineUsers, receiverId]);

  /* Effects */
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const initConversation = async () => {
        if (!user?._id) return;

        // If we already have an ID, load messages
        if (activeConversationId) {
          loadMessages(activeConversationId);
          markRead(activeConversationId);
          return;
        }

        // If no ID but we have a receiver, fetch/create one
        if (receiverId) {
          try {
            setIsLoading(true);

            const payload: any = {
              participants: [user._id, receiverId],
              projectId: route.params?.projectId
            };

            // Determine Client/Freelancer IDs
            if (route.params?.clientId) {
              payload.clientId = route.params.clientId;
            } else if (user.userType === 'client') {
              payload.clientId = user._id;
            } else {
              payload.clientId = receiverId;
            }

            if (route.params?.freelancerId) {
              payload.freelancerId = route.params.freelancerId;
            } else if (user.userType === 'freelancer') {
              payload.freelancerId = user._id;
            } else {
              payload.freelancerId = receiverId;
            }

            const conv = await messageService.getOrCreateConversation(payload);
            if (isMounted && conv?._id) {
              setActiveConversationId(conv._id);
              // After getting ID, load messages
              const msgs = await messageService.getConversationMessages(conv._id);
              setMessages(Array.isArray(msgs) ? (msgs as unknown as ChatMessage[]) : []);
              // Mark as read immediately
              markRead(conv._id);
            }
          } catch (error) {
            console.error('Error initializing conversation:', error);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          if (isMounted) setIsLoading(false);
        }
      };

      initConversation();

      return () => { isMounted = false; };
    }, [activeConversationId, receiverId, user])
  );

  // Typing state
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !activeConversationId) return;

    const handleReceiveMessage = (newMessage: ChatMessage) => {
      // Safely extract IDs (handling populated objects vs strings)
      const msgSenderId = typeof newMessage.senderId === 'object' ? newMessage.senderId._id : newMessage.senderId;
      const msgReceiverId = typeof newMessage.receiverId === 'object' ? newMessage.receiverId._id : newMessage.receiverId;

      if (
        (msgSenderId === receiverId && msgReceiverId === user?._id) ||
        (msgSenderId === user?._id && msgReceiverId === receiverId)
      ) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        // Scroll to bottom
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        // Mark as read immediately if looking at screen
        markRead(activeConversationId);

        // Hide typing when message received
        setOtherUserTyping(false);
      }
    };

    const handleTypingShow = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationId && data.userId === receiverId) {
        setOtherUserTyping(true);
      }
    };

    const handleTypingHide = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationId && data.userId === receiverId) {
        setOtherUserTyping(false);
      }
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('typing:show', handleTypingShow);
    socket.on('typing:hide', handleTypingHide);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('typing:show', handleTypingShow);
      socket.off('typing:hide', handleTypingHide);
    };
  }, [socket, activeConversationId, receiverId, user]);

  const handleInputChange = (text: string) => {
    setInput(text);

    if (!socket || !user || !activeConversationId) return;

    // Emit start typing
    socket.emit("typing:start", {
      conversationId: activeConversationId,
      userId: user._id,
      receiverId
    });

    // Debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        conversationId: activeConversationId,
        userId: user._id,
        receiverId
      });
    }, 2000);
  };

  const markRead = async (convId: string) => {
    try {
      if (convId && user?._id) {
        await messageService.markMessagesAsRead(convId, user._id);
        // Refresh global unread count
        if (refreshUnreadCount) refreshUnreadCount();
      }
    } catch (e) {
      console.log('Error marking read', e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const data = await messageService.getConversationMessages(convId);
      setMessages(Array.isArray(data) ? (data as unknown as ChatMessage[]) : []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId?._id === user?._id || item.senderId === user?._id;
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check for video call invite
    const videoCallMatch = item.text.match(/\[VIDEO_CALL_INVITE:(.*?)\]/);
    const isVideoCall = !!videoCallMatch;
    const roomName = videoCallMatch ? videoCallMatch[1] : '';

    return (
      <View style={[styles.row, mine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
        {!mine && (
          <View style={styles.avatar}>
            <Avatar uri={userAvatar || undefined} name={userName} size={32} />
          </View>
        )}
        <View style={[styles.bubbleWrap, { maxWidth: '75%' }, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
          <View style={[styles.bubble, mine ? { backgroundColor: c.primary, borderTopRightRadius: 8 } : { backgroundColor: c.card, borderTopLeftRadius: 8 }]}>
            {isVideoCall ? (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => navigation.navigate('VideoCall', { roomName, userName: user?.firstName || 'User' })}
              >
                <MaterialIcons name="videocam" size={24} color={mine ? 'white' : c.primary} />
                <Text style={{ color: mine ? 'white' : c.text, fontWeight: 'bold' }}>Join Video Call</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.msg, { color: mine ? '#fff' : c.text }]}>{item.text}</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Text style={[styles.time, { color: c.subtext }]}>{time}</Text>
            {mine && (
              <MaterialIcons
                name="done-all"
                size={14}
                color={item.isRead ? "#3b82f6" : c.subtext}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const onSend = async (customText?: string) => {
    const textToSend = customText || input;

    if (!textToSend.trim() || isSending) return;

    if (!user?._id) {
      console.error("Cannot send message: User not logged in");
      return;
    }

    // Must have a valid conversation ID now (or we fetch it first)
    // For simplicity, ensure activeConversationId is set.
    // However, if logic below relies on it, we must ensure it.

    // Safety check for receiver
    const targetReceiverId = route.params?.receiverId || route.params?.otherUserId;
    if (!targetReceiverId) {
      console.error("Cannot send message: No receiver ID found");
      return;
    }

    const messageText = textToSend.trim();
    if (!customText) setInput('');
    setIsSending(true);

    try {
      // If we somehow still don't have an ID, try one last time to create it
      let finalConvId = activeConversationId;
      if (!finalConvId) {
        const payload: any = {
          participants: [user._id, targetReceiverId],
          projectId: route.params?.projectId
        };

        if (route.params?.clientId) payload.clientId = route.params.clientId;
        else if (user.userType === 'client') payload.clientId = user._id;
        else payload.clientId = targetReceiverId;

        if (route.params?.freelancerId) payload.freelancerId = route.params.freelancerId;
        else if (user.userType === 'freelancer') payload.freelancerId = user._id;
        else payload.freelancerId = targetReceiverId;

        const conv = await messageService.getOrCreateConversation(payload);
        if (conv?._id) {
          finalConvId = conv._id;
          setActiveConversationId(conv._id);
        } else {
          throw new Error("Could not establish conversation ID");
        }
      }

      const newMessage = await messageService.sendMessage({
        conversationId: finalConvId,
        senderId: user._id,
        receiverId: targetReceiverId,
        text: messageText,
      });

      // Add message to list
      const msgWithAny = newMessage as any;
      setMessages(prev => [...prev, msgWithAny]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input on error
      setInput(messageText);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={20} color={c.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Avatar uri={userAvatar || undefined} name={userName} size={28} />
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={[styles.title, { color: c.text }]}>{userName || 'Chat'}</Text>
            <Text style={[styles.subtitle, { color: isOnline ? c.primary : c.subtext }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.iconBtn, { marginRight: 4 }]}
            onPress={() => {
              const roomName = `Connecta-${activeConversationId || Date.now()}`;
              // Send a system message indicating call started (optional, for other user to see)
              onSend(`[VIDEO_CALL_INVITE:${roomName}] Join my video call`);

              navigation.navigate('VideoCall', {
                roomName,
                userName: user?.firstName || 'User'
              });
            }}
          >
            <MaterialIcons name="videocam" size={24} color={c.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="more-vert" size={22} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          data={messages}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: c.subtext }}>No messages yet. Start the conversation!</Text>
            </View>
          }
        />

        {/* Composer */}
        <View style={[styles.composerWrap, { borderTopColor: c.border, backgroundColor: c.background, paddingBottom: insets.bottom }]}>
          {otherUserTyping && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 12, color: c.subtext, fontStyle: 'italic' }}>
                {userName.split(' ')[0]} is typing...
              </Text>
            </View>
          )}
          <View style={[styles.composer, { backgroundColor: c.card }]}>
            <TouchableOpacity style={styles.addBtn}>
              <MaterialIcons name="add-circle" size={22} color={c.subtext} />
            </TouchableOpacity>
            <TextInput
              value={input}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
              editable={!isSending}
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <MaterialIcons name="sentiment-satisfied" size={22} color={c.subtext} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSend()}
              style={[styles.sendBtn, { backgroundColor: c.primary, opacity: (!input.trim() || isSending) ? 0.5 : 1 }]}
              disabled={(!input.trim() && !isSending) || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bubbleWrap: {
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  msg: {
    fontSize: 14,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  composerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  addBtn: { padding: 6 },
  emojiBtn: { padding: 6 },
  input: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

export default MessagesScreen;
