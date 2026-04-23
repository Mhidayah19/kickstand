import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  scrollable = false,
  maxHeight,
}: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.setValue(height);
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else if (modalVisible) {
      Animated.timing(translateY, { toValue: height, duration: 220, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) setModalVisible(false);
        },
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Close"
        accessibilityRole="button"
      />
      <Animated.View
        style={[
          { transform: [{ translateY }] },
          maxHeight ? { maxHeight } : undefined,
        ]}
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl px-6 pt-3 pb-6"
      >
        {/* Drag handle */}
        <View className="w-10 h-1 bg-bg-2 rounded-full self-center mb-4" />
        {title ? (
          <Text className="text-base font-sans-bold text-ink mb-3">{title}</Text>
        ) : null}
        {scrollable ? (
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </Animated.View>
    </Modal>
  );
}
