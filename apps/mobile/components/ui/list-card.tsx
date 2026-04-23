import { View, Text, Pressable } from 'react-native';
import { colors } from '../../lib/colors';
import { Icon } from './atelier';
import type { IconName } from './atelier';

interface ListCardProps {
  icon?: IconName | string;
  title?: string;
  subtitle?: string;
  trailing?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function ListCard({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  children,
}: ListCardProps) {
  const inner = (
    <View className="flex-row items-center gap-4 py-3">
      {icon && (
        <View className="w-8 h-8 items-center justify-center">
          <Icon name={icon as IconName} size={20} stroke={colors.ink} />
        </View>
      )}
      <View className="flex-1">
        {title && <Text className="font-sans-semibold text-[14px] text-ink tracking-[-0.01em]">{title}</Text>}
        {subtitle && (
          <Text className="font-mono text-[11px] text-muted mt-0.5 tracking-[0.02em]">{subtitle}</Text>
        )}
        {children}
      </View>
      {trailing ? (
        <Text
          className="font-sans-semibold text-[14px] text-ink"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {trailing}
        </Text>
      ) : onPress ? (
        <Icon name="chevron" size={14} stroke={colors.muted} />
      ) : null}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} className="active:opacity-60">
      {inner}
    </Pressable>
  );
}
