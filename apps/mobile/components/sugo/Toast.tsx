import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide?: () => void;
};

export default function Toast({ message, type = 'info', visible, onHide }: ToastProps) {
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide?.());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const iconName = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';
  const bgColor = type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#dbeafe';
  const textColor = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#0284c7';

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.toast, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName as any} size={20} color={textColor} />
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  message: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
  },
});
