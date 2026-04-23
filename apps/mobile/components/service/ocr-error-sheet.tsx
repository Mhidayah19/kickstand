import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  message: string;
  onRetry: () => void;
  onManual: () => void;
}

export function OcrErrorSheet({ visible, message, onRetry, onManual }: Props) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View className="flex-1 justify-end bg-ink/40">
        <View className="rounded-t-3xl bg-surface px-6 pb-10 pt-4">
          <View className="mx-auto h-1 w-12 rounded-full bg-muted/40" />
          <Text className="mt-4 font-jakarta-medium text-lg text-ink">
            We couldn&apos;t read this receipt
          </Text>
          <Text className="mt-2 font-jakarta-medium text-sm text-muted">
            Try better lighting or a flat surface. Or type it in manually.
          </Text>
          {message ? (
            <Text className="mt-1 font-jakarta-medium text-xs text-muted opacity-70">
              {message}
            </Text>
          ) : null}
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="mt-6 items-center rounded-2xl bg-ink py-4"
          >
            <Text className="font-jakarta-medium text-base text-white">Retry scan</Text>
          </Pressable>
          <Pressable
            onPress={onManual}
            accessibilityRole="button"
            className="mt-3 items-center rounded-2xl py-4"
          >
            <Text className="font-jakarta-medium text-base text-ink">Enter manually</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
