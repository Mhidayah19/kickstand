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
  uploadingCount: number;
  pickAndUpload: () => Promise<ImageUploadResult | null>;
  pickAndUploadMultiple: (max: number) => Promise<string[]>;
}

export function useImageUpload(config: ImageUploadConfig): UseImageUploadReturn {
  const { bucket, prefix, dialogTitle = 'Add Photo', dialogSubtitle = 'Choose a source', quality = 0.8 } = config;
  const [uploadingCount, setUploadingCount] = useState(0);

  const isUploading = uploadingCount > 0;

  const pickerOptions = useMemo<ImagePicker.ImagePickerOptions>(() => ({
    mediaTypes: ['images'] as ImagePicker.MediaType[],
    quality,
    allowsEditing: false,
  }), [quality]);

  const uploadAsset = useCallback(async (asset: ImagePicker.ImagePickerAsset): Promise<ImageUploadResult | null> => {
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const contentType = asset.mimeType ?? 'image/jpeg';

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
        return null;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
      return { publicUrl: data.publicUrl };
    } catch (err) {
      console.error('[useImageUpload] Unexpected error:', err);
      return null;
    }
  }, [bucket, prefix]);

  const captureFromCamera = useCallback(async (): Promise<ImageUploadResult | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled || result.assets.length === 0) return null;

    setUploadingCount(1);
    try {
      return await uploadAsset(result.assets[0]);
    } finally {
      setUploadingCount(0);
    }
  }, [uploadAsset, pickerOptions]);

  const pickFromLibrary = useCallback(async (max = 1): Promise<ImagePicker.ImagePickerAsset[]> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      ...pickerOptions,
      allowsMultipleSelection: max > 1,
      selectionLimit: max,
    });
    if (result.canceled) return [];
    return result.assets;
  }, [pickerOptions]);

  // Original single-upload method — kept for bike avatar use
  const pickAndUpload = useCallback((): Promise<ImageUploadResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        dialogTitle,
        dialogSubtitle,
        [
          {
            text: 'Camera',
            onPress: async () => resolve(await captureFromCamera()),
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const assets = await pickFromLibrary(1);
              if (assets.length === 0) return resolve(null);
              setUploadingCount(1);
              try {
                resolve(await uploadAsset(assets[0]));
              } finally {
                setUploadingCount(0);
              }
            },
          },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
      );
    });
  }, [dialogTitle, dialogSubtitle, captureFromCamera, pickFromLibrary, uploadAsset]);

  // Multi-upload: picks up to `max` images, uploads sequentially, returns successful URLs
  const pickAndUploadMultiple = useCallback((max: number): Promise<string[]> => {
    return new Promise((resolve) => {
      Alert.alert(
        dialogTitle,
        dialogSubtitle,
        [
          {
            text: 'Camera',
            onPress: async () => {
              const single = await captureFromCamera();
              resolve(single ? [single.publicUrl] : []);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const assets = await pickFromLibrary(max);
              if (assets.length === 0) return resolve([]);

              const urls: string[] = [];
              setUploadingCount(assets.length);
              for (const asset of assets) {
                const result = await uploadAsset(asset);
                if (result) urls.push(result.publicUrl);
                setUploadingCount((prev) => prev - 1);
              }
              resolve(urls);
            },
          },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve([]) },
        ],
      );
    });
  }, [dialogTitle, dialogSubtitle, captureFromCamera, pickFromLibrary, uploadAsset]);

  return { isUploading, uploadingCount, pickAndUpload, pickAndUploadMultiple };
}
