import { useMemo, useRef } from 'react';
import { View, TextInput, TextInputProps, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Label from '@rn-primitives/label';
import { cn } from '../../lib/cn';
import { colors } from '../../lib/colors';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  inputClassName?: string;
  className?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export function TextField({
  label,
  error,
  prefix,
  suffix,
  inputClassName,
  className,
  icon,
  onFocus,
  onBlur,
  editable,
  ...props
}: TextFieldProps) {
  const underlineWidth = useRef(new Animated.Value(0)).current;

  function handleFocus(e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    Animated.timing(underlineWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  }

  function handleBlur(e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    Animated.timing(underlineWidth, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  }

  const widthPercent = useMemo(
    () => underlineWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    [underlineWidth],
  );

  return (
    <View>
      <View
        className={cn(
          'bg-bg-2 p-6 rounded-xl overflow-hidden',
          editable === false && 'opacity-50',
          className,
        )}
      >
        {!!label && (
          <Label.Root>
            <Label.Text className="font-sans-bold text-xxs text-muted uppercase tracking-wide-1 mb-2">
              {label}
            </Label.Text>
          </Label.Root>
        )}

        <View className="flex-row items-center gap-2">
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={colors.muted}
            />
          )}
          {prefix && (
            <Label.Text className="font-sans-bold text-xl text-ink">
              {prefix}
            </Label.Text>
          )}
          <TextInput
            className={cn('flex-1 font-sans-bold text-ink p-0', inputClassName ?? 'text-2xl')}
            placeholderTextColor={colors.hairline2}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {suffix && (
            <Label.Text className="font-sans-bold text-xs text-muted uppercase tracking-wide-1">
              {suffix}
            </Label.Text>
          )}
        </View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            width: widthPercent,
            backgroundColor: colors.yellow,
          }}
        />
      </View>
      {error && (
        <Label.Text className="text-xs text-danger font-sans-medium mt-2">
          {error}
        </Label.Text>
      )}
    </View>
  );
}
