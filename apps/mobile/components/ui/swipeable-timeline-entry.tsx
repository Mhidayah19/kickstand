// apps/mobile/components/ui/swipeable-timeline-entry.tsx
import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TimelineEntry } from './timeline-entry';
import { colors } from '../../lib/colors';
import type { TimelineColor } from '../../lib/service-type-meta';

type AnimatedInterpolation = ReturnType<Animated.Value['interpolate']>;

const SWIPE_THRESHOLD = 60;
const SWIPE_ANIMATION_RANGE = 80;

interface SwipeableTimelineEntryProps {
  title: string;
  cost: string;
  color: TimelineColor;
  tags?: { label: string; danger?: boolean }[];
  quote?: string;
  imageUri?: string;
  parts?: string[];
  mileage?: string;
  onPress?: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function renderLeftActions(
  _progress: AnimatedInterpolation,
  dragX: AnimatedInterpolation,
  onEdit: () => void,
) {
  const scale = dragX.interpolate({
    inputRange: [0, SWIPE_ANIMATION_RANGE],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });
  return (
    <Pressable
      onPress={onEdit}
      style={{ width: 72, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginBottom: 48, backgroundColor: colors.yellow, borderRadius: 16 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.ink} />
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: colors.ink, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>
          Edit
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function renderRightActions(
  _progress: AnimatedInterpolation,
  dragX: AnimatedInterpolation,
  onDelete: () => void,
) {
  const scale = dragX.interpolate({
    inputRange: [-SWIPE_ANIMATION_RANGE, 0],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  return (
    <Pressable
      onPress={onDelete}
      style={{ width: 72, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 48, backgroundColor: colors.danger, borderRadius: 16 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.white} />
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: colors.white, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>
          Delete
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function SwipeableTimelineEntry({
  onDelete,
  onEdit,
  ...entryProps
}: SwipeableTimelineEntryProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeableRef.current?.close();
    onDelete();
  }, [onDelete]);

  const handleEdit = useCallback(() => {
    Haptics.selectionAsync();
    swipeableRef.current?.close();
    onEdit();
  }, [onEdit]);

  const handleSwipeOpen = useCallback((_direction: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={(progress, dragX) =>
        renderLeftActions(progress, dragX, handleEdit)
      }
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, handleDelete)
      }
      onSwipeableOpen={handleSwipeOpen}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      overshootLeft={false}
      overshootRight={false}
    >
      <TimelineEntry {...entryProps} />
    </Swipeable>
  );
}
