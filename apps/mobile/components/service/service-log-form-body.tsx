import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { DateField } from '../ui/date-field';
import { FormField } from '../ui/form-field';
import { ServiceTypeSelector } from './service-type-selector';
import { PartsUsed } from './parts-used';
import { ReceiptStrip } from './ReceiptStrip';
import { ReceiptViewer } from './ReceiptViewer';
import { WorkshopNoMatchHint } from './workshop-no-match-hint';
import { WorkshopField } from './workshop-field';
import { useImageUpload } from '../../lib/hooks/use-image-upload';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';
import type { FrequentType } from '../../lib/service-type-helpers';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  frequentTypes: FrequentType[];
  bikeId: string;
  isEditing?: boolean;
  onWorkshopPress?: () => void;
}

export function ServiceLogFormBody({
  form,
  frequentTypes,
  bikeId,
  isEditing = false,
  onWorkshopPress,
}: ServiceLogFormBodyProps) {
  const { workshopName, workshopId, workshopAddress, clearWorkshop } = form;
  const [collapsed, setCollapsed] = useState(isEditing);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  const initiallyCollapsed = isEditing;
  const formOpacity = useRef(new Animated.Value(initiallyCollapsed ? 1 : 0)).current;
  const formTranslateY = useRef(new Animated.Value(initiallyCollapsed ? 0 : 12)).current;

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

  const handleExpand = useCallback(() => setCollapsed(false), []);

  const { uploadingCount, pickAndUploadMultiple } = useImageUpload({
    bucket: 'receipts',
    prefix: bikeId,
    dialogTitle: 'Add Evidence',
  });

  const handleAdd = useCallback(async () => {
    const remaining = 5 - form.receiptUrls.length;
    if (remaining <= 0) return;
    const urls = await pickAndUploadMultiple(remaining);
    if (urls.length > 0) form.addReceiptUrls(urls);
  }, [form.receiptUrls.length, form.addReceiptUrls, pickAndUploadMultiple]);

  const handlePress = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
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

            {onWorkshopPress ? (
              <View className="mt-lg">
                <WorkshopField
                  workshopName={workshopName}
                  workshopAddress={workshopAddress}
                  onPress={onWorkshopPress}
                  onClear={clearWorkshop}
                />
                {workshopName && !workshopId ? (
                  <WorkshopNoMatchHint
                    workshopName={workshopName}
                    onPress={onWorkshopPress}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          <PartsUsed
            serviceTypeKey={form.serviceTypeKey}
            parts={form.parts}
            onUpdate={form.updatePart}
            onAdd={form.addPart}
            onRemove={form.removePart}
          />

          <Section label="Evidence & Documentation">
            <ReceiptStrip
              urls={form.receiptUrls}
              onAdd={handleAdd}
              onRemove={form.removeReceiptUrl}
              onPress={handlePress}
              uploadingCount={uploadingCount}
            />
          </Section>
        </Animated.View>
      )}

      <ReceiptViewer
        urls={form.receiptUrls}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
