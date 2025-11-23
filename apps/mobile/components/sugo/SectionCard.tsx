import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type SectionCardProps = {
  title?: string;
  right?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export default function SectionCard({ title, right, style, children }: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>      
      {(title || right) && (
        <View style={styles.headerRow}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!right && <View>{right}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    gap: 8,
  },
});



