import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function SafeScreen({ children, scrollable = false, className }: SafeScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName={`px-lg pb-24 ${className ?? ''}`}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-background px-lg ${className ?? ''}`}>
      {children}
    </SafeAreaView>
  );
}
