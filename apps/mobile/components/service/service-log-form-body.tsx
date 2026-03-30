import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { PrimaryButton } from '../ui/primary-button';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { DateField } from '../ui/date-field';
import { FormField } from '../ui/form-field';
import { ServiceTypeSelector } from './service-type-selector';
import { PartsUsed } from './parts-used';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';
import type { FrequentType } from '../../lib/service-type-helpers';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  onSave: () => Promise<void>;
  frequentTypes: FrequentType[];
}

export function ServiceLogFormBody({ form, onSave, frequentTypes }: ServiceLogFormBodyProps) {
  const [collapsed, setCollapsed] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(12)).current;

  const hasSelected = !!form.serviceTypeKey;

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
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setCollapsed(true), 150);
  }, [form.setServiceTypeKey]);

  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, []);

  return (
    <View>
      <View className="mt-sm">
        <ServiceTypeSelector
          selected={form.serviceTypeKey}
          onSelect={handleSelectType}
          collapsed={collapsed}
          onExpand={handleExpand}
          frequentTypes={frequentTypes}
        />
      </View>

      {hasSelected && (
        <Animated.View
          style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}
          pointerEvents={collapsed ? 'auto' : 'none'}
        >
          <View className="mb-2xl">
            <View className="flex-row gap-lg mb-lg">
              <View className="flex-1">
                <TextField
                  label="Mileage"
                  value={form.mileage}
                  onChangeText={form.setMileage}
                  placeholder="54,000"
                  keyboardType="numeric"
                  inputClassName="text-xl"
                  suffix="km"
                  error={form.errors.mileage?.message as string | undefined}
                />
              </View>
              <View className="flex-1">
                <DateField
                  label="Date"
                  value={form.date}
                  onChange={form.setDate}
                  error={form.errors.date?.message as string | undefined}
                />
              </View>
            </View>

            <FormField control={form.control} name="cost" errors={form.errors}>
              <TextField
                label="Estimated Cost"
                placeholder="350"
                prefix="$"
                keyboardType="numeric"
                inputClassName="text-xl"
              />
            </FormField>
          </View>

          <PartsUsed
            serviceTypeKey={form.serviceTypeKey}
            parts={form.parts}
            onUpdate={form.updatePart}
            onAdd={form.addPart}
            onRemove={form.removePart}
          />

          <Section label="Evidence & Documentation">
            <View className="border-2 border-dashed border-outline rounded-xl py-3xl items-center justify-center">
              <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
              <Text className="font-sans-bold text-sm text-outline mt-sm">Upload Evidence</Text>
            </View>
          </Section>

          <View className="mt-lg">
            <PrimaryButton
              label={form.isPending ? 'Saving...' : 'Save Log'}
              onPress={onSave}
              icon="check-circle"
              disabled={form.isPending}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}
