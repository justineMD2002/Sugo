import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type NotificationsModalProps = {
  onClose: () => void;
};

const mockNotifications: Notification[] = [
  { id: 1, title: 'Order Confirmed', message: 'Your order #ORD-001 has been confirmed', time: '2:30 PM', unread: true },
  { id: 2, title: 'Rider Assigned', message: 'Mike Johnson is on the way to pick up your order', time: '2:32 PM', unread: true },
  { id: 3, title: 'Order Picked Up', message: 'Your order has been picked up and is on the way', time: '2:45 PM', unread: false },
  { id: 4, title: 'Payment Received', message: 'Payment of ₱85.00 has been received', time: '3:05 PM', unread: false },
];

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={mockNotifications}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.notification, item.unread ? styles.unread : styles.read]}>
            <View style={[styles.dot, item.unread ? { backgroundColor: '#dc2626' } : { backgroundColor: '#d1d5db' }]} />
            <View style={styles.content}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  list: {
    padding: 12,
    gap: 8,
  },
  notification: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  unread: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  read: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
