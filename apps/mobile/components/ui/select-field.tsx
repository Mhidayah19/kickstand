import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}

export function SelectField({ label, options, value, onValueChange, error }: SelectFieldProps) {
  return (
    <View className="mb-md">
      <Text className="text-xs font-sans-medium text-text-secondary mb-xs">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onValueChange(opt.value)}
            className={`px-md py-sm rounded-full border ${
              value === opt.value
                ? 'bg-hero border-hero'
                : 'bg-surface border-border'
            }`}
          >
            <Text
              className={`text-sm font-sans-medium ${
                value === opt.value ? 'text-hero-text' : 'text-text-secondary'
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error ? <Text className="text-xs text-danger font-sans mt-xs">{error}</Text> : null}
    </View>
  );
}
