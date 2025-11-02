import React, { useRef, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ChatMessage = {
  id: number | string;
  sender: 'customer' | 'rider';
  text: string;
  time: string;
  messageType?: 'text' | 'image';
  attachmentUrl?: string;
};

type ChatProps = {
  messages: ChatMessage[];
  input: string;
  onChangeInput: (v: string) => void;
  onSend: () => void;
  onImagePick?: () => void;
  alignRightFor: 'customer' | 'rider';
  disabled?: boolean;
  imageUploading?: boolean;
  bottomPadding?: number;
};

export default function Chat({ messages, input, onChangeInput, onSend, onImagePick, alignRightFor, disabled = false, imageUploading = false, bottomPadding = 12 }: ChatProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 12, paddingBottom: 20, gap: 8 }}
          renderItem={({ item }) => {
            const isMine = item.sender === alignRightFor;
            const isImage = item.messageType === 'image';
            return (
              <View style={[styles.row, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.bubble, isMine ? styles.mine : styles.theirs, isImage && styles.imageBubble]}>
                  {isImage && item.attachmentUrl ? (
                    <>
                      <Image source={{ uri: item.attachmentUrl }} style={styles.messageImage} />
                      {item.text ? (
                        <Text style={[styles.text, isMine ? styles.mineText : styles.theirsText, { marginTop: 4 }]}>{item.text}</Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={[styles.text, isMine ? styles.mineText : styles.theirsText]}>{item.text}</Text>
                  )}
                  <Text style={[styles.time, isMine ? styles.mineText : styles.time]}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.inputRow, { paddingBottom: bottomPadding }]}>
          {onImagePick && (
            <TouchableOpacity
              style={[styles.imageButton, (disabled || imageUploading) && { opacity: 0.5 }]}
              onPress={onImagePick}
              disabled={disabled || imageUploading}
            >
              {imageUploading ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Ionicons name="image" size={22} color="#dc2626" />
              )}
            </TouchableOpacity>
          )}
          <TextInput
            style={[styles.input, disabled && { opacity: 0.5 }]}
            value={input}
            onChangeText={onChangeInput}
            placeholder="Type a message..."
            editable={!disabled}
          />
          <TouchableOpacity
            style={[styles.send, disabled && { opacity: 0.5 }]}
            onPress={onSend}
            disabled={disabled}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  imageBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  mine: { backgroundColor: '#dc2626', borderBottomRightRadius: 4 },
  theirs: { backgroundColor: '#f9fafb', borderBottomLeftRadius: 4 },
  text: { fontSize: 14 },
  mineText: { color: '#fff' },
  theirsText: { color: '#111827' },
  time: { fontSize: 10, opacity: 0.7, marginTop: 2, color: '#6b7280' },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  send: { backgroundColor: '#dc2626', paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center' },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});


