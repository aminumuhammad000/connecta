import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList,ActivityIndicator, RefreshControl, StyleSheet, Text, Platform } from 'react-native';
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

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Comment Sheet State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Clear badge when screen is focused
    useFocusEffect(
        useCallback(() => {
            clearUnreadFeedCount();
        }, [])
    );

    useEffect(() => {
        loadFeed(1);
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
            const responseData = await feedService.getFeed(pageNumber, 15);
            
            if (isRefresh || pageNumber === 1) {
                setPosts(responseData);
            } else {
                setPosts(prev => [...prev, ...responseData]);
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
                        onCommentPress={setSelectedPostId}
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
    }
});
