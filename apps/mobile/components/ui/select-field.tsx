import { ScrollView, TouchableOpacity, View, Text } from 'react-native';
import * as Label from '@rn-primitives/label';
import { cn } from '../../lib/cn';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function SelectField({
  label,
  options,
  value,
  onValueChange,
  error,
  className,
}: SelectFieldProps) {
  return (
    <View className={cn('mb-md', className)}>
      <Label.Root>
        <Label.Text className="font-sans-bold text-xxs text-muted uppercase tracking-wide-1 mb-2">
          {label}
        </Label.Text>
      </Label.Root>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-sm"
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onValueChange?.(opt.value)}
            className={cn(
              'px-md py-sm rounded-full border',
              value === opt.value
                ? 'bg-ink border-ink'
                : 'bg-surface border-hairline-2',
            )}
          >
            <Text
              className={cn(
                'text-sm font-sans-medium',
                value === opt.value ? 'text-white' : 'text-muted',
              )}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error ? (
        <Text className="text-xs text-danger font-sans-medium mt-2">{error}</Text>
      ) : null}
    </View>
  );
}
