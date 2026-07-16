import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { FeedPost } from '../services/feedService';
import FeedReactionBar from './FeedReactionBar';
import { formatDistanceToNow } from 'date-fns';
import JobCompletionFlyer from './JobCompletionFlyer';
import FeedPollWidget from './FeedPollWidget';
import { useAuth } from '../context/AuthContext';

interface FeedPostCardProps {
    post: FeedPost;
    onPressProfile: (userId?: string) => void;
    onCommentPress: (postId: string) => void;
    onEditPress?: (post: FeedPost) => void;
    onDeletePress?: (postId: string) => void;
    onPressJob?: (jobId: string) => void;
}

export default function FeedPostCard({ post, onPressProfile, onCommentPress, onEditPress, onDeletePress, onPressJob }: FeedPostCardProps) {
    const c = useThemeColors();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    const isLongText = post.body && post.body.length > 150;

    const isOfficial = post.actorRole === 'admin';
    const isSystemPost = post.isSystemPost || post.type === 'system' || post.actorRole === 'system';
    const displayName = isOfficial ? 'Connecta Official' : (isSystemPost ? 'System' : (post.actorName || 'User'));
    const displayRole = isOfficial ? 'Official' : (isSystemPost ? 'System' : (post.actorRole || 'Member'));

    const getActorImage = () => {
        if (post.actorAvatar) return { uri: post.actorAvatar };
        const name = isOfficial ? 'Connecta Official' : (isSystemPost ? 'System' : (post.actorName || 'User'));
        return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` };
    };

    return (
        <View style={[styles.card, { backgroundColor: c.card }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => post.actor && onPressProfile(post.actor)}>
                    <Image 
                        source={getActorImage()} 
                        style={[styles.avatar, { backgroundColor: '#E5E7EB' }]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <View style={styles.headerTextInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.actorName, { color: isOfficial ? '#FD6730' : (isSystemPost ? '#FD6730' : c.text) }]} numberOfLines={1}>
                            {displayName}
                        </Text>
                        {(isSystemPost || isOfficial) && (
                            <Ionicons name="checkmark-circle" size={14} color={isOfficial || isSystemPost ? '#FD6730' : c.primary} style={styles.verifiedIcon} />
                        )}
                    </View>
                    <Text style={[styles.metaText, { color: c.subtext }]}>
                        {displayRole} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                
                {user && user._id === post.actor && (
                    <TouchableOpacity 
                        style={styles.menuIcon}
                        onPress={() => {
                            Alert.alert("Post Options", "What would you like to do?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Edit Post", onPress: () => onEditPress && onEditPress(post) },
                                { text: "Delete Post", style: "destructive", onPress: () => onDeletePress && onDeletePress(post._id) }
                            ]);
                        }}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color={c.subtext} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Title & Body */}
            {post.type === 'user_post' && !post.imageUrl ? (
                // Facebook-style Color Box for User Posts (Now uniform)
                <View style={[styles.coloredBox, { backgroundColor: c.primary }]}>
                    <Text style={styles.coloredBoxText} numberOfLines={isExpanded ? undefined : 4} ellipsizeMode="tail">
                        {post.body}
                    </Text>
                    {isLongText && (
                        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ marginTop: 8 }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                {isExpanded ? 'See Less' : 'Read More'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : post.type === 'job_posted' || post.type === 'proposal_accepted' || post.type === 'proposal_submitted' || post.type === 'new_member' ? (
                // Special Transparent Activity Cards
                <View style={[styles.activityContent, { backgroundColor: c.isDark ? '#1F2937' : '#F3F4F6', borderColor: c.border }]}>
                    <View style={styles.activityIconWrapper}>
                        <Text style={styles.activityEmoji}>{post.emoji}</Text>
                    </View>
                    <View style={styles.activityTextWrapper}>
                        <Text style={[styles.activityTitle, { color: c.text }]}>{post.title}</Text>
                        <Text style={[styles.activityBody, { color: c.subtext }]} numberOfLines={3}>
                            {post.body}
                        </Text>
                        {post.type === 'job_posted' && (
                           <TouchableOpacity 
                               onPress={() => onPressJob && post.relatedId && onPressJob(post.relatedId)} 
                               style={[styles.activityBtn, { backgroundColor: c.primary }]}
                           >
                               <Text style={styles.activityBtnText}>View Job</Text>
                           </TouchableOpacity>
                        )}
                        {post.type === 'new_member' && (
                           <TouchableOpacity onPress={() => onPressProfile(post.relatedId || post.actor)} style={[styles.activityBtn, { backgroundColor: c.primary }]}>
                               <Text style={styles.activityBtnText}>View Profile</Text>
                           </TouchableOpacity>
                        )}
                    </View>
                </View>
            ) : (
                // Standard Text Layout for general System Posts
                <View style={styles.content}>
                    {post.title && post.type !== 'user_post' && (
                        <Text style={[styles.title, { color: c.text }]}>
                            {post.title}
                        </Text>
                    )}
                    <Text style={[styles.body, { color: c.text }]} numberOfLines={isExpanded ? undefined : 4}>
                        {post.body}
                    </Text>
                    {isLongText && (
                        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ marginTop: 4 }}>
                            <Text style={{ color: c.primary, fontWeight: '600' }}>
                                {isExpanded ? 'See Less' : 'Read More...'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Video Play Container */}
            {post.videoUrl && (
                <TouchableOpacity style={styles.videoContainer} onPress={() => Linking.openURL(post.videoUrl!)}>
                    <View style={styles.videoPlayOverlay}>
                        <Ionicons name="play-circle" size={60} color="#FFFFFF" />
                        <Text style={styles.videoPlayText}>Watch Video</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Flyer Image Container (Fallback for non-project_completed image URLs) */}
            {post.type !== 'project_completed' && post.imageUrl && !post.videoUrl && (
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

            {/* Poll Widget */}
            {post.type === 'community_poll' && post.poll && (
                <FeedPollWidget 
                    postId={post._id}
                    question={post.poll.question}
                    options={post.poll.options}
                    closesAt={post.poll.closesAt}
                />
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
        marginBottom: 12,
        marginHorizontal: 8,
        padding: 16,
        paddingBottom: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    headerTextInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actorName: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    metaText: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '400',
    },
    menuIcon: {
        padding: 4,
    },
    content: {
        marginBottom: 16,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 22,
    },
    body: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '400',
    },
    coloredBox: {
        marginHorizontal: -16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 220,
        borderRadius: 14,
    },
    coloredBoxText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 28,
    },
    flyerContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1E1E2D',
    },
    flyerImage: {
        width: '100%',
        aspectRatio: 16 / 9, // Native cinematic landscape bounds
        height: undefined,
    },
    activityContent: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    activityIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    activityEmoji: {
        fontSize: 24,
    },
    activityTextWrapper: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    activityBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    activityBtn: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    activityBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    videoPlayOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoPlayText: {
        color: '#FFFFFF',
        marginTop: 8,
        fontWeight: '600',
        fontSize: 16,
    }
});
