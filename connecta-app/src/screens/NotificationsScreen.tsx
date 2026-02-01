import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { scheduleLocalNotification } from '../utils/notifications';
import { useInAppAlert } from '../components/InAppAlert';
import * as notificationService from '../services/notificationService';
import { Notification } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useSocket } from '../context/SocketContext';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<any, any>;

type Props = {
  navigation: NotificationsScreenNavigationProp;
};

const Header = ({ navigation, c, onMarkAllRead }: { navigation: NotificationsScreenNavigationProp, c: any, onMarkAllRead: () => void }) => (
  <View
    style={[
      styles.header,
      {
        borderBottomColor: c.border,
        backgroundColor: c.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    ]}
  >
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons name="chevron-back" size={24} color={c.text} />
    </TouchableOpacity>
    <Text style={[styles.headerTitle, { color: c.text }]}>Notifications</Text>
    <TouchableOpacity onPress={onMarkAllRead} style={styles.markAllButton}>
      <Ionicons name="checkmark-done" size={20} color={c.primary} />
    </TouchableOpacity>
  </View>
);

export default function NotificationsScreen({ navigation }: Props) {
  const c = useThemeColors();
  const { showAlert } = useInAppAlert();
  const { refreshUnreadNotificationCount } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      // Also refresh the global count while we are here
      refreshUnreadNotificationCount();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      refreshUnreadNotificationCount();
      showAlert({ title: 'Success', message: 'All notifications marked as read', type: 'success' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      showAlert({ title: 'Error', message: 'Failed to mark all as read', type: 'error' });
    }
  };

  const handlePress = async (item: Notification) => {
    // 1. Mark as read immediately
    if (!item.read && !item.isRead) {
      try {
        await notificationService.markAsRead(item._id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, read: true, isRead: true } : n));
        refreshUnreadNotificationCount();
      } catch (e) {
        console.error("Failed to mark read", e);
      }
    }

    // 2. Navigate based on type/relatedType
    const { type, relatedId, relatedType } = item;

    // Collabo invite -> Check role status first
    if (type === 'collabo_invite' && relatedId) {
      try {
        // Fetch role to check if already accepted
        const { getRole } = await import('../services/collaboService');
        const roleData = await getRole(relatedId);
        const role = (roleData as any)?.role || roleData;
        const project = (roleData as any)?.project || {};

        // If already accepted by current user, go directly to workspace
        if (role.status === 'filled' && role.freelancerId?._id === (item as any).userId) {
          navigation.navigate('CollaboWorkspace', { projectId: project._id });
        } else {
          // Otherwise show invite screen
          navigation.navigate('CollaboInvite', { roleId: relatedId });
        }
      } catch (error) {
        // If error, still try to show invite screen
        navigation.navigate('CollaboInvite', { roleId: relatedId });
      }
      return;
    }

    // Project / Payment related -> Project Detail
    if ((relatedType === 'project' || type === 'project_started' || type === 'payment_released' || type === 'proposal_accepted') && relatedId) {
      navigation.navigate('ProjectDetail', { id: relatedId });
      return;
    }

    if (relatedType === 'job' && relatedId) {
      navigation.navigate('JobDetail', { id: relatedId });
      return;
    }

    if (relatedType === 'proposal' && relatedId) {
      navigation.navigate('ProposalDetail', { id: relatedId });
      return;
    }

    if (relatedType === 'message' || type === 'message_received') {
      if (relatedId) navigation.navigate('MessagesDetail', { conversationId: relatedId });
      return;
    }

    // Fallback
    navigation.navigate('NotificationDetail', { notification: item });
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'payment':
      case 'payment_received':
      case 'payment_released':
        return 'wallet-outline';
      case 'message':
      case 'message_received':
        return 'chatbubble-ellipses-outline';
      case 'job':
      case 'project_started':
      case 'project_completed':
        return 'briefcase-outline';
      case 'proposal':
      case 'proposal_received':
      case 'proposal_accepted':
      case 'proposal_rejected':
        return 'document-text-outline';
      case 'system': return 'information-circle-outline';
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'alert-circle-outline';
      case 'warning': return 'warning-outline';
      default: return 'notifications-outline';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: Notification }) => {
    if (!item) return null;
    return (
      <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
        <View style={[styles.item, { backgroundColor: item.read ? c.background : c.card, borderColor: c.border }]}>
          <Ionicons name={getIconName(item.type) as any} size={24} color={c.primary} style={styles.icon} />
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={[styles.title, { color: c.text, fontWeight: item.read ? '400' : '700' }]}>{item.title}</Text>
              <Text style={[styles.time, { color: c.subtext }]}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={[styles.description, { color: c.subtext }]} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <Header navigation={navigation} c={c} onMarkAllRead={handleMarkAllRead} />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[c.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="notifications-off-outline" size={48} color={c.subtext} />
              <Text style={{ color: c.subtext, marginTop: 12 }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  markAllButton: {
    padding: 4,
  },
  placeholder: {
    width: 28, // to balance the back button
  },
  list: { padding: 16, paddingBottom: 32 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  icon: {
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12 },
  description: { fontSize: 14 },
});
