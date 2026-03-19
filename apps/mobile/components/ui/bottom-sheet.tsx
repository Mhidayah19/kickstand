import React, { useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const translateY = useSharedValue(300);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      translateY.value = withTiming(300, { duration: 220 });
    }
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[animatedStyle]}
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl px-lg pt-md pb-xl"
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-surface-muted rounded-full self-center mb-lg" />
        {title ? (
          <Text className="text-base font-sans-bold text-text-primary mb-md">{title}</Text>
        ) : null}
        {children}
      </Animated.View>
    </Modal>
  );
}
