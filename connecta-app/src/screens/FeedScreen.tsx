import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Text, Platform, Alert, Modal, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { feedService, FeedPost } from '../services/feedService';
import FeedPostCard from '../components/FeedPostCard';
import FeedCommentSheet from '../components/FeedCommentSheet';
import { useSocket } from '../context/SocketContext';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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
            const responseData = Array.isArray(response)
                ? response
                : (response?.data && Array.isArray(response.data)
                    ? response.data
                    : []);
            
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
        <View style={[styles.container, { backgroundColor: c.background }]}>
            {/* Facebook-Style Top Navbar - FIXED/STICKY */}
            <View style={[styles.fbNavBar, { 
                backgroundColor: c.card,
                paddingTop: insets.top,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }]}>
                {/* Left: App Logo/Name */}
                <View style={styles.navBarLeft}>
                    <Ionicons name="layers" size={28} color="#FD6730" />
                    <Text style={[styles.navBarTitle, { color: c.text }]}>Feed</Text>
                </View>

                {/* Right: Icons */}
                <View style={styles.navBarRight}>
                    <TouchableOpacity 
                        style={[styles.navBarIcon, { backgroundColor: c.background }]}
                        onPress={() => navigation.navigate('Chats')}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color={c.text} />
                        <View style={styles.navBarBadge}>
                            <Text style={styles.navBarBadgeText}>1</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.navBarIcon, { backgroundColor: c.background }]}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications-outline" size={20} color={c.text} />
                        <View style={styles.navBarBadge}>
                            <Text style={styles.navBarBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions Card - Overlapping Navbar - SCROLLABLE */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                style={{
                    backgroundColor: c.card,
                    borderRadius: 20,
                    marginHorizontal: 16,
                    marginTop: -45,
                    marginBottom: 20,
                    zIndex: 100,
                    height: 130,
                }}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingVertical: 15,
                    gap: 12,
                }}
            >
                    <TouchableOpacity
                        style={styles.dashboardQuickAction}
                        onPress={() => navigation.navigate('ClientProjects')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dashboardActionIcon, { backgroundColor: c.primary + '15' }]}>
                            <Ionicons name="briefcase" size={18} color={c.primary} />
                        </View>
                        <Text style={[styles.dashboardActionLabel, { color: c.text }]}>My Projects</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardQuickAction}
                        onPress={() => navigation.navigate('Jobs')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dashboardActionIcon, { backgroundColor: '#10B98115' }]}>
                            <Ionicons name="list" size={18} color="#10B981" />
                        </View>
                        <Text style={[styles.dashboardActionLabel, { color: c.text }]}>Postings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardQuickAction}
                        onPress={() => navigation.navigate('Proposals')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dashboardActionIcon, { backgroundColor: c.primary + '15' }]}>
                            <Ionicons name="document-text" size={18} color={c.primary} />
                        </View>
                        <Text style={[styles.dashboardActionLabel, { color: c.text }]}>Proposals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardQuickAction}
                        onPress={() => navigation.navigate('Chats')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dashboardActionIcon, { backgroundColor: '#3B82F615' }]}>
                            <Ionicons name="chatbubbles" size={18} color="#3B82F6" />
                        </View>
                        <Text style={[styles.dashboardActionLabel, { color: c.text }]}>Chats</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardQuickAction}
                        onPress={() => navigation.navigate('Feed')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dashboardActionIcon, { backgroundColor: '#FD673015' }]}>
                            <Ionicons name="layers" size={18} color="#FD6730" />
                        </View>
                        <Text style={[styles.dashboardActionLabel, { color: c.text }]}>Feed</Text>
                    </TouchableOpacity>
                </ScrollView>

            <FlatList
                style={{ marginTop: 20 }}
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
                        <Ionicons name="layers" size={48} color={c.subtext} style={{ marginBottom: 8, opacity: 0.6 }} />
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
                                ? { ...post, commentCount: (post.commentCount || 0) + 1 } 
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
    fbNavBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    navBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    navBarTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    navBarRight: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    navBarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    navBarBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    navBarBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    dashboardQuickAction: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        paddingHorizontal: 12,
    },
    dashboardActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    dashboardActionLabel: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
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
