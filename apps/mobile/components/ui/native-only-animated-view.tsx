import { Platform, Animated, type ViewProps } from 'react-native';
import { useEffect, useRef } from 'react';

function NativeOnlyAnimatedView({
  children,
  style,
  ...props
}: ViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return (
    <Animated.View style={[{ opacity }, style]} {...props}>
      {children}
    </Animated.View>
  );
}

export { NativeOnlyAnimatedView };
