import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { updateUserAvatar } from './userService';

export interface ProfilePictureUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

/**
 * Requests camera roll permissions
 */
async function requestCameraRollPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera roll permission:', error);
    return false;
  }
}

/**
 * Opens image picker for profile picture selection
 * @returns Promise with selected image URI or null if cancelled
 */
export async function selectProfilePicture(): Promise<string | null> {
  try {
    // Request permissions first
    const hasPermission = await requestCameraRollPermission();
    if (!hasPermission) {
      throw new Error('Camera roll permission is required to select a profile picture');
    }

    // Configure image picker
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.7, // Good quality but not too large
      allowsMultipleSelection: false,
    };

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null; // User cancelled
    }

    const selectedAsset = result.assets[0];
    return selectedAsset.uri;

  } catch (error) {
    console.error('Error selecting profile picture:', error);
    throw error;
  }
}

/**
 * Uploads an image to Supabase storage and returns the public URL
 * @param imageUri The local URI of the image to upload
 * @param userId The user ID for creating a unique file name
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadProfilePictureToStorage(
  imageUri: string,
  userId: string
): Promise<string> {
  try {
    // Generate a unique file name
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName; // Bucket is already 'avatars', so just use the file path

    // Convert URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

/**
 * Deletes old profile picture from storage
 * @param avatarUrl The URL of the avatar to delete
 */
export async function deleteOldProfilePicture(avatarUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filePath = `${userId}/${fileName}`; // Bucket is already 'avatars'

    // Delete from storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.warn('Failed to delete old profile picture:', error);
      // Don't throw error here as this is not critical
    }

  } catch (error) {
    console.warn('Error deleting old profile picture:', error);
    // Don't throw error here as this is not critical
  }
}

/**
 * Complete profile picture upload flow:
 * 1. Select image from gallery
 * 2. Upload to Supabase storage
 * 3. Update user profile with new avatar URL
 * 4. Optionally delete old avatar
 *
 * @param userId The user ID
 * @param currentAvatarUrl The current avatar URL (for cleanup)
 * @returns Promise with upload result
 */
export async function uploadProfilePicture(
  userId: string,
  currentAvatarUrl?: string
): Promise<ProfilePictureUploadResult> {
  try {
    // Step 1: Select image
    const imageUri = await selectProfilePicture();
    if (!imageUri) {
      return { success: false, error: 'No image selected' };
    }

    // Step 2: Upload to storage
    const newAvatarUrl = await uploadProfilePictureToStorage(imageUri, userId);

    // Step 3: Update user profile
    const updateResult = await updateUserAvatar(userId, newAvatarUrl);
    if (!updateResult.success || !updateResult.data) {
      throw new Error(updateResult.error || 'Failed to update profile');
    }

    // Step 4: Delete old avatar (if exists and different from new one)
    if (currentAvatarUrl && currentAvatarUrl !== newAvatarUrl) {
      await deleteOldProfilePicture(currentAvatarUrl);
    }

    return {
      success: true,
      avatarUrl: newAvatarUrl,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
    console.error('Profile picture upload error:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}