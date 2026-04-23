import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from './atelier';
import { colors } from '../../lib/colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName | string;
  disabled?: boolean;
  variant?: 'primary' | 'accent';
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isAccent = variant === 'accent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`w-full py-5 rounded-full flex-row items-center justify-center gap-3 ${isAccent ? 'bg-accent' : 'bg-ink'}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      {icon && !isAccent && (
        <View className="w-10 h-10 rounded-full bg-accent items-center justify-center">
          <Icon name={icon as IconName} size={18} stroke={colors.ink} />
        </View>
      )}
      <Text className={`font-sans-bold text-sm uppercase tracking-wide-1 ${isAccent ? 'text-ink' : 'text-surface'}`}>
        {label}
      </Text>
      {icon && isAccent && (
        <Icon name={icon as IconName} size={16} stroke={colors.ink} />
      )}
    </Pressable>
  );
}
