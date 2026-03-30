import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
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
      className={`w-full py-5 rounded-full flex-row items-center justify-center gap-3 ${isAccent ? 'bg-yellow' : 'bg-charcoal'}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      {icon && !isAccent && (
        <View className="w-10 h-10 rounded-full bg-yellow items-center justify-center">
          <MaterialCommunityIcons name={icon as any} size={20} color={colors.charcoal} />
        </View>
      )}
      <Text className={`font-sans-bold text-sm uppercase tracking-wide-1 ${isAccent ? 'text-charcoal' : 'text-white'}`}>
        {label}
      </Text>
      {icon && isAccent && (
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.charcoal} />
      )}
    </Pressable>
  );
}
