import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon, IconName } from './Icon';

export interface RowProps {
  icon: IconName;
  title: string;
  sub: string;
  trail?: string | React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function Row({ icon, title, sub, trail, chevron = false, onPress, testID }: RowProps) {
  const Body = (
    <View className="flex-row items-center gap-[14px] py-[14px] border-b border-hairline">
      <View className="w-10 h-10 items-center justify-center rounded-xl border border-hairline-2">
        <Icon name={icon} size={18} stroke="#1A1A1A" />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="font-sans-semibold text-[15px] text-ink tracking-[-0.01em]" numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text className="font-mono text-[12px] text-muted mt-0.5 tracking-[0.02em]" numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {typeof trail === 'string' ? (
        <Text
          className="font-sans-semibold text-[14px] text-ink"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {trail}
        </Text>
      ) : (
        trail
      )}
      {chevron ? <Icon name="chevron" size={14} stroke="#7A756C" /> : null}
    </View>
  );

  if (!onPress) return Body;
  return <Pressable onPress={onPress} testID={testID}>{Body}</Pressable>;
}
