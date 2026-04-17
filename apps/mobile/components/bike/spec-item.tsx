import { Text, View } from 'react-native';

export const CLASS_LABELS: Record<string, string> = {
  '2B': 'Class 2B',
  '2A': 'Class 2A',
  '2': 'Class 2',
};

export function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xxs font-sans-bold text-sand uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className="text-base font-sans-xbold text-charcoal">{value}</Text>
    </View>
  );
}
