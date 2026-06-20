import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { FeedReactions, ReactionType, feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

interface FeedReactionBarProps {
    postId: string;
    initialReactions: FeedReactions;
    initialMyReaction?: ReactionType;
    commentCount: number;
    onCommentPress: () => void;
    postTitle?: string;
    postBody?: string;
}

const REACTION_ICONS: Record<ReactionType, { icon: string; color: string; label: string }> = {
    celebrate: { icon: '🎉', color: '#10B981', label: 'Celebrate' },
    insightful: { icon: '💡', color: '#3B82F6', label: 'Insightful' },
    clap: { icon: '👏', color: '#F59E0B', label: 'Clap' },
    fire: { icon: '🔥', color: '#EF4444', label: 'Fire' },
    love: { icon: '❤️', color: '#EC4899', label: 'Love' },
};

export default function FeedReactionBar({
    postId,
    initialReactions,
    initialMyReaction,
    commentCount,
    onCommentPress,
    postTitle,
    postBody
}: FeedReactionBarProps) {
    const c = useThemeColors();
    const { user } = useAuth();
    
    const [reactions, setReactions] = useState<FeedReactions>(initialReactions);
    const [myReaction, setMyReaction] = useState<ReactionType | undefined>(initialMyReaction);
    const [showReactionMenu, setShowReactionMenu] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const totalReactions = Object.values(reactions).reduce((acc, curr) => acc + curr.length, 0);

    const handleReaction = async (type: ReactionType) => {
        if (!user) return;
        setShowReactionMenu(false);

        // Optimistic UI Update
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        const previousReaction = myReaction;
        const previousReactions = { ...reactions };
        
        try {
            const newReactions = { ...reactions };
            
            if (previousReaction) {
                newReactions[previousReaction] = newReactions[previousReaction].filter(id => id !== user._id);
            }
            
            if (previousReaction !== type) {
                newReactions[type] = [...newReactions[type], user._id];
                setMyReaction(type);
                setReactions(newReactions);
                await feedService.reactToPost(postId, type);
            } else {
                setMyReaction(undefined);
                setReactions(newReactions);
                await feedService.removeReaction(postId);
            }
        } catch (error) {
            // Revert on failure
            setMyReaction(previousReaction);
            setReactions(previousReactions);
        }
    };

    const handleShare = async () => {
        try {
            const importShare = await import('react-native');
            const Share = importShare.Share;
            
            const shareTitle = postTitle ? `Check out this Connecta post: ${postTitle}` : 'Check out this post on Connecta!';
            const shareBody = postBody ? `\n\n"${postBody}"` : '';
            const shareUrl = `\n\nRead more at: https://myconnecta.ng/post/${postId}`;
            
            await Share.share({
                message: `${shareTitle}${shareBody}${shareUrl}`,
                title: 'Share Connecta Post' // For Android/Email intents
            });
        } catch (error) {
            console.error('Error sharing post', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Reaction Summary */}
            {(totalReactions > 0 || commentCount > 0) && (
                <View style={[styles.summaryContainer, { borderBottomColor: c.border }]}>
                    <View style={styles.summaryLeft}>
                        {totalReactions > 0 && (
                            <>
                                <View style={styles.reactionAvatars}>
                                    {Object.entries(reactions)
                                        .filter(([_, users]) => users.length > 0)
                                        .slice(0, 3)
                                        .map(([type]) => (
                                            <Text key={type} style={styles.summaryEmoji}>
                                                {REACTION_ICONS[type as ReactionType].icon}
                                            </Text>
                                        ))}
                                </View>
                                <Text style={[styles.summaryText, { color: c.subtext }]}>
                                    {totalReactions} {/* Could add logic for "You and X others" */}
                                </Text>
                            </>
                        )}
                    </View>
                    <TouchableOpacity onPress={onCommentPress}>
                        <Text style={[styles.summaryText, { color: c.subtext }]}>
                            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Action Bar */}
            <View style={styles.actionBar}>
                {showReactionMenu && (
                    <View style={[styles.reactionMenu, { backgroundColor: c.card, shadowColor: c.text }]}>
                        {Object.entries(REACTION_ICONS).map(([type, data]) => (
                            <TouchableOpacity 
                                key={type} 
                                style={styles.reactionMenuItem}
                                onPress={() => handleReaction(type as ReactionType)}
                            >
                                <Text style={styles.reactionMenuEmoji}>{data.icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleReaction(myReaction ? myReaction : 'celebrate')}
                    onLongPress={() => setShowReactionMenu(true)}
                >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        {myReaction ? (
                            <Text style={styles.activeReactionEmoji}>{REACTION_ICONS[myReaction].icon}</Text>
                        ) : (
                            <Ionicons name="thumbs-up-outline" size={20} color={c.subtext} />
                        )}
                    </Animated.View>
                    <Text style={[
                        styles.actionText, 
                        { color: myReaction ? REACTION_ICONS[myReaction].color : c.subtext }
                    ]}>
                        {myReaction ? REACTION_ICONS[myReaction].label : 'React'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
                    <Ionicons name="chatbubble-outline" size={20} color={c.subtext} />
                    <Text style={[styles.actionText, { color: c.subtext }]}>Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="share-social-outline" size={20} color={c.subtext} />
                    <Text style={[styles.actionText, { color: c.subtext }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        marginBottom: 4,
    },
    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionAvatars: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    summaryEmoji: {
        fontSize: 12,
        marginRight: -4,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        position: 'relative',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    activeReactionEmoji: {
        fontSize: 18,
    },
    reactionMenu: {
        position: 'absolute',
        bottom: 50,
        left: 10,
        flexDirection: 'row',
        borderRadius: 30,
        padding: 8,
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        zIndex: 100,
    },
    reactionMenuItem: {
        marginHorizontal: 8,
        transform: [{ scale: 1.2 }],
    },
    reactionMenuEmoji: {
        fontSize: 24,
    }
});
