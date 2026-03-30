import React, { forwardRef, useMemo } from 'react';
import {
  View, Text, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { PrimaryButton } from './primary-button';

const CTA_BAR_HEIGHT = 140;

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
      <SafeAreaView className="flex-1 bg-surface">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <View className="px-lg pt-3xl pb-2xl">
            {label && (
              <Text className="text-xs font-sans-bold text-yellow tracking-widest uppercase mb-sm">
                {label}
              </Text>
            )}
            <View className="flex-row items-center justify-between gap-md">
              <View className="flex-1">
                <Text className="font-sans-xbold text-charcoal text-3xl leading-tight">{title}</Text>
                {subtitle && (
                  <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mt-xs">
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={8}
                className="w-10 h-10 rounded-full bg-sand/20 items-center justify-center active:opacity-70"
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close" size={22} color={colors.charcoal} />
              </TouchableOpacity>
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
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text className="text-sm text-danger font-sans-medium flex-1">{error}</Text>
              </View>
            )}
          </ScrollView>

          {cta && (
            <View className="absolute bottom-0 left-0 right-0 px-lg pb-xl pt-md bg-surface">
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
