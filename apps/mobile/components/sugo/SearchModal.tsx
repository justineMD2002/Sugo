import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchModalProps = {
  onClose: () => void;
  onSearch: (query: string) => void;
  pastOrders?: any[];
  currentQuery?: string;
};

export default function SearchModal({
  onClose,
  onSearch,
  pastOrders = [],
  currentQuery = ''
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [recentSearches] = useState(['SM City Cebu', 'IT Park', 'Ayala Center', 'Mandaue City', 'Lahug']);

  // Filter past orders based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return pastOrders.filter(order =>
      (order.order_number || order.id || '').toString().toLowerCase().includes(query) ||
      (order.pickup_address || '').toLowerCase().includes(query) ||
      (order.delivery_address || '').toLowerCase().includes(query) ||
      (order.rider_name || '').toLowerCase().includes(query) ||
      (order.status || '').toLowerCase().includes(query)
    ).map(order => ({
      id: order.id,
      type: 'order',
      title: `Order #${order.order_number || order.id}`,
      subtitle: `${order.status?.replace('_', ' ') || 'Unknown'} • ${order.pickup_address?.substring(0, 30) || 'No pickup address'}...`,
      icon: order.status === 'delivered' || order.status === 'completed' ? 'checkmark-circle' :
            order.status === 'cancelled' ? 'close-circle' : 'time',
      order: order
    }));
  }, [searchQuery, pastOrders]);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
    onSearch(search);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchInputContainer}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Search orders by ID, address, rider..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchQuery ? searchResults : recentSearches.map((s, i) => ({ id: i, title: s, type: 'recent' as const, icon: 'history' as const, subtitle: '', order: null }))}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
              if (item.type === 'recent') {
                handleRecentSearchPress(item.title);
              } else {
                console.log('Selected order:', item.order);
              }
            }}
          >
            <Ionicons name={(item as any).icon || 'history'} size={20} color="#dc2626" />
            <View style={styles.resultText}>
              <Text style={styles.resultTitle}>{(item as any).title}</Text>
              {(item as any).subtitle && <Text style={styles.resultSubtitle}>{(item as any).subtitle}</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={!searchQuery ? (
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
          </View>
        ) : null}
        ListEmptyComponent={() => (
          searchQuery ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={24} color="#9ca3af" />
              <Text style={styles.emptyText}>No orders found matching &quot;{searchQuery}&quot;</Text>
            </View>
          ) : null
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
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentHeader: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
});
