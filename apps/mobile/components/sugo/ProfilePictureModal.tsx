import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';

type ProfilePictureModalProps = {
  visible: boolean;
  onClose: () => void;
  imageUrl?: string;
  onReplace: () => void;
  isLoading?: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfilePictureModal({
  visible,
  onClose,
  imageUrl,
  onReplace,
  isLoading = false
}: ProfilePictureModalProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Picture</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="person" size={80} color="#d1d5db" />
              <Text style={styles.placeholderText}>No Profile Picture</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.replaceBtn, isLoading && styles.disabledBtn]}
            onPress={onReplace}
            disabled={isLoading}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.replaceBtnText}>
              {isLoading ? 'Processing...' : 'Replace Picture'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  closeBtn: {
    padding: 4,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    minHeight: 300,
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#e5e7eb',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  replaceBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  replaceBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});