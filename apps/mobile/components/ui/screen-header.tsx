import { View, Text, Pressable } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  label?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onTitlePress?: () => void;
  size?: 'lg' | 'md';
}

export function ScreenHeader({ title, label, subtitle, rightAction, onTitlePress, size = 'lg' }: ScreenHeaderProps) {
  const titleSize = size === 'lg' ? 'text-4xl' : 'text-3xl';

  return (
    <View className="mb-8">
      {label && (
        <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-wide-2 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onTitlePress} disabled={!onTitlePress}>
          <Text className={`${titleSize} font-sans-xbold text-charcoal tracking-tight`}>{title}</Text>
        </Pressable>
        {rightAction}
      </View>
      {subtitle && (
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
