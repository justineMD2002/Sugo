import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CallOptionsModalProps = {
  onClose: () => void;
  onViberPress?: () => void;
  onPhonePress?: () => void;
};

export default function CallOptionsModal({ onClose, onViberPress, onPhonePress }: CallOptionsModalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Call Rider</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.viberBtn} onPress={onViberPress}>
          <Ionicons name="call" size={20} color="#8b5cf6" />
          <Text style={styles.viberText}>Call via Viber</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.phoneBtn} onPress={onPhonePress}>
          <Ionicons name="call" size={20} color="#2563eb" />
          <Text style={styles.phoneText}>Call via Phone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  viberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
  },
  viberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
});
