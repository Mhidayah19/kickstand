import { View } from 'react-native';

interface HeroCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroCard({ children, className = '' }: HeroCardProps) {
  return (
    <View
      className={`bg-ink rounded-3xl p-8 mb-6 overflow-hidden ${className}`}
    >
      {children}
    </View>
  );
}
