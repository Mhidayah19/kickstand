import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Eyebrow } from './atelier';

type ConfirmVariant = 'danger' | 'accent';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: ConfirmVariant;
  eyebrow?: string;
}

export function ConfirmationDialog({
  visible,
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  eyebrow,
}: ConfirmationDialogProps) {
  const confirmBg = confirmVariant === 'danger' ? 'bg-danger' : 'bg-ink';
  const confirmText = confirmVariant === 'danger' ? 'text-white' : 'text-bg';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center px-xl"
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full bg-bg rounded-[28px] px-xl pt-xl pb-lg"
        >
          {eyebrow ? (
            <View className="mb-md">
              <Eyebrow>{eyebrow}</Eyebrow>
            </View>
          ) : null}
          <Text className="font-sans-semibold text-[20px] leading-[24px] tracking-[-0.01em] text-ink mb-sm">
            {title}
          </Text>
          <Text className="font-sans text-[14px] leading-[20px] text-ink-2 mb-xl">
            {body}
          </Text>
          <View className="flex-row gap-sm">
            <Pressable
              onPress={onCancel}
              className="flex-1 h-12 rounded-full bg-bg-2 items-center justify-center"
            >
              <Text className="font-sans-semibold text-[14px] tracking-[-0.01em] text-ink">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 h-12 rounded-full items-center justify-center ${confirmBg}`}
            >
              <Text className={`font-sans-semibold text-[14px] tracking-[-0.01em] ${confirmText}`}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
