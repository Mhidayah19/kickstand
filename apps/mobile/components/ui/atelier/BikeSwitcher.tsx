import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from './Badge';
import { Eyebrow } from './Eyebrow';
import { Icon } from './Icon';

interface BikeOption {
  id: string;
  model: string;
  year: number;
}

export interface BikeSwitcherProps {
  visible: boolean;
  onClose: () => void;
  bikes: BikeOption[];
  activeBikeId: string | null;
  onSelect: (id: string) => void;
  onAddBike?: () => void;
}

export function BikeSwitcher({
  visible,
  onClose,
  bikes,
  activeBikeId,
  onSelect,
  onAddBike,
}: BikeSwitcherProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(height);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: height, duration: 220, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{ flex: 1, backgroundColor: 'rgba(26,26,26,0.35)', opacity: backdrop }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateY }],
          paddingBottom: insets.bottom + 16,
        }}
        className="absolute bottom-0 left-0 right-0 bg-bg rounded-t-[28px] px-5 pt-3"
      >
        <View className="w-10 h-1 bg-hairline-2 rounded-full self-center mb-4" />
        <Eyebrow className="mb-3">Switch bike</Eyebrow>
        <View>
          {bikes.map((b, i) => {
            const isActive = b.id === activeBikeId;
            const isLast = i === bikes.length - 1 && !onAddBike;
            return (
              <Pressable
                key={b.id}
                onPress={() => {
                  onSelect(b.id);
                  onClose();
                }}
                className={`flex-row items-center gap-[14px] py-[14px] ${
                  isLast ? '' : 'border-b border-hairline'
                }`}
              >
                <View className="w-10 h-10 items-center justify-center rounded-[10px] border border-hairline-2">
                  <Icon name="bike" size={18} stroke="#1A1A1A" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="font-sans-semibold text-[15px] text-ink tracking-[-0.01em]"
                    numberOfLines={1}
                  >
                    {b.model}
                  </Text>
                  <Text
                    className="font-mono text-[12px] text-muted mt-0.5 tracking-[0.02em]"
                    numberOfLines={1}
                  >
                    {b.year}
                  </Text>
                </View>
                {isActive ? <Badge tone="accent">ACTIVE</Badge> : null}
              </Pressable>
            );
          })}
          {onAddBike ? (
            <Pressable
              onPress={() => {
                onAddBike();
                onClose();
              }}
              className="flex-row items-center gap-[14px] py-[14px]"
            >
              <View className="w-10 h-10 items-center justify-center rounded-[10px] border border-hairline-2">
                <Icon name="plus" size={18} stroke="#1A1A1A" />
              </View>
              <Text className="font-sans-semibold text-[15px] text-ink tracking-[-0.01em]">
                Add a bike
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  );
}
