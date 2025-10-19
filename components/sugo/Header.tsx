import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  notificationBadge?: boolean;
};

export default function Header({ 
  title, 
  subtitle, 
  showSearch,
  showNotifications,
  showSettings,
  onSearchPress,
  onNotificationsPress,
  onSettingsPress,
  notificationBadge
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconBtn}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {showNotifications && (
          <TouchableOpacity onPress={onNotificationsPress} style={styles.iconBtn}>
            <Ionicons name="notifications" size={24} color="#fff" />
            {notificationBadge && <View style={styles.badge} />}
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconBtn}>
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    gap: 4,
  },
  right: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
});



