import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';

interface BentoStatProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function BentoStat({ label, value, accent = false }: BentoStatProps) {
  return (
    <View
      className="bg-surface p-5 rounded-xl flex-1"
      style={accent ? { borderBottomWidth: 2, borderBottomColor: colors.yellow } : undefined}
    >
      <Text className="font-sans-bold text-xxs text-muted uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className="font-sans-bold text-lg text-ink">{value}</Text>
    </View>
  );
}
