import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { PrimaryButton } from '../ui/primary-button';
import { ScreenHeader } from '../ui/screen-header';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { ServiceTypeSelector } from './service-type-selector';
import { PartsUsed } from './parts-used';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';
import type { FrequentType } from '../../lib/service-type-helpers';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  bikeLabel: string;
  onSave: () => Promise<void>;
  onExit?: () => void;
  frequentTypes: FrequentType[];
}

export function ServiceLogFormBody({ form, bikeLabel, onSave, onExit, frequentTypes }: ServiceLogFormBodyProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up collapse timer on unmount
  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(12)).current;

  // Animate form fields in/out when collapsed state changes
  useEffect(() => {
    if (!hasSelected) return;
    if (collapsed) {
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 300, delay: 150, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 300, delay: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 12, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [collapsed, hasSelected]);

  const handleSelectType = useCallback((key: Parameters<typeof form.setServiceTypeKey>[0]) => {
    form.setServiceTypeKey(key);
    setHasSelected(true);
    // Auto-collapse after a brief delay so the selection registers visually
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setCollapsed(true), 150);
  }, [form.setServiceTypeKey]);

  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, []);

  return (
    <View>
      <ScreenHeader
        title="New Service Log"
        subtitle={bikeLabel}
        rightAction={
          <Pressable
            onPress={onExit}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-sand/20 items-center justify-center active:opacity-70"
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
          </Pressable>
        }
      />

      <View className="mt-2">
        <ServiceTypeSelector
          selected={form.serviceTypeKey}
          onSelect={handleSelectType}
          collapsed={collapsed}
          onExpand={handleExpand}
          frequentTypes={frequentTypes}
        />
      </View>

      <Animated.View
        style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}
        pointerEvents={hasSelected && collapsed ? 'auto' : 'none'}
      >
        <View className="mb-6">
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <TextField
                label="Mileage"
                value={form.mileage}
                onChangeText={form.setMileage}
                placeholder="54,000"
                keyboardType="numeric"
                inputClassName="text-xl"
                suffix="km"
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Date"
                value={form.date}
                onChangeText={form.setDate}
                placeholder="29 Mar 2026"
                inputClassName="text-xl"
              />
            </View>
          </View>

          <TextField
            label="Estimated Cost"
            value={form.cost}
            onChangeText={form.setCost}
            placeholder="350"
            prefix="$"
            keyboardType="numeric"
            inputClassName="text-xl"
          />
        </View>

        <PartsUsed
          serviceTypeKey={form.serviceTypeKey}
          parts={form.parts}
          onUpdate={form.updatePart}
          onAdd={form.addPart}
          onRemove={form.removePart}
        />

        <Section label="Evidence & Documentation">
          <View className="border-2 border-dashed border-outline rounded-xl py-8 items-center justify-center">
            <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
            <Text className="font-sans-bold text-sm text-outline mt-2">Upload Evidence</Text>
          </View>
        </Section>

        <View className="mt-4">
          <PrimaryButton
            label={form.isPending ? 'Saving...' : 'Save Log'}
            onPress={onSave}
            icon="check-circle"
            disabled={form.isPending}
          />
        </View>
      </Animated.View>
    </View>
  );
}
