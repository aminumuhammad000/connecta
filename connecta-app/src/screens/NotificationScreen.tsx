import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { get, patch, del } from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

const NotificationScreen = () => {
  const c = useThemeColors();
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await get(API_ENDPOINTS.NOTIFICATIONS);
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(id), {});
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await patch(API_ENDPOINTS.MARK_ALL_READ, {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await del(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'proposal_received':
      case 'proposal_new':
        return { name: 'file-text-o', color: '#6366F1', type: 'fa' };
      case 'proposal_accepted':
      case 'project_started':
        return { name: 'check-circle', color: '#10B981', type: 'mi' };
      case 'payment_received':
      case 'payment_released':
        return { name: 'wallet', color: '#F59E0B', type: 'mi' };
      case 'gig_matched':
        return { name: 'target', color: '#EF4444', type: 'io' };
      case 'message_received':
        return { name: 'chatbox-ellipses', color: '#3B82F6', type: 'io' };
      case 'job_invite':
        return { name: 'mail', color: '#8B5CF6', type: 'mi' };
      default:
        return { name: 'notifications', color: c.primary, type: 'mi' };
    }
  };

  const renderIcon = (type: string) => {
    const icon = getIcon(type);
    if (icon.type === 'fa') return <FontAwesome5 name={icon.name} size={20} color={icon.color} />;
    if (icon.type === 'io') return <Ionicons name={icon.name as any} size={22} color={icon.color} />;
    return <MaterialIcons name={icon.name as any} size={22} color={icon.color} />;
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigation logic based on relatedType
    if (notification.relatedType === 'job' && notification.relatedId) {
      navigation.navigate('JobDetails', { jobId: notification.relatedId });
    } else if (notification.relatedType === 'project' && notification.relatedId) {
      navigation.navigate('ProjectDetails', { projectId: notification.relatedId });
    } else if (notification.relatedType === 'proposal' && notification.relatedId) {
      navigation.navigate('ProposalDetails', { proposalId: notification.relatedId });
    } else if (notification.relatedType === 'payment') {
      navigation.navigate('Wallet');
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        { backgroundColor: item.isRead ? c.card : c.primary + '08', borderColor: item.isRead ? c.border : c.primary + '30' }
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => {
        Alert.alert(
          'Delete Notification',
          'Are you sure you want to remove this notification?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(item._id) }
          ]
        );
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: item.isRead ? c.background : '#FFF' }]}>
        {renderIcon(item.type)}
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: c.text, fontWeight: item.isRead ? '600' : '800' }]}>
            {item.title}
          </Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />}
        </View>
        <Text style={[styles.message, { color: c.subtext }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: c.subtext + '80' }]}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerAction}>
          <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchNotifications(false)} tintColor={c.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBox, { backgroundColor: c.card }]}>
                <Ionicons name="notifications-off-outline" size={60} color={c.subtext + '40'} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.text }]}>No notifications yet</Text>
              <Text style={[styles.emptySub, { color: c.subtext }]}>
                We'll notify you when something important happens!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerAction: { paddingVertical: 8 },
  list: { padding: 20, paddingBottom: 100 },
  notificationContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  content: { flex: 1, marginLeft: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, marginBottom: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 11, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: 'center', maxWidth: 250, opacity: 0.7, lineHeight: 22 },
});

export default NotificationScreen;
