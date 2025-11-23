import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ShareModalProps = {
  onClose: () => void;
  orderNumber?: string;
};

export default function ShareModal({ onClose, orderNumber }: ShareModalProps) {
  const [shareType, setShareType] = useState<'order' | 'app'>('order');
  const [message, setMessage] = useState('');

  const shareOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'telegram', name: 'Telegram', icon: 'send', color: '#0088cc' },
    { id: 'copy', name: 'Copy Link', icon: 'copy', color: '#6B7280' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Share</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Share Type Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, shareType === 'order' && styles.tabActive]}
            onPress={() => setShareType('order')}
          >
            <Text style={[styles.tabText, shareType === 'order' && styles.tabTextActive]}>
              Share Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, shareType === 'app' && styles.tabActive]}
            onPress={() => setShareType('app')}
          >
            <Text style={[styles.tabText, shareType === 'app' && styles.tabTextActive]}>
              Share App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Add a message (optional)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <View style={styles.optionsGrid}>
            {shareOptions.map((option) => (
              <TouchableOpacity 
                key={option.id}
                style={[styles.shareOption, { borderColor: option.color }]}
                onPress={() => onClose()}
              >
                <View style={[styles.iconBox, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.optionName}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              {shareType === 'order' 
                ? `Check out my order #${orderNumber || '12345'} on Sugo! ${message}`
                : `Download Sugo - The best delivery and service app! ${message}`
              }
            </Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#dc2626',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#111827',
    fontSize: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shareOption: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#f9fafb',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  preview: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  previewText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});
