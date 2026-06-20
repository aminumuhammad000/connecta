import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Image, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

interface FeedComposerProps {
    onPostCreated: (newPost: any) => void;
}

export default function FeedComposer({ onPostCreated }: FeedComposerProps) {
    const c = useThemeColors();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);

    const avatarUri = user?.profileImage || user?.avatar
        ? { uri: (user?.profileImage || user?.avatar) as string }
        : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.firstName || 'U'} ${user?.lastName || ''}`).trim()}&background=FD6730&color=fff&size=128` };

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'You';

    const handlePost = async () => {
        if (!text.trim()) return;
        setPosting(true);
        try {
            const payload = {
                type: 'user_post',
                title: text.trim().slice(0, 80), // first 80 chars as title
                body: text.trim(),
                emoji: '📝',
                actorName: displayName,
                actorAvatar: user?.profileImage || user?.avatar || '',
                actorRole: user?.userType === 'client' ? 'Client' : 'Freelancer',
                targetAudience: 'all',
            };
            const newPost = await apiClient.post(`${API_ENDPOINTS.FEED}/create`, payload);
            onPostCreated(newPost);
            setText('');
            setModalVisible(false);
        } catch (err: any) {
            Alert.alert('Error', 'Could not publish post. Please try again.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <>
            {/* Compact Composer Trigger Bar */}
            <TouchableOpacity
                style={[styles.composerBar, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Image source={avatarUri} style={styles.composerAvatar} />
                <Text style={[styles.composerPlaceholder, { color: c.subtext }]}>
                    Share something with the community...
                </Text>
                <View style={[styles.postIconBtn, { backgroundColor: `${c.primary}18` }]}>
                    <Ionicons name="create-outline" size={18} color={c.primary} />
                </View>
            </TouchableOpacity>

            {/* Full Compose Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalWrapper, { backgroundColor: c.background }]}
                >
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                            <Text style={[styles.cancelText, { color: c.subtext }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: c.text }]}>Create Post</Text>
                        <TouchableOpacity
                            style={[
                                styles.publishBtn,
                                { backgroundColor: text.trim() ? c.primary : c.border }
                            ]}
                            onPress={handlePost}
                            disabled={!text.trim() || posting}
                        >
                            {posting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.publishText}>Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Author Row */}
                    <View style={styles.authorRow}>
                        <Image source={avatarUri} style={styles.modalAvatar} />
                        <View>
                            <Text style={[styles.authorName, { color: c.text }]}>{displayName}</Text>
                            <View style={[styles.audiencePill, { backgroundColor: `${c.primary}15`, borderColor: `${c.primary}40` }]}>
                                <Ionicons name="globe-outline" size={12} color={c.primary} />
                                <Text style={[styles.audienceText, { color: c.primary }]}>Public</Text>
                            </View>
                        </View>
                    </View>

                    {/* Text Input */}
                    <TextInput
                        style={[styles.textInput, { color: c.text }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={c.subtext}
                        multiline
                        autoFocus
                        value={text}
                        onChangeText={setText}
                        maxLength={1000}
                    />

                    {/* Char count */}
                    {text.length > 800 && (
                        <Text style={[styles.charCount, { color: text.length > 950 ? '#EF4444' : c.subtext }]}>
                            {1000 - text.length} remaining
                        </Text>
                    )}
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    composerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        marginBottom: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
    },
    composerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    composerPlaceholder: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
    },
    postIconBtn: {
        padding: 8,
        borderRadius: 10,
    },
    modalWrapper: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    cancelBtn: {
        padding: 4,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '500',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    publishBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    publishText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },
    modalAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '700',
    },
    audiencePill: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        gap: 3,
        alignSelf: 'flex-start',
    },
    audienceText: {
        fontSize: 11,
        fontWeight: '600',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        fontSize: 17,
        lineHeight: 26,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});
