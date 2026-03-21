import { ScrollView, View, Pressable, Text } from 'react-native';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  wrap?: boolean;
}

export function FilterChips({ options, selected, onSelect, wrap = false }: FilterChipsProps) {
  const chips = options.map((option) => {
    const isSelected = option === selected;
    return (
      <Pressable
        key={option}
        onPress={() => onSelect(option)}
        className={`px-6 py-2.5 rounded-full ${
          isSelected ? 'bg-charcoal' : 'bg-surface-low'
        }`}
      >
        <Text
          className={`font-sans-bold text-sm ${
            isSelected ? 'text-white' : 'text-sand'
          }`}
        >
          {option}
        </Text>
      </Pressable>
    );
  });

  if (wrap) {
    return <View className="flex-row flex-wrap gap-3">{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingVertical: 4 }}
    >
      {chips}
    </ScrollView>
  );
}
