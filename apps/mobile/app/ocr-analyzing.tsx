import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOcr } from '../lib/api/use-ocr';
import { useOcrStore } from '../lib/ocr/ocr-store';
import { OcrErrorSheet } from '../components/service/ocr-error-sheet';

export default function OcrAnalyzingScreen() {
  const router = useRouter();
  const { receiptUrl } = useLocalSearchParams<{ receiptUrl: string }>();
  const ocr = useOcr();
  const setPending = useOcrStore((s) => s.setPending);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptUrl) return;
    let cancelled = false;
    console.log('[OCR] mutating with receiptUrl:', receiptUrl);
    console.log('[OCR] API base URL:', process.env.EXPO_PUBLIC_API_URL || 'using hostUri fallback');
    ocr.mutate(receiptUrl, {
      onSuccess: (payload) => {
        if (cancelled) return;
        console.log('[OCR] success:', payload);
        setPending(payload);
        router.back();
      },
      onError: (err) => {
        if (cancelled) return;
        console.error('[OCR] error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      },
    });
    return () => { cancelled = true; };
  }, [receiptUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <Pressable
        onPress={() => router.back()}
        accessibilityLabel="Cancel OCR"
        className="absolute top-12 left-4"
      >
        <Feather name="x" size={24} color="#1E1E1E" />
      </Pressable>

      {receiptUrl ? (
        <Image
          source={{ uri: receiptUrl }}
          className="h-48 w-40 rounded-2xl"
          resizeMode="cover"
        />
      ) : null}
      <Text className="mt-8 font-jakarta-medium text-lg text-ink">Reading receipt…</Text>
      <Text className="mt-1 font-jakarta-medium text-sm text-muted">This takes ~3 sec</Text>

      <OcrErrorSheet
        visible={error !== null}
        message={error ?? ''}
        onRetry={() => router.replace('/scan-receipt')}
        onManual={() => router.back()}
      />
    </View>
  );
}
