import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { feedService, FeedComment } from '../services/feedService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface FeedCommentSheetProps {
    postId: string;
    visible: boolean;
    onClose: () => void;
    onCommentAdded: () => void;
}

export default function FeedCommentSheet({ postId, visible, onClose, onCommentAdded }: FeedCommentSheetProps) {
    const c = useThemeColors();
    const { user } = useAuth();
    
    const [comments, setComments] = useState<FeedComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible && postId) {
            loadComments();
        }
    }, [visible, postId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await feedService.getComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim() || !user || submitting) return;

        const userName = `${user.firstName} ${user.lastName || ''}`.trim();

        try {
            setSubmitting(true);
            const comment = await feedService.addComment(postId, newComment.trim(), userName, user.profileImage);
            setComments(prev => [...prev, comment]);
            setNewComment('');
            Keyboard.dismiss();
            onCommentAdded();
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderComment = ({ item }: { item: FeedComment }) => (
        <View style={styles.commentContainer}>
            <Image 
                source={{ uri: item.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.authorName)}&background=random` }} 
                style={styles.avatar}
            />
            <View style={[styles.commentBubble, { backgroundColor: c.background }]}>
                <View style={styles.commentHeader}>
                    <Text style={[styles.authorName, { color: c.text }]}>{item.authorName}</Text>
                    <Text style={[styles.timeText, { color: c.subtext }]}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                <Text style={[styles.commentText, { color: c.text }]}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.modalContent, { backgroundColor: c.card }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: c.border }]}>
                        <Text style={[styles.headerTitle, { color: c.text }]}>Comments</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={c.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    {loading ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="small" color={c.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item._id}
                            renderItem={renderComment}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.centerBox}>
                                    <Text style={[styles.emptyText, { color: c.subtext }]}>
                                        No comments yet. Be the first!
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    {/* Input Area */}
                    <View style={[styles.inputContainer, { borderTopColor: c.border, backgroundColor: c.card }]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { backgroundColor: c.background, color: c.text }]}
                            placeholder="Add a comment..."
                            placeholderTextColor={c.subtext}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity 
                            style={[
                                styles.sendButton, 
                                { backgroundColor: newComment.trim() ? c.primary : c.border }
                            ]}
                            onPress={handleSubmit}
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="send" size={16} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    commentBubble: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 11,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        marginRight: 10,
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
