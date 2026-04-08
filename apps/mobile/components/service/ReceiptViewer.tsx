import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ReceiptViewerProps {
  urls: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

// Per-image zoomable wrapper — isolates shared values so each image resets independently
function ZoomableImage({
  uri,
  width,
  height,
  onZoomChange,
}: {
  uri: string;
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const notifyZoom = useCallback(
    (zoomed: boolean) => onZoomChange(zoomed),
    [onZoomChange],
  );

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      const next = Math.max(1, Math.min(5, savedScale.value * e.scale));
      scale.value = next;
      if (next > 1.05) {
        runOnJS(notifyZoom)(true);
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyZoom)(false);
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      if (scale.value <= 1) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      runOnJS(notifyZoom)(false);
    });

  const composed = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        <Image
          source={{ uri }}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function ReceiptViewer({ urls, initialIndex, visible, onClose }: ReceiptViewerProps) {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleZoomChange = useCallback((zoomed: boolean) => {
    setIsZoomed(zoomed);
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
        {/* Counter */}
        <View
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 11,
              letterSpacing: 1,
            }}
          >
            {activeIndex + 1} / {urls.length}
          </Text>
        </View>

        {/* Close button */}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={{
            position: 'absolute',
            top: 52,
            right: 20,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="close" size={16} color="#fff" />
        </Pressable>

        {/* Image pager */}
        <FlatList
          ref={listRef}
          data={urls}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          scrollEnabled={!isZoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <ZoomableImage
              uri={item}
              width={width}
              height={height}
              onZoomChange={handleZoomChange}
            />
          )}
        />

        {/* Dot indicator */}
        {urls.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 48,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {urls.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  width: i === activeIndex ? 16 : 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? colors.yellow : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </View>
        )}

        {/* Hint */}
        <Text
          style={{
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 10,
            letterSpacing: 0.5,
          }}
        >
          Pinch to zoom  ·  Double-tap to reset
        </Text>
      </View>
    </Modal>
  );
}
