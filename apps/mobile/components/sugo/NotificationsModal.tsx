import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  related_order_id?: string;
};

type NotificationsModalProps = {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsModal({
  notifications,
  onClose,
  onMarkAllAsRead,
  onClearAll,
}: NotificationsModalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              {onMarkAllAsRead && (
                <TouchableOpacity onPress={onMarkAllAsRead} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              {onClearAll && (
                <TouchableOpacity onPress={onClearAll} style={styles.headerButton}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyMessage}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.notification, !item.is_read ? styles.unread : styles.read]}>
              <View style={[styles.dot, !item.is_read ? { backgroundColor: '#dc2626' } : { backgroundColor: '#d1d5db' }]} />
              <View style={styles.content}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.time}>{formatTime(item.created_at)}</Text>
              </View>
            </View>
          )}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
