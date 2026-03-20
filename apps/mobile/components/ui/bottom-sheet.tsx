import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: 300, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={{ transform: [{ translateY }] }}
        className="absolute bottom-0 left-0 right-0 bg-surface-card rounded-t-2xl px-6 pt-3 pb-6"
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-surface-low rounded-full self-center mb-4" />
        {title ? (
          <Text className="text-base font-sans-bold text-charcoal mb-3">{title}</Text>
        ) : null}
        {children}
      </Animated.View>
    </Modal>
  );
}
