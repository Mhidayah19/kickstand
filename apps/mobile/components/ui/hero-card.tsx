import React from 'react';
import { View } from 'react-native';

interface HeroCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroCard({ children, className = '' }: HeroCardProps) {
  return (
    <View
      className={`bg-hero rounded-2xl p-xl mb-lg ${className}`}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
    >
      {children}
    </View>
  );
}
