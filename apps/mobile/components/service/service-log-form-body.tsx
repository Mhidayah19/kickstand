import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { DateField } from '../ui/date-field';
import { FormField } from '../ui/form-field';
import { ServiceTypeSelector } from './service-type-selector';
import { PartsUsed } from './parts-used';
import { ReceiptStrip } from './ReceiptStrip';
import { ReceiptViewer } from './ReceiptViewer';
import { useImageUpload } from '../../lib/hooks/use-image-upload';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';
import type { FrequentType } from '../../lib/service-type-helpers';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  frequentTypes: FrequentType[];
  bikeId: string;
  isEditing?: boolean;
}

export function ServiceLogFormBody({ form, frequentTypes, bikeId, isEditing = false }: ServiceLogFormBodyProps) {
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

      {/* Line items split */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55">
            Line items
          </Text>
          <Pressable onPress={form.addLineItem} className="flex-row items-center gap-1 active:opacity-70">
            <MaterialCommunityIcons name="plus" size={14} color={colors.charcoal} />
            <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal">
              Add item
            </Text>
          </Pressable>
        </View>

        <View className="bg-sand/10 rounded-3xl p-2">
          {form.lineItems.map((li) => (
            <LineItemRow
              key={li.id}
              item={li}
              total={form.totalAmount}
              onUpdate={(patch) => form.updateLineItem(li.id, patch)}
              onRemove={() => form.removeLineItem(li.id)}
            />
          ))}
          {form.lineItems.length === 0 && (
            <View className="px-4 py-6 items-center">
              <Text className="text-[12px] font-sans-medium text-charcoal/55">
                {'No line items yet. Tap "Add item" to split the receipt.'}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-3 px-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => form.setRemainderIsLabour(!form.remainderIsLabour)}
            className="flex-row items-center gap-2 active:opacity-70"
          >
            <View
              className={`w-4 h-4 rounded border border-outline items-center justify-center ${
                form.remainderIsLabour ? 'bg-charcoal' : ''
              }`}
            >
              {form.remainderIsLabour && <MaterialCommunityIcons name="check" size={12} color={colors.surface} />}
            </View>
            <Text className="text-[11px] font-sans-bold text-charcoal">Remainder is labour</Text>
          </Pressable>
          <Text className="text-[12px] font-sans-bold text-charcoal/55" style={{ fontVariant: ['tabular-nums'] }}>
            S$ {form.remainder.toFixed(2)} · {form.totalAmount > 0 ? Math.round((form.remainder / form.totalAmount) * 100) : 0}%
          </Text>
        </View>
      </View>

      <ReceiptViewer
        urls={form.receiptUrls}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

function LineItemRow({
  item,
  total,
  onUpdate,
  onRemove,
}: {
  item: { id: string; category: string; amount: number };
  total: number;
  onUpdate: (patch: { category?: string; amount?: number }) => void;
  onRemove: () => void;
}) {
  const ratio = total > 0 ? item.amount / total : 0;
  return (
    <View className="px-4 py-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-8 h-8 rounded-xl bg-sand/20 items-center justify-center">
            <MaterialCommunityIcons name="oil" size={16} color={colors.charcoal} />
          </View>
          <View className="flex-1">
            <TextInput
              value={item.category}
              placeholder="Category"
              onChangeText={(t) => onUpdate({ category: t })}
              className="text-[13px] font-sans-bold text-charcoal"
            />
          </View>
        </View>
        <TextInput
          value={item.amount > 0 ? item.amount.toString() : ''}
          placeholder="0"
          keyboardType="decimal-pad"
          onChangeText={(t) => onUpdate({ amount: parseFloat(t) || 0 })}
          className="text-[13px] font-sans-bold text-charcoal text-right w-20"
          style={{ fontVariant: ['tabular-nums'] }}
        />
        <Pressable onPress={onRemove} hitSlop={8} className="ml-2 active:opacity-70">
          <MaterialCommunityIcons name="close-circle" size={16} color={colors.outline} />
        </Pressable>
      </View>
      <View className="h-1 rounded-full bg-surface-low overflow-hidden">
        <View
          className="h-full bg-charcoal rounded-full"
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </View>
    </View>
  );
}
