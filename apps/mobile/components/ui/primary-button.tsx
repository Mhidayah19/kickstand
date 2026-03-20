import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  iconColor?: string;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  iconColor = '#F2D06B',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full bg-charcoal py-5 rounded-2xl flex-row items-center justify-center gap-3"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      {icon && (
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconColor }}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#1E1E1E" />
        </View>
      )}
      <Text className="font-sans-bold text-sm text-white uppercase tracking-wide-1">
        {label}
      </Text>
    </Pressable>
  );
}
