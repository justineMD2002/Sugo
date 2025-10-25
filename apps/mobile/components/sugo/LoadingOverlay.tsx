import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

type LoadingOverlayProps = {
  type?: 'finding-rider' | 'uploading-picture' | 'general';
  customTitle?: string;
  customDescription?: string;
};

export default function LoadingOverlay({
  type = 'finding-rider',
  customTitle,
  customDescription
}: LoadingOverlayProps) {
  const getTitle = () => {
    if (customTitle) return customTitle;

    switch (type) {
      case 'finding-rider':
        return 'Finding Rider';
      case 'uploading-picture':
        return 'Uploading Picture';
      case 'general':
        return 'Loading...';
      default:
        return 'Loading...';
    }
  };

  const getDescription = () => {
    if (customDescription) return customDescription;

    switch (type) {
      case 'finding-rider':
        return 'Please wait while we match you with the best available rider...';
      case 'uploading-picture':
        return 'Please wait while we upload your profile picture...';
      case 'general':
        return 'Please wait...';
      default:
        return 'Please wait...';
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.desc}>{getDescription()}</Text>
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



