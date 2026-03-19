import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface ListCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function ListCard({ children, onPress, className = '' }: ListCardProps) {
  const content = (
    <View
      className={`bg-surface border border-border rounded-xl p-lg mb-sm ${className}`}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}
