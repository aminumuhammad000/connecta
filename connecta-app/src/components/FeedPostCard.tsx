import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { FeedPost } from '../services/feedService';
import FeedReactionBar from './FeedReactionBar';
import { formatDistanceToNow } from 'date-fns';
import JobCompletionFlyer from './JobCompletionFlyer';

interface FeedPostCardProps {
    post: FeedPost;
    onPressProfile: (userId?: string) => void;
    onCommentPress: (postId: string) => void;
}

export default function FeedPostCard({ post, onPressProfile, onCommentPress }: FeedPostCardProps) {
    const c = useThemeColors();

    const getActorImage = () => {
        if (post.actorAvatar) return { uri: post.actorAvatar };
        return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.actorName || 'User')}&background=random` };
    };

    return (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onPressProfile(post.actor)}>
                    <Image source={getActorImage()} style={styles.avatar} />
                </TouchableOpacity>
                <View style={styles.headerTextInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.actorName, { color: c.text }]} numberOfLines={1}>
                            {post.actorName || 'System'}
                        </Text>
                        {post.isSystemPost && (
                            <Ionicons name="checkmark-circle" size={14} color={c.primary} style={styles.verifiedIcon} />
                        )}
                    </View>
                    <Text style={[styles.metaText, { color: c.subtext }]}>
                        {post.actorRole || 'Member'} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                <TouchableOpacity style={styles.menuIcon}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={c.subtext} />
                </TouchableOpacity>
            </View>

            {/* Title & Body */}
            <View style={styles.content}>
                <Text style={[styles.title, { color: c.text }]}>
                    {post.emoji && <Text>{post.emoji} </Text>}
                    {post.title}
                </Text>
                <Text style={[styles.body, { color: c.text }]} numberOfLines={5}>
                    {post.body}
                </Text>
            </View>

            {/* Flyer Image Container (Fallback for non-project_completed image URLs) */}
            {post.type !== 'project_completed' && post.imageUrl && (
                <View style={styles.flyerContainer}>
                    <Image 
                        source={{ uri: post.imageUrl }} 
                        style={styles.flyerImage} 
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Exact Job Completion Flyer Inline Rendering */}
            {post.type === 'project_completed' && (
                <View style={{ marginHorizontal: -16 }}>
                    <JobCompletionFlyer 
                        inline={true}
                        visible={true}
                        projectData={{
                            title: post.title.replace('Project Success: ', ''),
                            clientName: '', // Usually not exposed broadly across the feed
                            freelancerName: post.actorName || 'Freelancer',
                            freelancerAvatar: post.actorAvatar,
                            completedDate: new Date(post.createdAt).toLocaleDateString(),
                            category: post.actorRole || 'Professional',
                        }}
                    />
                </View>
            )}

            {/* Action Bar (Reactions & Comments) */}
            <FeedReactionBar 
                postId={post._id}
                initialReactions={post.reactions}
                initialMyReaction={post.myReaction}
                commentCount={post.commentCount}
                onCommentPress={() => onCommentPress(post._id)}
                postTitle={post.title}
                postBody={post.body}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    headerTextInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actorName: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    metaText: {
        fontSize: 13,
        marginTop: 3,
        fontWeight: '500',
    },
    menuIcon: {
        padding: 4,
    },
    content: {
        marginBottom: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    body: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '400',
    },
    flyerContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#1E1E2D', // Subtle fallback
    },
    flyerImage: {
        width: '100%',
        aspectRatio: 16 / 9, // Native cinematic landscape bounds
        height: undefined,
    }
});
