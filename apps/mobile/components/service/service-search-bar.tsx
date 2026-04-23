import React, { useRef, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ServiceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function ServiceSearchBar({ value, onChange }: ServiceSearchBarProps) {
  const underlineOpacity = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    Animated.timing(underlineOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [underlineOpacity]);

  const handleBlur = useCallback(() => {
    Animated.timing(underlineOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
  }, [underlineOpacity]);

  const handleChange = useCallback(
    (text: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onChange(text), 150);
    },
    [onChange],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleClear = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    inputRef.current?.clear();
    onChange('');
  }, [onChange]);

  return (
    <View className="bg-bg-2 rounded-xl px-4 py-3 flex-row items-center gap-3 overflow-hidden mb-3">
      <MaterialCommunityIcons name="magnify" size={18} color={colors.ink} />
      <TextInput
        ref={inputRef}
        className="flex-1 font-sans-medium text-sm text-ink"
        placeholder="Search logs..."
        placeholderTextColor={colors.ink + '99'}
        defaultValue={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={8}>
          <MaterialCommunityIcons name="close-circle" size={16} color={colors.muted} />
        </TouchableOpacity>
      )}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: colors.yellow,
          opacity: underlineOpacity,
        }}
      />
    </View>
  );
}
