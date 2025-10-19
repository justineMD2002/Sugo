import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FilterModalProps = {
  onClose: () => void;
  onApply?: (filters: any) => void;
};

export default function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    service: 'all',
  });

  const filterOptions = {
    dateRange: ['All Time', 'Today', 'This Week', 'This Month'],
    status: ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'],
    service: ['All', 'Delivery', 'Plumbing', 'Aircon', 'Electrician'],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.optionsContainer}>
            {filterOptions.dateRange.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, filters.dateRange === option.toLowerCase().replace(' ', '_') && styles.optionActive]}
                onPress={() => setFilters({ ...filters, dateRange: option.toLowerCase().replace(' ', '_') })}
              >
                <Text style={[styles.optionText, filters.dateRange === option.toLowerCase().replace(' ', '_') && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.optionsContainer}>
            {filterOptions.status.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, filters.status === option.toLowerCase().replace(' ', '_') && styles.optionActive]}
                onPress={() => setFilters({ ...filters, status: option.toLowerCase().replace(' ', '_') })}
              >
                <Text style={[styles.optionText, filters.status === option.toLowerCase().replace(' ', '_') && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.optionsContainer}>
            {filterOptions.service.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, filters.service === option.toLowerCase() && styles.optionActive]}
                onPress={() => setFilters({ ...filters, service: option.toLowerCase() })}
              >
                <Text style={[styles.optionText, filters.service === option.toLowerCase() && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onClose}>
          <Text style={styles.buttonTextSecondary}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {
          onApply?.(filters);
          onClose();
        }}>
          <Text style={styles.buttonTextPrimary}>Apply</Text>
        </TouchableOpacity>
      </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  optionText: {
    fontSize: 13,
    color: '#6b7280',
  },
  optionTextActive: {
    color: '#dc2626',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
    borderRadius: 12,
  },
  buttonTextSecondary: {
    textAlign: 'center',
    color: '#6b7280',
    fontWeight: '600',
  },
  buttonTextPrimary: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});
