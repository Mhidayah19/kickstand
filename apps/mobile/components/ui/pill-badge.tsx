import { View, Text } from 'react-native';

interface PillBadgeProps {
  label: string;
  variant: 'yellow' | 'danger' | 'ink' | 'surface';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow', text: 'text-ink' },
  danger: { bg: 'bg-danger', text: 'text-white' },
  ink: { bg: 'bg-ink', text: 'text-surface' },
  surface: { bg: 'bg-surface', text: 'text-ink' },
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
