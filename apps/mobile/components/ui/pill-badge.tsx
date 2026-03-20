import { View, Text } from 'react-native';

interface PillBadgeProps {
  label: string;
  variant: 'yellow' | 'danger' | 'charcoal' | 'surface';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow', text: 'text-charcoal' },
  danger: { bg: 'bg-danger', text: 'text-white' },
  charcoal: { bg: 'bg-charcoal', text: 'text-white' },
  surface: { bg: 'bg-surface-card', text: 'text-charcoal' },
};

export function PillBadge({ label, variant }: PillBadgeProps) {
  const styles = variantStyles[variant];
  return (
    <View className={`${styles.bg} self-start px-3 py-1 rounded-full`}>
      <Text className={`font-sans-xbold text-xxs uppercase tracking-widest ${styles.text}`}>
        {label}
      </Text>
    </View>
  );
}
