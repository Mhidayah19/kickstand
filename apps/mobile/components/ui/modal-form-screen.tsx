import React, { forwardRef, useMemo } from 'react';
import {
  View, Text, ScrollView,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './atelier';
import { colors } from '../../lib/colors';
import { PrimaryButton } from './primary-button';

const CTA_BAR_HEIGHT = 124;

interface CtaConfig {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}

interface ModalFormScreenProps {
  onClose: () => void;
  title: string;
  label?: string;
  subtitle?: string;
  children: React.ReactNode;
  // Sticky bottom CTA — omit to render no fixed button
  cta?: CtaConfig;
  error?: string | null;
}

export const ModalFormScreen = forwardRef<ScrollView, ModalFormScreenProps>(
  ({ onClose, title, label, subtitle, children, cta, error }, ref) => {
    const scrollContentStyle = useMemo(
      () => ({ flexGrow: 1, paddingHorizontal: 24, paddingBottom: cta ? CTA_BAR_HEIGHT : 40 }),
      [cta],
    );

    return (
      <SafeAreaView className="flex-1 bg-bg">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <View className="px-lg pt-3xl pb-2xl">
            {label && (
              <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-sm">
                {label}
              </Text>
            )}
            <View className="flex-row items-center justify-between gap-md">
              <View className="flex-1">
                <Text className="font-display text-[32px] leading-[36px] tracking-[-0.01em] text-ink">{title}</Text>
                {subtitle && (
                  <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-xs">
                    {subtitle}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="w-10 h-10 rounded-full bg-bg-2 items-center justify-center active:opacity-70"
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Icon name="close" size={18} stroke={colors.ink} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={ref}
            contentContainerStyle={scrollContentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}

            {error && (
              <View className="bg-danger-surface rounded-xl px-md py-sm flex-row items-center gap-sm mt-sm">
                <Icon name="close" size={16} stroke={colors.danger} />
                <Text className="text-sm text-danger font-sans-medium flex-1">{error}</Text>
              </View>
            )}
          </ScrollView>

          {cta && (
            <View
              className="absolute bottom-0 left-0 right-0 px-lg pb-xl pt-md bg-bg border-t border-hairline"
            >
              <PrimaryButton
                variant="accent"
                label={cta.label}
                onPress={cta.onPress}
                icon={cta.icon}
                disabled={cta.disabled}
              />
            </View>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  },
);

ModalFormScreen.displayName = 'ModalFormScreen';
