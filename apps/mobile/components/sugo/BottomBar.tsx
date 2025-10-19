import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Item = { key: string; label: string; icon?: keyof typeof Ionicons.glyphMap };

type BottomBarProps = {
  items: Item[];
  current: string;
  onChange: (k: string) => void;
};

export default function BottomBar({ items, current, onChange }: BottomBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {items.map((it) => (
          <TouchableOpacity key={it.key} style={styles.btn} onPress={() => onChange(it.key)}>
            {it.icon && (
              <Ionicons
                name={it.icon}
                size={24}
                color={current === it.key ? '#dc2626' : '#9ca3af'}
              />
            )}
            <Text style={[styles.label, current === it.key ? styles.active : styles.inactive]}>{it.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  btn: { alignItems: 'center', gap: 4 },
  label: { fontSize: 12, fontWeight: '600' },
  active: { color: '#dc2626' },
  inactive: { color: '#9ca3af' },
});


