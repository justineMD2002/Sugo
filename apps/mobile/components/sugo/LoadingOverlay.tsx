import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.title}>Loading</Text>
        <Text style={styles.desc}>Please wait...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '85%', gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  desc: { color: '#6b7280' },
});



