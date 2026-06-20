import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

interface PollOption {
    text: string;
    votes: string[];
}

interface FeedPollWidgetProps {
    postId: string;
    question: string;
    options: PollOption[];
    closesAt?: string;
    onVote?: (updatedOptions: PollOption[]) => void;
}

export default function FeedPollWidget({ postId, question, options, closesAt, onVote }: FeedPollWidgetProps) {
    const c = useThemeColors();
    const { user } = useAuth();
    const [localOptions, setLocalOptions] = useState<PollOption[]>(options);
    const [isVoting, setIsVoting] = useState(false);

    const userId = user?._id || '';
    const totalVotes = localOptions.reduce((acc, o) => acc + o.votes.length, 0);
    const myVoteIndex = localOptions.findIndex(o => o.votes.includes(userId));
    const hasVoted = myVoteIndex !== -1;
    const isClosed = closesAt ? new Date(closesAt) < new Date() : false;
    const showResults = hasVoted || isClosed;

    const handleVote = async (index: number) => {
        if (!user || isVoting || isClosed || hasVoted) return;
        setIsVoting(true);

        // Optimistic update
        const updated = localOptions.map((o, i) => ({
            ...o,
            votes: i === index ? [...o.votes, userId] : o.votes,
        }));
        setLocalOptions(updated);

        try {
            await feedService.voteOnPoll(postId, index);
            onVote?.(updated);
        } catch {
            setLocalOptions(options); // revert
        } finally {
            setIsVoting(false);
        }
    };

    const getPercent = (option: PollOption) => {
        if (totalVotes === 0) return 0;
        return Math.round((option.votes.length / totalVotes) * 100);
    };

    return (
        <View style={[styles.container, { borderColor: c.border }]}>
            {/* Poll Question */}
            <Text style={[styles.question, { color: c.text }]}>{question}</Text>

            {/* Options */}
            {localOptions.map((option, index) => {
                const pct = getPercent(option);
                const isMyVote = index === myVoteIndex;
                const isLeading = pct === Math.max(...localOptions.map(getPercent)) && pct > 0;

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionRow,
                            {
                                borderColor: isMyVote ? c.primary : c.border,
                                backgroundColor: isMyVote
                                    ? `${c.primary}10`
                                    : c.card,
                            },
                        ]}
                        onPress={() => handleVote(index)}
                        disabled={showResults || isVoting}
                        activeOpacity={0.75}
                    >
                        {/* Animated fill bar */}
                        {showResults && (
                            <View
                                style={[
                                    styles.fillBar,
                                    {
                                        width: `${pct}%`,
                                        backgroundColor: isMyVote
                                            ? `${c.primary}35`
                                            : `${c.border}80`,
                                    },
                                ]}
                            />
                        )}

                        {/* Option text row */}
                        <View style={styles.optionContent}>
                            <View style={styles.optionLeft}>
                                {showResults ? (
                                    isMyVote ? (
                                        <Ionicons name="checkmark-circle" size={16} color={c.primary} style={styles.optionIcon} />
                                    ) : (
                                        <View style={[styles.dot, { borderColor: c.border }]} />
                                    )
                                ) : (
                                    <View style={[styles.dot, { borderColor: c.border }]} />
                                )}
                                <Text
                                    style={[
                                        styles.optionText,
                                        { color: c.text },
                                        isMyVote && { fontWeight: '700', color: c.primary },
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </View>
                            {showResults && (
                                <Text
                                    style={[
                                        styles.pctText,
                                        { color: isMyVote ? c.primary : c.subtext },
                                        isLeading && { fontWeight: '800' },
                                    ]}
                                >
                                    {pct}%
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}

            {/* Footer */}
            <View style={styles.footer}>
                <Ionicons name="people-outline" size={13} color={c.subtext} />
                <Text style={[styles.footerText, { color: c.subtext }]}>
                    {' '}{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    {isClosed ? ' • Poll closed' : !hasVoted ? ' • Tap to vote' : ' • Thanks for voting!'}
                </Text>
                {closesAt && !isClosed && (
                    <Text style={[styles.footerText, { color: c.subtext }]}>
                        {' '}• Closes {new Date(closesAt).toLocaleDateString()}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 14,
        overflow: 'hidden',
        padding: 14,
    },
    question: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        lineHeight: 21,
    },
    optionRow: {
        position: 'relative',
        borderWidth: 1.5,
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
        minHeight: 44,
        justifyContent: 'center',
    },
    fillBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        borderRadius: 8,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        zIndex: 1,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIcon: {
        marginRight: 8,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        marginRight: 10,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    pctText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
