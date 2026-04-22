import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Icon, IconName } from './Icon';

export interface IconBtnProps extends PressableProps {
  icon: IconName;
  size?: number;
}

export function IconBtn({ icon, size = 16, ...rest }: IconBtnProps) {
  return (
    <Pressable
      className="w-9 h-9 items-center justify-center rounded-[10px] border border-hairline-2 bg-transparent"
      {...rest}
    >
      <Icon name={icon} size={size} stroke="#1A1A1A" />
    </Pressable>
  );
}
