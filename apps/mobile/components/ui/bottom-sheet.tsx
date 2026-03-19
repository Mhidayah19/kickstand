import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, translateY]);

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={onClose}>
      <View className="flex-1">
        <TouchableOpacity className="flex-1 bg-black/40" onPress={onClose} activeOpacity={1} />
        <Animated.View
          className="bg-surface rounded-t-2xl px-lg pt-md pb-xl"
          style={{ transform: [{ translateY }] }}
        >
          <View className="w-10 h-1 bg-surface-muted rounded-full self-center mb-md" />
          {title ? (
            <Text className="text-base font-sans-bold text-text-primary mb-md">{title}</Text>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
