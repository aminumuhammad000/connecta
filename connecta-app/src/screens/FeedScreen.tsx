import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList,ActivityIndicator, RefreshControl, StyleSheet, Text, Platform, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { feedService, FeedPost } from '../services/feedService';
import FeedPostCard from '../components/FeedPostCard';
import FeedCommentSheet from '../components/FeedCommentSheet';
import { useSocket } from '../context/SocketContext';
import { useFocusEffect } from '@react-navigation/native';

export default function FeedScreen({ navigation }: { navigation: any }) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const { clearUnreadFeedCount, socket } = useSocket();

    const [posts, setPosts] = useState<FeedPost[]>(feedService.cachedPosts || []);
    const [loading, setLoading] = useState(feedService.cachedPosts?.length === 0);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(feedService.cachedPage || 1);
    const [hasMore, setHasMore] = useState(true);

    // Comment Sheet State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Edit Post State
    const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
    const [editBody, setEditBody] = useState('');

    // Clear badge when screen is focused
    useFocusEffect(
        useCallback(() => {
            clearUnreadFeedCount();
        }, [])
    );

    useEffect(() => {
        if (!feedService.cachedPosts || feedService.cachedPosts.length === 0) {
            loadFeed(1);
        } else {
            setLoading(false);
        }
    }, []);

    // Listen for real-time posts
    useEffect(() => {
        if (!socket) return;
        
        const handleNewPost = (newPost: FeedPost) => {
            setPosts(prev => [newPost, ...prev]);
        };

        const handleReaction = (data: { postId: string, reactions: any }) => {
            setPosts(prev => prev.map(post => 
                post._id === data.postId 
                    ? { ...post, reactions: data.reactions } 
                    : post
            ));
        };

        const handleComment = (data: { postId: string, commentCount: number }) => {
            setPosts(prev => prev.map(post => 
                post._id === data.postId 
                    ? { ...post, commentCount: data.commentCount } 
                    : post
            ));
        };

        socket.on('feed:new_post', handleNewPost);
        socket.on('feed:reaction', handleReaction);
        socket.on('feed:comment', handleComment);

        return () => {
            socket.off('feed:new_post', handleNewPost);
            socket.off('feed:reaction', handleReaction);
            socket.off('feed:comment', handleComment);
        };
    }, [socket]);

    const loadFeed = async (pageNumber: number, isRefresh = false) => {
        try {
            if (pageNumber === 1 && !isRefresh) setLoading(true);
            const response = await feedService.getFeed(pageNumber, 15);
            const responseData = response.data?.data || response.data || [];
            
            if (isRefresh || pageNumber === 1) {
                setPosts(responseData);
                feedService.setCache(responseData, pageNumber);
            } else {
                setPosts(prev => {
                    const merged = [...prev, ...responseData];
                    feedService.setCache(merged, pageNumber);
                    return merged;
                });
            }
            
            setHasMore(responseData.length === 15);
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to load feed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFeed(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && !refreshing && hasMore) {
            loadFeed(page + 1);
        }
    };

    const navigateToProfile = (userId?: string) => {
        if (userId) {
            navigation.navigate('ClientProfile', { userId }); // Using ClientProfile as a generic profile viewer for now
        }
    };

    const navigateToJob = (jobId?: string) => {
        if (jobId) {
            navigation.navigate('JobDetail', { jobId }); 
        }
    };

    const handleDeletePost = async (postId: string) => {
        try {
            const success = await feedService.deletePost(postId);
            if (success) {
                setPosts(prev => prev.filter(p => !p._id || p._id !== postId));
            }
        } catch (error) {
            Alert.alert("Error", "Could not delete post.");
        }
    };

    const handleEditSave = async () => {
        if (!editingPost || !editBody.trim()) return;
        try {
            const updated = await feedService.editPost(editingPost._id, editingPost.title, editBody.trim());
            setPosts(prev => prev.map(p => p._id === editingPost._id ? { ...p, body: updated.body } : p));
            setEditingPost(null);
        } catch (error) {
            Alert.alert("Error", "Could not save edits.");
        }
    };

    if (loading && page === 1) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                <Text style={[styles.headerTitle, { color: c.text }]}>Feed</Text>
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <FeedPostCard 
                        post={item} 
                        onPressProfile={navigateToProfile}
                        onPressJob={navigateToJob}
                        onCommentPress={setSelectedPostId}
                        onDeletePress={handleDeletePost}
                        onEditPress={(post) => {
                            setEditingPost(post);
                            setEditBody(post.body || '');
                        }}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    hasMore && posts.length > 0 ? (
                        <ActivityIndicator style={styles.footerLoader} color={c.primary} />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: c.subtext }]}>
                            No activities yet. Connect with others to see more!
                        </Text>
                    </View>
                }
            />

            {/* Comments Modal */}
            <FeedCommentSheet 
                postId={selectedPostId || ''}
                visible={!!selectedPostId}
                onClose={() => setSelectedPostId(null)}
                onCommentAdded={() => {
                    // Optimistically update comment count in the list
                    if (selectedPostId) {
                        setPosts(prev => prev.map(post => 
                            post._id === selectedPostId 
                                ? { ...post, commentCount: post.commentCount + 1 } 
                                : post
                        ));
                    }
                }}
            />

            {/* Edit Post Modal */}
            <Modal visible={!!editingPost} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <View style={[styles.editModalContent, { backgroundColor: c.card }]}>
                        <Text style={[styles.headerTitle, { color: c.text, marginBottom: 15 }]}>Edit Post</Text>
                        <TextInput 
                            style={[styles.editInput, { color: c.text, borderColor: c.border, backgroundColor: c.background }]}
                            multiline
                            value={editBody}
                            onChangeText={setEditBody}
                        />
                        <View style={styles.editBtnRow}>
                            <TouchableOpacity onPress={() => setEditingPost(null)} style={styles.editBtn}>
                                <Text style={{ color: c.subtext }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleEditSave} style={[styles.editBtn, { backgroundColor: c.primary }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    footerLoader: {
        paddingVertical: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
    },
    modalBg: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
    },
    editModalContent: {
        width: '85%', padding: 20, borderRadius: 15
    },
    editInput: {
        height: 120, borderWidth: 1, borderRadius: 10, padding: 15, textAlignVertical: 'top'
    },
    editBtnRow: {
        flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10
    },
    editBtn: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20
    }
});
