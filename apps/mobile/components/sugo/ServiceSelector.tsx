import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Service = 'delivery' | 'plumbing' | 'aircon' | 'electrician';

export type ServiceSelectorProps = {
  value: Service;
  onChange: (s: Service) => void;
  disabled?: boolean;
  services?: Service[];
  enableAll?: boolean;
};

const baseItems: { key: Service; label: string; tint: string; icon: keyof typeof Ionicons.glyphMap; isDisabled?: boolean }[] = [
  { key: 'delivery', label: 'Delivery', tint: '#dc2626', icon: 'cube', isDisabled: false },
  { key: 'plumbing', label: 'Plumbing', tint: '#2563eb', icon: 'construct', isDisabled: false },
  { key: 'aircon', label: 'Aircon', tint: '#0d9488', icon: 'snow', isDisabled: false },
  { key: 'electrician', label: 'Electrician', tint: '#d97706', icon: 'flash', isDisabled: false },
];

export default function ServiceSelector({ value, onChange, disabled = false, services, enableAll = false }: ServiceSelectorProps) {
  const visibleItems = (services && services.length > 0)
    ? baseItems.filter((it) => services.includes(it.key))
    : baseItems;

  return (
    <View style={styles.grid}>
      {visibleItems.map((it) => {
        const effectiveDisabled = enableAll ? false : !!it.isDisabled;
        const isItemDisabled = disabled || effectiveDisabled;
        return (
          <TouchableOpacity
            key={it.key}
            style={[styles.item, isItemDisabled && { opacity: 0.4 }]}
            onPress={() => !isItemDisabled && onChange(it.key)}
            disabled={isItemDisabled}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: `${it.tint}22`,
                  borderColor: value === it.key ? `${it.tint}66` : '#e5e7eb',
                  borderWidth: 2,
                },
              ]}
            >
              <Ionicons name={it.icon} size={24} color={it.tint} />
            </View>
            <Text style={styles.text}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  item: { alignItems: 'center', gap: 6, flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 11, color: '#374151' },
});


