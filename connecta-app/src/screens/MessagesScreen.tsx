import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';

interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const MessagesScreen: React.FC<any> = ({ navigation, route }) => {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const { userName, userAvatar } = route?.params || {};

  const data = useMemo<ChatMessage[]>(() => ([
    { id: 'd1', from: 'system' as any, text: 'Today', time: '' },
    { id: 'm1', from: 'them', text: "Hi there! I saw your proposal and I'm very interested in your work. Your portfolio is impressive.", time: '10:00 AM' },
    { id: 'm2', from: 'me', text: "Thank you, Cameron! I'm glad you liked it. I'm excited about the possibility of working together.", time: '10:01 AM' },
    { id: 'm3', from: 'them', text: "Great! Let's discuss the project details. When would be a good time for a quick call?", time: '10:02 AM' },
    { id: 'm4', from: 'me', text: "I'm available this afternoon after 2 PM. Does that work for you?", time: '10:03 AM' },
  ]), []);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if ((item as any).from === 'system') {
      return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ fontSize: 12, color: c.subtext }}>Today</Text>
        </View>
      );
    }
    const mine = item.from === 'me';
    return (
      <View style={[styles.row, mine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
        {!mine && (
          <View style={styles.avatar}>
            <Avatar uri={userAvatar || undefined} name={userName} size={32} />
          </View>
        )}
        <View style={[styles.bubbleWrap, { maxWidth: '75%' }, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }] }>
          <View style={[styles.bubble, mine ? { backgroundColor: c.primary, borderTopRightRadius: 8 } : { backgroundColor: c.card, borderTopLeftRadius: 8 } ]}>
            <Text style={[styles.msg, { color: mine ? '#fff' : c.text }]}>{item.text}</Text>
          </View>
          <Text style={[styles.time, { color: c.subtext }]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  const onSend = () => {
    setInput('');
    // Normally we would append to data via state; left as UI stub
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

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

      {/* Messages */}
      <FlatList
        ref={listRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
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
          />
          <TouchableOpacity style={styles.emojiBtn}>
            <MaterialIcons name="sentiment-satisfied" size={22} color={c.subtext} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSend} style={[styles.sendBtn, { backgroundColor: c.primary }]}>
            <MaterialIcons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
