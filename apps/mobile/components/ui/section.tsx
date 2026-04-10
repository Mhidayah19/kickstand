import { View, Text, Pressable } from 'react-native';

interface SectionProps {
  /** Small atelier micro-label that sits above the main label, e.g. "NEXT UP". */
  eyebrow?: string;
  label?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Section({ eyebrow, label, action, onAction, children, className = '' }: SectionProps) {
  const hasHeader = eyebrow || label || action;

  return (
    <View className={`mb-10 ${className}`}>
      {hasHeader && (
        <View className="flex-row items-end justify-between mb-4 px-1">
          <View>
            {eyebrow && (
              <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-0.5">
                {eyebrow}
              </Text>
            )}
            {label && (
              <Text className="text-[20px] font-sans-xbold text-charcoal tracking-tight">
                {label}
              </Text>
            )}
          </View>
          {action && (
            <Pressable onPress={onAction} className="active:opacity-60">
              <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55">
                {action}
              </Text>
            </Pressable>
          )}
        </View>
      )}
      {children}
    </View>
  );
}
