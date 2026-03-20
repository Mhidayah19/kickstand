import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type ConfirmVariant = 'danger' | 'accent';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: ConfirmVariant;
}

export function ConfirmationDialog({
  visible,
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}: ConfirmationDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        className="flex-1 bg-black/50 items-center justify-center px-lg"
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1} className="w-full bg-surface rounded-2xl p-xl">
          <Text className="text-lg font-sans-bold text-text-primary mb-sm">{title}</Text>
          <Text className="text-sm font-sans text-text-muted mb-xl">{body}</Text>
          <View className="flex-row gap-sm">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-md rounded-full bg-surface-muted items-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-semibold text-text-secondary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-md rounded-full items-center ${
                confirmVariant === 'danger' ? 'bg-danger' : 'bg-accent'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-sm font-sans-semibold text-white">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
