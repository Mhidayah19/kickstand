import { View, Text, TextInput, TextInputProps } from 'react-native';
import { colors } from '../../lib/colors';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
}

export function TextField({ label, error, prefix, ...props }: TextFieldProps) {
  return (
    <View className="bg-surface-low p-6 rounded-xl">
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-2">
        {label}
      </Text>
      <View className="flex-row items-end gap-2">
        {prefix && (
          <Text className="font-sans-bold text-xl text-charcoal">{prefix}</Text>
        )}
        <TextInput
          className="flex-1 text-2xl font-sans-bold text-charcoal p-0"
          placeholderTextColor={colors.outline}
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-danger font-sans-medium mt-2">{error}</Text>}
    </View>
  );
}
