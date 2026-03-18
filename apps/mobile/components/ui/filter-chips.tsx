import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-sm px-xs py-xs"
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className={`px-md py-sm rounded-full border ${
            selected === option
              ? 'bg-hero border-hero'
              : 'bg-surface border-border'
          }`}
        >
          <Text
            className={`text-sm font-sans-medium ${
              selected === option ? 'text-hero-text' : 'text-text-secondary'
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
