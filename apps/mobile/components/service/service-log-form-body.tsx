import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { DateField } from '../ui/date-field';
import { FormField } from '../ui/form-field';
import { ServiceTypeSelector } from './service-type-selector';
import { PartsUsed } from './parts-used';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';
import type { FrequentType } from '../../lib/service-type-helpers';
import { useImageUpload } from '../../lib/hooks/use-image-upload';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  frequentTypes: FrequentType[];
  bikeId: string;
}

export function ServiceLogFormBody({ form, frequentTypes, bikeId }: ServiceLogFormBodyProps) {
  const [collapsed, setCollapsed] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!collapsed) {
      formOpacity.setValue(0);
      formTranslateY.setValue(12);
      return;
    }
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 300, delay: 150, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 300, delay: 150, useNativeDriver: true }),
    ]).start();
  }, [collapsed]);

  const handleSelectType = useCallback((key: Parameters<typeof form.setServiceTypeKey>[0]) => {
    form.setServiceTypeKey(key);
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setCollapsed(true), 150);
  }, [form.setServiceTypeKey]);

  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, []);

  const { isUploading, pickAndUpload } = useImageUpload({
    bucket: 'receipts',
    prefix: bikeId,
    dialogTitle: 'Add Evidence',
  });

  const handleEvidenceUpload = useCallback(async () => {
    const result = await pickAndUpload();
    if (result) {
      form.setReceiptUrl(result.publicUrl);
    }
  }, [pickAndUpload, form.setReceiptUrl]);

  const handleRemoveEvidence = useCallback(() => {
    form.setReceiptUrl(null);
  }, [form.setReceiptUrl]);

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

      {collapsed && (
        <Animated.View
          style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}
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
            {form.receiptUrl ? (
              <View>
                <View style={{ width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surfaceLow }}>
                  <Image
                    source={{ uri: form.receiptUrl }}
                    style={{ width: '100%', height: 160 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-row gap-md mt-md">
                  <Pressable
                    onPress={handleEvidenceUpload}
                    disabled={isUploading}
                    className="flex-1 bg-surface-low py-sm rounded-xl items-center active:opacity-70"
                  >
                    <Text className="font-sans-bold text-xs text-charcoal">
                      {isUploading ? 'Uploading…' : 'Replace'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleRemoveEvidence}
                    className="flex-1 bg-surface-low py-sm rounded-xl items-center active:opacity-70"
                  >
                    <Text className="font-sans-bold text-xs text-danger">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handleEvidenceUpload}
                disabled={isUploading}
                className="border-2 border-dashed border-outline rounded-xl py-3xl items-center justify-center active:opacity-70"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={colors.outline} />
                ) : (
                  <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
                )}
                <Text className="font-sans-bold text-sm text-outline mt-sm">
                  {isUploading ? 'Uploading…' : 'Upload Evidence'}
                </Text>
              </Pressable>
            )}
          </Section>
        </Animated.View>
      )}
    </View>
  );
}
