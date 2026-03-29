import { View, Text, TextInput, TextInputProps } from 'react-native';
import { colors } from '../../lib/colors';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  inputClassName?: string;
}

export function TextField({ label, error, prefix, suffix, inputClassName, ...props }: TextFieldProps) {
  return (
    <View className="bg-surface-low p-6 rounded-xl">
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-2">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {prefix && (
          <Text className="font-sans-bold text-xl text-charcoal">{prefix}</Text>
        )}
        <TextInput
          className={`flex-1 font-sans-bold text-charcoal p-0 ${inputClassName ?? 'text-2xl'}`}
          placeholderTextColor={colors.outline}
          {...props}
        />
        {suffix && (
          <Text className="font-sans-bold text-xs text-sand uppercase tracking-wide-1">{suffix}</Text>
        )}
      </View>
      {error && <Text className="text-xs text-danger font-sans-medium mt-2">{error}</Text>}
    </View>
  );
}
