import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ReceiptViewerProps {
  urls: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

export function ReceiptViewer({ urls, initialIndex, visible, onClose }: ReceiptViewerProps) {
  const { width, height } = Dimensions.get('window');
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to the correct page once the modal layout is ready
  function handleShow() {
    setActiveIndex(initialIndex);
    setTimeout(() => scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false }), 0);
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page !== activeIndex) setActiveIndex(page);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      onShow={handleShow}
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

        {/* Paged image scroller */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {urls.map((uri, i) => (
            <Pressable
              key={`${uri}-${i}`}
              onPress={onClose}
              style={{
                width,
                height,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={{ uri }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </ScrollView>

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
          Swipe to navigate  ·  Tap to close
        </Text>
      </View>
    </Modal>
  );
}
