import React from 'react';
import { View, ViewProps } from 'react-native';

export interface PedestalProps extends ViewProps {
  children: React.ReactNode;
}

export function Pedestal({ children, className, ...rest }: PedestalProps & { className?: string }) {
  return (
    <View
      className={`mx-4 mt-4 p-5 pb-7 rounded-[28px] bg-ink overflow-hidden ${className ?? ''}`}
      {...rest}
    >
      {children}
    </View>
  );
}
