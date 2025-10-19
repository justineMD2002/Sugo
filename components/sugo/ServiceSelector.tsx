import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Service = 'delivery' | 'plumbing' | 'aircon' | 'electrician';

type Props = {
  value: Service;
  onChange: (s: Service) => void;
};

const items: { key: Service; label: string; tint: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'delivery', label: 'Delivery', tint: '#dc2626', icon: 'cube' },
  { key: 'plumbing', label: 'Plumbing', tint: '#2563eb', icon: 'construct' },
  { key: 'aircon', label: 'Aircon', tint: '#0d9488', icon: 'snow' },
  { key: 'electrician', label: 'Electrician', tint: '#d97706', icon: 'flash' },
];

export default function ServiceSelector({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((it) => (
        <TouchableOpacity key={it.key} style={styles.item} onPress={() => onChange(it.key)}>
          <View style={[styles.iconBox, { backgroundColor: `${it.tint}22`, borderColor: value === it.key ? `${it.tint}66` : '#e5e7eb', borderWidth: 2 }]}>
            <Ionicons name={it.icon} size={24} color={it.tint} />
          </View>
          <Text style={styles.text}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  item: { alignItems: 'center', gap: 6, flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 11, color: '#374151' },
});


