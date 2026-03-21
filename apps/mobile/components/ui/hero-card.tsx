import { View } from 'react-native';

interface HeroCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroCard({ children, className = '' }: HeroCardProps) {
  return (
    <View
      className={`bg-charcoal rounded-3xl p-8 mb-6 overflow-hidden ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.3,
        shadowRadius: 50,
        elevation: 12,
      }}
    >
      {children}
    </View>
  );
}
