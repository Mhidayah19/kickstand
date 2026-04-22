import React from 'react';
import { Text, TextProps } from 'react-native';

export interface EyebrowProps extends TextProps {
  children: React.ReactNode;
}

export function Eyebrow({ children, className, ...rest }: EyebrowProps & { className?: string }) {
  return (
    <Text
      className={`font-mono text-[10px] tracking-[0.14em] uppercase text-muted ${className ?? ''}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
