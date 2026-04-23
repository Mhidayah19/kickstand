import React, { useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const RECEIPTS_BUCKET = 'receipts';

async function uploadResizedReceipt(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  const filename = `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { data: { session } } = await supabase.auth.getSession();
  const formData = new FormData();
  formData.append('file', { uri: manipulated.uri, name: filename, type: 'image/jpeg' } as any);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${RECEIPTS_BUCKET}/${filename}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'x-upsert': 'true',
      },
      body: formData,
    },
  );
  if (!response.ok) throw new Error('Upload failed');
  const { data } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export default function ScanReceiptScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  if (!permission) return <View className="flex-1 bg-black" />;
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="text-center font-jakarta-medium text-base text-white">
          Camera access is needed to scan receipts.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="mt-6 rounded-2xl bg-yellow px-6 py-3"
        >
          <Text className="font-jakarta-medium text-base text-ink">Allow access</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (busy || !cameraRef.current) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!photo) throw new Error('No photo');
      const receiptUrl = await uploadResizedReceipt(photo.uri);
      router.replace({ pathname: '/ocr-analyzing', params: { receiptUrl } });
    } catch (err) {
      Alert.alert('Could not capture', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleGallery = async () => {
    if (busy) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || result.assets.length === 0) return;
    setBusy(true);
    try {
      const receiptUrl = await uploadResizedReceipt(result.assets[0].uri);
      router.replace({ pathname: '/ocr-analyzing', params: { receiptUrl } });
    } catch (err) {
      Alert.alert('Could not upload', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View className="absolute left-0 right-0 top-12 flex-row items-center justify-between px-4">
        <Pressable onPress={() => router.back()} accessibilityLabel="Close camera">
          <Feather name="x" size={28} color="#fff" />
        </Pressable>
      </View>
      <View
        className="absolute left-8 right-8 top-32 bottom-40 rounded-2xl border-2 border-dashed border-hairline-2"
        pointerEvents="none"
      >
        <Text className="absolute -bottom-8 self-center font-jakarta-medium text-sm text-muted">
          Align receipt in frame
        </Text>
      </View>
      <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-around px-8">
        <Pressable onPress={handleGallery} accessibilityLabel="Choose from gallery">
          <Feather name="image" size={28} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleCapture}
          accessibilityLabel="Capture receipt"
          disabled={busy}
          className="h-20 w-20 items-center justify-center rounded-full bg-white"
        >
          <View className="h-16 w-16 rounded-full border-4 border-ink" />
        </Pressable>
        <View className="w-7" />
      </View>
    </View>
  );
}
