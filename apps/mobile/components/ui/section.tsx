import { View, Text, Pressable } from 'react-native';

interface SectionProps {
  /** Small atelier micro-label that sits above the main label, e.g. "NEXT UP". */
  eyebrow?: string;
  label?: string;
  action?: string;
  onAction?: () => void;
  /** Custom trailing element rendered opposite the eyebrow/label. Takes precedence over action. */
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ eyebrow, label, action, onAction, trailing, children, className = '' }: SectionProps) {
  const hasHeader = eyebrow || label || action || trailing;

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
          {trailing ?? (action && (
            <Pressable onPress={onAction} className="active:opacity-60">
              <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55">
                {action}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {children}
    </View>
  );
}
