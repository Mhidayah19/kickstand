import React from 'react';
import { View, Text, Pressable } from 'react-native';

export interface FieldCardProps {
  label: string;
  value?: string;
  valueMono?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function FieldCard({ label, value, valueMono = false, onPress, children }: FieldCardProps) {
  const Body = (
    <View className="px-4 py-[13px] border border-hairline-2 rounded-[14px]">
      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-1">
        {label}
      </Text>
      {value !== undefined ? (
        <Text
          className={`text-ink font-sans-semibold text-[16px] ${valueMono ? 'font-mono' : ''}`}
          style={valueMono ? { fontVariant: ['tabular-nums'] } : undefined}
        >
          {value}
        </Text>
      ) : null}
      {children}
    </View>
  );
  if (!onPress) return Body;
  return <Pressable onPress={onPress}>{Body}</Pressable>;
}
