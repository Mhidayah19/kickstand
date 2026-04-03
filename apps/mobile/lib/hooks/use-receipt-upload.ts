import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';

const BUCKET = 'receipts';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set');

const PICKER_OPTIONS = {
  mediaTypes: ['images'] as ImagePicker.MediaType[],
  quality: 0.8,
  allowsEditing: false,
} satisfies ImagePicker.ImagePickerOptions;

export interface ReceiptUploadResult {
  publicUrl: string;
}

export interface UseReceiptUploadReturn {
  isUploading: boolean;
  pickAndUpload: () => Promise<ReceiptUploadResult | null>;
}

export function useReceiptUpload(logId: string): UseReceiptUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAsset = useCallback(async (asset: ImagePicker.ImagePickerAsset): Promise<ReceiptUploadResult | null> => {
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const filename = `${logId}-${Date.now()}.${ext}`;
    const contentType = asset.mimeType ?? 'image/jpeg';

    setIsUploading(true);
    try {
      // fetch().blob() returns 0 bytes for local file URIs on iOS.
      // FormData with a file object is the correct approach in React Native.
      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: filename, type: contentType } as any);

      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
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
        console.error('[useReceiptUpload] Upload error:', err);
        Alert.alert('Upload failed', 'Could not upload receipt. Please try again.');
        return null;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      return { publicUrl: data.publicUrl };
    } catch (err) {
      console.error('[useReceiptUpload] Unexpected error:', err);
      Alert.alert('Upload failed', 'Could not upload receipt. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [logId]);

  const captureFromCamera = useCallback(async (): Promise<ReceiptUploadResult | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);

    if (result.canceled || result.assets.length === 0) return null;
    return uploadAsset(result.assets[0]);
  }, [uploadAsset]);

  const pickFromLibrary = useCallback(async (): Promise<ReceiptUploadResult | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (result.canceled || result.assets.length === 0) return null;
    return uploadAsset(result.assets[0]);
  }, [uploadAsset]);

  const pickAndUpload = useCallback((): Promise<ReceiptUploadResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Add Receipt',
        'Choose a source',
        [
          { text: 'Camera', onPress: async () => resolve(await captureFromCamera()) },
          { text: 'Photo Library', onPress: async () => resolve(await pickFromLibrary()) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
      );
    });
  }, [captureFromCamera, pickFromLibrary]);

  return { isUploading, pickAndUpload };
}
