import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ICONS,
} from '../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../lib/constants/service-types';
import { filterServiceTypes } from '../../lib/service-type-helpers';
import type { FrequentType } from '../../lib/service-type-helpers';

interface ServiceTypeSelectorProps {
  selected: ServiceTypeKey;
  onSelect: (key: ServiceTypeKey) => void;
  collapsed: boolean;
  onExpand: () => void;
  frequentTypes: FrequentType[];
}

export function ServiceTypeSelector({
  selected,
  onSelect,
  collapsed,
  onExpand,
  frequentTypes,
}: ServiceTypeSelectorProps) {
  const gridHeight = useRef(new Animated.Value(1)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (collapsed) {
      setSearch('');
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

  const [measuredHeight, setMeasuredHeight] = useState(0);

  const handleLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setMeasuredHeight((prev) => (prev === 0 ? h : prev));
  }, []);

  const animatedMaxHeight = measuredHeight > 0
    ? gridHeight.interpolate({ inputRange: [0, 1], outputRange: [0, measuredHeight] })
    : undefined;

  const filteredGroups = useMemo(() => filterServiceTypes(search), [search]);

  return (
    <View>
      <Text className="text-xs font-sans-bold text-muted uppercase tracking-widest mb-3">
        Service Type
      </Text>

      <Animated.View style={{ opacity: pillOpacity }}>
        {collapsed && (
          <Pressable
            onPress={onExpand}
            className="bg-bg-2 rounded-xl px-5 py-4 flex-row items-center justify-between mb-4 active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="wrench" size={20} color={colors.ink} />
              <Text className="font-sans-bold text-ink text-sm">
                {SERVICE_TYPE_LABELS[selected]}
              </Text>
            </View>
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.muted} />
          </Pressable>
        )}
      </Animated.View>

      {!collapsed && frequentTypes.length > 0 && (
        <View className="mb-5">
          <Text className="text-xxs font-sans-bold text-muted uppercase tracking-widest mb-2.5">
            Recent
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {frequentTypes.map(({ key, count }) => {
              const isSelected = key === selected;
              return (
                <Pressable
                  key={key}
                  onPress={() => onSelect(key)}
                  className={`flex-row items-center gap-2.5 px-4 py-3 rounded-2xl ${
                    isSelected ? 'bg-ink' : 'bg-surface'
                  }`}
                >
                  <View className={`w-8 h-8 rounded-xl items-center justify-center ${
                    isSelected ? 'bg-yellow/15' : 'bg-bg-2'
                  }`}>
                    <MaterialCommunityIcons
                      name={SERVICE_TYPE_ICONS[key]}
                      size={16}
                      color={isSelected ? colors.yellow : colors.ink}
                    />
                  </View>
                  <View>
                    <Text className={`font-sans-bold text-sm ${isSelected ? 'text-white' : 'text-ink'}`}>
                      {SERVICE_TYPE_LABELS[key]}
                    </Text>
                    <Text className={`font-sans-medium text-xxs ${isSelected ? 'text-yellow' : 'text-muted'}`}>
                      Logged {count}×
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {!collapsed && (
        <View className="mb-5">
          <View className="relative">
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search service type…"
              placeholderTextColor={colors.hairline2}
              className="bg-bg-2 rounded-xl pl-11 pr-4 py-3.5 font-sans-medium text-sm text-ink"
              style={search ? { borderBottomWidth: 2, borderBottomColor: colors.yellow } : undefined}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      <Animated.View
        onLayout={handleLayout}
        style={[
          { overflow: 'hidden' },
          animatedMaxHeight != null ? { maxHeight: animatedMaxHeight } : undefined,
        ]}
      >
        <View className="gap-5 mb-10">
          {filteredGroups.length === 0 && search.trim() ? (
            <Text className="font-sans-medium text-sm text-muted text-center py-6">
              No matching service types
            </Text>
          ) : (
            filteredGroups.map((group) => (
              <View key={group.label}>
                <Text className="text-xxs font-sans-bold text-muted uppercase tracking-widest mb-2.5">
                  {group.label}
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {group.keys.map((key) => {
                    const isSelected = key === selected;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => onSelect(key)}
                        className={`flex-row items-center gap-1.5 px-5 py-3 rounded-2xl border-2 ${
                          isSelected
                            ? 'bg-ink border-ink'
                            : 'bg-bg-2 border-transparent'
                        }`}
                        style={{ minWidth: 90 }}
                      >
                        <MaterialCommunityIcons
                          name={SERVICE_TYPE_ICONS[key]}
                          size={14}
                          color={isSelected ? colors.white : colors.ink}
                          style={{ opacity: isSelected ? 1 : 0.5 }}
                        />
                        <Text
                          className={`font-sans-bold text-sm ${
                            isSelected ? 'text-white' : 'text-ink'
                          }`}
                        >
                          {SERVICE_TYPE_LABELS[key]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>
      </Animated.View>
    </View>
  );
}
