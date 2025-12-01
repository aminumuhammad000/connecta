import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import * as messageService from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

interface ChatMessage {
  _id: string;
  senderId: any;
  receiverId: any;
  text: string;
  createdAt: string;
  isRead: boolean;
}

const MessagesScreen: React.FC<any> = ({ navigation, route }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const { conversationId, userName, userAvatar } = route?.params || {};

  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        loadMessages();
      }
    }, [conversationId])
  );

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getConversationMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
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

    return (
      <View style={[styles.row, mine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
        {!mine && (
          <View style={styles.avatar}>
            <Avatar uri={userAvatar || undefined} name={userName} size={32} />
          </View>
        )}
        <View style={[styles.bubbleWrap, { maxWidth: '75%' }, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
          <View style={[styles.bubble, mine ? { backgroundColor: c.primary, borderTopRightRadius: 8 } : { backgroundColor: c.card, borderTopLeftRadius: 8 }]}>
            <Text style={[styles.msg, { color: mine ? '#fff' : c.text }]}>{item.text}</Text>
          </View>
          <Text style={[styles.time, { color: c.subtext }]}>{time}</Text>
        </View>
      </View>
    );
  };

  const onSend = async () => {
    if (!input.trim() || isSending) return;

    const messageText = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Get receiver ID from route params or determine from conversation
      const receiverId = route.params?.receiverId || route.params?.otherUserId;

      const newMessage = await messageService.sendMessage({
        conversationId,
        receiverId,
        content: messageText,
      });

      // Add message to list
      setMessages(prev => [...prev, newMessage as any]);
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
            <Text style={[styles.subtitle, { color: c.subtext }]}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="more-vert" size={22} color={c.text} />
        </TouchableOpacity>
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
          <View style={[styles.composer, { backgroundColor: c.card }]}>
            <TouchableOpacity style={styles.addBtn}>
              <MaterialIcons name="add-circle" size={22} color={c.subtext} />
            </TouchableOpacity>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={c.subtext}
              style={[styles.input, { color: c.text }]}
              editable={!isSending}
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <MaterialIcons name="sentiment-satisfied" size={22} color={c.subtext} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSend}
              style={[styles.sendBtn, { backgroundColor: c.primary, opacity: (!input.trim() || isSending) ? 0.5 : 1 }]}
              disabled={!input.trim() || isSending}
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
