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
      className="bg-surface-card p-5 rounded-xl flex-1"
      style={accent ? { borderBottomWidth: 2, borderBottomColor: colors.yellow } : undefined}
    >
      <Text className="font-sans-bold text-xxs text-outline uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className="font-sans-bold text-lg text-charcoal">{value}</Text>
    </View>
  );
}
