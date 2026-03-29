import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import {
  SERVICE_TYPE_GROUPS,
  SERVICE_TYPE_LABELS,
} from '../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../lib/constants/service-types';

interface ServiceTypeSelectorProps {
  selected: ServiceTypeKey;
  onSelect: (key: ServiceTypeKey) => void;
  collapsed: boolean;
  onExpand: () => void;
}

export function ServiceTypeSelector({
  selected,
  onSelect,
  collapsed,
  onExpand,
}: ServiceTypeSelectorProps) {
  const gridHeight = useRef(new Animated.Value(1)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (collapsed) {
      Animated.parallel([
        Animated.timing(gridHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(pillOpacity, { toValue: 1, duration: 250, delay: 100, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(pillOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(gridHeight, { toValue: 1, duration: 300, delay: 80, useNativeDriver: false }),
      ]).start();
    }
  }, [collapsed]);

  const measuredHeightRef = useRef(0);
  const [measuredHeight, setMeasuredHeight] = React.useState(0);

  const handleLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && measuredHeightRef.current === 0) {
      measuredHeightRef.current = h;
      setMeasuredHeight(h);
    }
  }, []);

  const animatedMaxHeight = measuredHeight > 0
    ? gridHeight.interpolate({ inputRange: [0, 1], outputRange: [0, measuredHeight] })
    : undefined;

  return (
    <View>
      <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-3">
        Service Type
      </Text>

      <Animated.View style={{ opacity: pillOpacity }} pointerEvents={collapsed ? 'auto' : 'none'}>
        {collapsed && (
          <Pressable
            onPress={onExpand}
            className="bg-surface-low rounded-xl px-5 py-4 flex-row items-center justify-between mb-4 active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="wrench" size={20} color={colors.charcoal} />
              <Text className="font-sans-bold text-charcoal text-sm">
                {SERVICE_TYPE_LABELS[selected]}
              </Text>
            </View>
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.sand} />
          </Pressable>
        )}
      </Animated.View>

      <Animated.View
        onLayout={handleLayout}
        style={[
          { overflow: 'hidden' },
          animatedMaxHeight != null ? { maxHeight: animatedMaxHeight } : undefined,
        ]}
      >
        <View className="gap-5 mb-10">
          {SERVICE_TYPE_GROUPS.map((group) => (
            <View key={group.label}>
              <Text className="text-xxs font-sans-bold text-sand uppercase tracking-widest mb-2.5">
                {group.label}
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {group.keys.map((key) => {
                  const isSelected = key === selected;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSelect(key)}
                      className={`px-5 py-3 rounded-2xl border-2 ${
                        isSelected
                          ? 'bg-charcoal border-charcoal'
                          : 'bg-surface-low border-transparent'
                      }`}
                      style={{ minWidth: 90 }}
                    >
                      <Text
                        className={`font-sans-bold text-sm ${
                          isSelected ? 'text-white' : 'text-charcoal'
                        }`}
                      >
                        {SERVICE_TYPE_LABELS[key]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
