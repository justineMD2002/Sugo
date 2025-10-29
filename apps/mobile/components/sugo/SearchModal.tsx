import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchModalProps = {
  onClose: () => void;
  onSearch?: (query: string) => void;
};

export default function SearchModal({ onClose, onSearch }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['SM City Cebu', 'IT Park', 'Ayala Center']);

  const searchResults = [
    { id: 1, type: 'order', title: 'Order #12345', subtitle: 'Delivered', icon: 'checkmark-circle' },
    { id: 2, type: 'order', title: 'Order #12346', subtitle: 'In Progress', icon: 'time' },
    { id: 3, type: 'location', title: 'SM City Cebu', subtitle: 'Popular location', icon: 'location' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.input}
            placeholder="Search orders..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchQuery ? searchResults : recentSearches.map((s, i) => ({ id: i, title: s, type: 'recent' }))}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem}>
            <Ionicons name={(item as any).icon || 'history'} size={20} color="#dc2626" />
            <View style={styles.resultText}>
              <Text style={styles.resultTitle}>{(item as any).title}</Text>
              {(item as any).subtitle && <Text style={styles.resultSubtitle}>{(item as any).subtitle}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
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
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#111827',
    fontSize: 16,
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
