import React, { useRef, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ChatMessage = {
  id: number | string;
  sender: 'customer' | 'rider';
  text: string;
  time: string;
};

type ChatProps = {
  messages: ChatMessage[];
  input: string;
  onChangeInput: (v: string) => void;
  onSend: () => void;
  alignRightFor: 'customer' | 'rider';
  disabled?: boolean;
};

export default function Chat({ messages, input, onChangeInput, onSend, alignRightFor, disabled = false }: ChatProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item }) => {
            const isMine = item.sender === alignRightFor;
            return (
              <View style={[styles.row, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.text, isMine ? styles.mineText : styles.theirsText]}>{item.text}</Text>
                  <Text style={[styles.time, isMine ? styles.mineText : styles.time]}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
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
  mine: { backgroundColor: '#dc2626', borderBottomRightRadius: 4 },
  theirs: { backgroundColor: '#f9fafb', borderBottomLeftRadius: 4 },
  text: { fontSize: 14 },
  mineText: { color: '#fff' },
  theirsText: { color: '#111827' },
  time: { fontSize: 10, opacity: 0.7, marginTop: 2, color: '#6b7280' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  send: { backgroundColor: '#dc2626', paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center' },
});


