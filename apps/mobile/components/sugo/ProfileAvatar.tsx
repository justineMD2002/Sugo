import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '@/lib/userService';

interface ProfileAvatarProps {
  userProfile?: UserProfile | null;
  size?: number;
  showBorder?: boolean;
}

export default function ProfileAvatar({
  userProfile,
  size = 60,
  showBorder = true
}: ProfileAvatarProps) {
  const avatarSize = size;
  const borderWidth = showBorder ? 3 : 0;

  return (
    <View style={[
      styles.container,
      {
        width: avatarSize,
        height: avatarSize,
        borderWidth: borderWidth,
      }
    ]}>
      {userProfile?.avatar_url ? (
        <Image
          source={{ uri: userProfile.avatar_url }}
          style={[
            styles.avatar,
            {
              width: avatarSize - borderWidth * 2,
              height: avatarSize - borderWidth * 2,
            }
          ]}
        />
      ) : (
        <View style={[
          styles.placeholder,
          {
            width: avatarSize - borderWidth * 2,
            height: avatarSize - borderWidth * 2,
          }
        ]}>
          <Ionicons
            name="person"
            size={avatarSize * 0.4}
            color="#dc2626"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: '#fff',
    borderRadius: 9999, // Very large value for perfect circle
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 9999,
  },
  placeholder: {
    backgroundColor: '#fef2f2',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});