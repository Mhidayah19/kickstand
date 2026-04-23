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

  const titleElement = (
    <Text className={`${titleSize} font-sans-xbold text-ink tracking-tight`}>{title}</Text>
  );

  return (
    <View className="mb-8">
      {label && (
        <Text className="font-sans-bold text-xxs text-ink uppercase tracking-wide-2 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          {onTitlePress ? (
            <Pressable onPress={onTitlePress}>
              {titleElement}
            </Pressable>
          ) : (
            titleElement
          )}
        </View>
        {rightAction}
      </View>
      {subtitle && (
        <Text className="font-sans-bold text-xxs text-muted uppercase tracking-wide-1 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
