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
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
        <Text style={styles.title}>Processing</Text>
        <Text style={styles.desc}>Please wait while we process your request</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});



