import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { scheduleLocalNotification } from '../utils/notifications';
import { useInAppAlert } from '../components/InAppAlert';

// Dummy data for notifications
const dummyNotifications = [
  { id: '1', title: 'Payment Received', description: 'Your payment for Project X was successful.', time: '2h ago', icon: 'wallet-outline' },
  { id: '2', title: 'New Message', description: 'You have a new message from John.', time: '5h ago', icon: 'chatbubble-ellipses-outline' },
  { id: '3', title: 'Job Invitation', description: 'A client invited you to apply for a new job.', time: '1d ago', icon: 'document-text-outline' },
];

type Notification = typeof dummyNotifications[0];

type NotificationsScreenNavigationProp = NativeStackNavigationProp<any, any>;

type Props = {
  navigation: NotificationsScreenNavigationProp;
};

const Header = ({ navigation, c }: { navigation: NotificationsScreenNavigationProp, c: any }) => (
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
    <View style={styles.placeholder} />
  </View>
);

export default function NotificationsScreen({ navigation }: Props) {
  const c = useThemeColors();
  const { showAlert } = useInAppAlert();

  const handlePress = (item: Notification) => {
    navigation.navigate('NotificationDetail', { notification: item });
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
      <View style={[styles.item, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name={item.icon as any} size={24} color={c.primary} style={styles.icon} />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
            <Text style={[styles.time, { color: c.subtext }]}>{item.time}</Text>
          </View>
          <Text style={[styles.description, { color: c.subtext }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <Header navigation={navigation} c={c} />
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => scheduleLocalNotification('Hello from Connecta', 'This is a local push preview.')}
          style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
          activeOpacity={0.85}
        >
          <Ionicons name="notifications" size={18} color={c.primary} />
          <Text style={[styles.actionText, { color: c.text }]}>Test Local Push</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => showAlert({ title: 'Beautiful Alert', message: 'This is a modern in-app alert.', type: 'success' })}
          style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={18} color={c.primary} />
          <Text style={[styles.actionText, { color: c.text }]}>Show In-App Alert</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={dummyNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    marginTop: 18,
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
