import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
}

export function TextField({ label, error, prefix, style, className, ...rest }: TextFieldProps) {
  return (
    <View className="mb-md">
      <Text className="text-xs font-sans-medium text-text-secondary mb-xs">{label}</Text>
      <View
        className={`flex-row items-center bg-surface border rounded-lg px-md h-12 ${error ? 'border-danger' : 'border-border'}`}
      >
        {prefix ? <Text className="text-text-secondary font-sans mr-xs">{prefix}</Text> : null}
        <TextInput
          className="flex-1 text-sm font-sans text-text-primary"
          // Note: #a8a29e = --color-text-muted (light). NativeWind v4 CSS vars
          // cannot be read at JS runtime, so this is a known limitation.
          placeholderTextColor="#a8a29e"
          {...rest}
        />
      </View>
      {error ? <Text className="text-xs text-danger font-sans mt-xs">{error}</Text> : null}
    </View>
  );
}
