import { Pressable, View } from 'react-native';

interface HeroPedestalProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function HeroPedestal({ children, onPress }: HeroPedestalProps) {
  const content = (
    <>
      <View
        className="absolute bg-yellow/10 rounded-full"
        style={{ width: 256, height: 256, top: -80, right: -64 }}
      />
      <View className="relative">{children}</View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="bg-charcoal rounded-3xl overflow-hidden active:opacity-90"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="bg-charcoal rounded-3xl overflow-hidden">
      {content}
    </View>
  );
}
