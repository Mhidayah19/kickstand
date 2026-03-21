import { View, Text, Pressable } from 'react-native';

interface SectionProps {
  label?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function Section({ label, action, onAction, children }: SectionProps) {
  return (
    <View className="mb-6">
      {(label || action) && (
        <View className="flex-row items-center justify-between mb-4">
          {label && (
            <Text className="font-sans-bold text-xl text-charcoal tracking-tight">{label}</Text>
          )}
          {action && (
            <Pressable onPress={onAction}>
              <Text className="font-sans-bold text-sm text-charcoal">{action}</Text>
            </Pressable>
          )}
        </View>
      )}
      {children}
    </View>
  );
}
