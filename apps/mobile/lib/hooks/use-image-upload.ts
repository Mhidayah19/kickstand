import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set');

export interface ImageUploadConfig {
  bucket: string;
  prefix: string;
  dialogTitle?: string;
  dialogSubtitle?: string;
  quality?: number;
}

export interface ImageUploadResult {
  publicUrl: string;
}

export interface UseImageUploadReturn {
  isUploading: boolean;
  pickAndUpload: () => Promise<ImageUploadResult | null>;
}

export function useImageUpload(config: ImageUploadConfig): UseImageUploadReturn {
  const { bucket, prefix, dialogTitle = 'Add Photo', dialogSubtitle = 'Choose a source', quality = 0.8 } = config;
  const [isUploading, setIsUploading] = useState(false);

  const pickerOptions = useMemo<ImagePicker.ImagePickerOptions>(() => ({
    mediaTypes: ['images'] as ImagePicker.MediaType[],
    quality,
    allowsEditing: false,
  }), [quality]);

  const uploadAsset = useCallback(async (asset: ImagePicker.ImagePickerAsset): Promise<ImageUploadResult | null> => {
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const filename = `${prefix}-${Date.now()}.${ext}`;
    const contentType = asset.mimeType ?? 'image/jpeg';

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: filename, type: contentType } as any);

      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'x-upsert': 'true',
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('[useImageUpload] Upload error:', err);
        Alert.alert('Upload failed', 'Could not upload image. Please try again.');
        return null;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
      return { publicUrl: data.publicUrl };
    } catch (err) {
      console.error('[useImageUpload] Unexpected error:', err);
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [bucket, prefix]);

  const captureFromCamera = useCallback(async (): Promise<ImageUploadResult | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled || result.assets.length === 0) return null;
    return uploadAsset(result.assets[0]);
  }, [uploadAsset, pickerOptions]);

  const pickFromLibrary = useCallback(async (): Promise<ImageUploadResult | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled || result.assets.length === 0) return null;
    return uploadAsset(result.assets[0]);
  }, [uploadAsset, pickerOptions]);

  const pickAndUpload = useCallback((): Promise<ImageUploadResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        dialogTitle,
        dialogSubtitle,
        [
          { text: 'Camera', onPress: async () => resolve(await captureFromCamera()) },
          { text: 'Photo Library', onPress: async () => resolve(await pickFromLibrary()) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
      );
    });
  }, [dialogTitle, dialogSubtitle, captureFromCamera, pickFromLibrary]);

  return { isUploading, pickAndUpload };
}
