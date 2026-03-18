import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'accent';
}

export function ConfirmationDialog({
  visible,
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'accent',
}: ConfirmationDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 items-center justify-center px-lg">
        <View className="bg-surface rounded-2xl p-xl w-full">
          <Text className="text-base font-sans-bold text-text-primary mb-sm">{title}</Text>
          <Text className="text-sm font-sans text-text-secondary mb-xl">{body}</Text>
          <View className="flex-row gap-sm">
            <TouchableOpacity
              className="flex-1 bg-surface-muted rounded-full py-md items-center"
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-semibold text-text-secondary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ${confirmVariant === 'danger' ? 'bg-danger' : 'bg-accent'} rounded-full py-md items-center`}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-semibold text-white">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
