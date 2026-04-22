import React, { useCallback, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';
import { WorkshopComboField } from '../components/service/workshop-combo-field';
import {
  IconBtn,
  Eyebrow,
  FieldCard,
  CategoryCell,
  Icon,
} from '../components/ui/atelier';
import type { IconName } from '../components/ui/atelier';
import { useBike } from '../lib/api/use-bikes';
import { useAllServiceLogs } from '../lib/api/use-service-logs';
import { useBikeStore } from '../lib/store/bike-store';
import { useServiceLogForm } from '../lib/hooks/use-service-log-form';
import { SERVICE_TYPE_KEYS } from '../lib/constants/service-types';
import type { ServiceTypeKey } from '../lib/constants/service-types';
import { useOcrStore } from '../lib/ocr/ocr-store';

// ─── Category grid ───────────────────────────────────────────────────────────
// One cell per ServiceTypeKey — direct 1:1 mapping so the tapped cell is the
// cell that activates. No reverse lookup, no collisions.

interface CategorySpec {
  icon: IconName;
  label: string;
  serviceType: ServiceTypeKey;
}

const CATEGORIES: CategorySpec[] = [
  { icon: 'oil',      label: 'Oil',           serviceType: 'oil_change' },
  { icon: 'chain',    label: 'Chain Adjust',  serviceType: 'chain_adjustment' },
  { icon: 'chain',    label: 'Chain Replace', serviceType: 'chain_replacement' },
  { icon: 'brake',    label: 'Brake Pads',    serviceType: 'brake_pads' },
  { icon: 'brake',    label: 'Brake Fluid',   serviceType: 'brake_fluid' },
  { icon: 'gauge',    label: 'Coolant',       serviceType: 'coolant' },
  { icon: 'filter',   label: 'Air Filter',    serviceType: 'air_filter' },
  { icon: 'zap',      label: 'Spark Plugs',   serviceType: 'spark_plugs' },
  { icon: 'tire',     label: 'Tyre Front',    serviceType: 'tire_front' },
  { icon: 'tire',     label: 'Tyre Rear',     serviceType: 'tire_rear' },
  { icon: 'tune',     label: 'Valve',         serviceType: 'valve_clearance' },
  { icon: 'sparkle',  label: 'Battery',       serviceType: 'battery' },
  { icon: 'oil',      label: 'Fork Oil',      serviceType: 'fork_oil' },
  { icon: 'settings', label: 'Clutch',        serviceType: 'clutch' },
  { icon: 'wrench',   label: 'Service',       serviceType: 'general_service' },
];

const PAGE_SIZE = 9;
const CATEGORY_PAGES: CategorySpec[][] = [];
for (let i = 0; i < CATEGORIES.length; i += PAGE_SIZE) {
  CATEGORY_PAGES.push(CATEGORIES.slice(i, i + PAGE_SIZE));
}

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatDateDisplay(iso: string): string {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { serviceType: serviceTypeParam } = useLocalSearchParams<{ serviceType?: string }>();
  const initialServiceType = SERVICE_TYPE_KEYS.includes(serviceTypeParam as ServiceTypeKey)
    ? (serviceTypeParam as ServiceTypeKey)
    : undefined;

  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  // useAllServiceLogs kept for frequentTypes compatibility — not used in this layout
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _allLogs } = useAllServiceLogs();

  const form = useServiceLogForm(activeBikeId, bike?.currentMileage, undefined, initialServiceType);
  // cost is not watched in the hook's return — read it via useWatch on form.control
  const cost = useWatch({ control: form.control, name: 'cost' }) as string;
  const pendingOcr = useOcrStore((s) => s.pending);
  const clearOcr = useOcrStore((s) => s.clear);

  useEffect(() => {
    if (pendingOcr) {
      form.prefillFromOcr(pendingOcr);
      clearOcr();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOcr]);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [partDraft, setPartDraft] = useState('');
  const [categoryPage, setCategoryPage] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const handleCategoryScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      setCategoryPage(page);
    },
    [screenWidth],
  );

  // Workshop expanded state — WorkshopComboField expects controlled expand/collapse
  const [workshopExpanded, setWorkshopExpanded] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!activeBikeId) {
      Alert.alert('No bike selected', 'Please select a bike in your garage first.');
      return;
    }
    try {
      await form.handleSave();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save service log.';
      Alert.alert('Error', message);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBikeId, form.handleSave, router]);

  const handleClose = useCallback(() => {
    if (form.isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    router.back();
  }, [form.isDirty, router]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    form.handleReset();
    router.back();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.handleReset, router]);

  const handleScan = useCallback(() => {
    router.push('/scan-receipt');
  }, [router]);

  // ── Date picker change ─────────────────────────────────────────────────────

  const handleDateChange = useCallback(
    (_event: unknown, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setDatePickerOpen(false);
      }
      if (selectedDate) {
        const iso = selectedDate.toISOString().split('T')[0];
        form.setDate(iso);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.setDate],
  );

  // ── Parts submit ───────────────────────────────────────────────────────────

  const handlePartSubmit = useCallback(() => {
    const trimmed = partDraft.trim();
    if (!trimmed) return;
    form.addPart();
    // addPart pushes a blank entry; we update it on the next tick once parts array updates
    setTimeout(() => {
      // The newly added part is last in the array; update its value
      const formParts = form.parts;
      const latest = formParts[formParts.length - 1];
      if (latest) {
        form.updatePart(latest.id, trimmed);
      }
    }, 0);
    setPartDraft('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partDraft, form.addPart, form.updatePart, form.parts]);

  // ── Date value ────────────────────────────────────────────────────────────

  const dateValue = form.date
    ? new Date(form.date + 'T00:00:00')
    : new Date();

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header bar ─────────────────────────────────────────────── */}
          <View className="px-5 pt-4 pb-5 flex-row justify-between items-center">
            <IconBtn icon="close" onPress={handleClose} />
            <Text className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              NEW · LOG
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* ── Hero ────────────────────────────────────────────────────── */}
          <View className="px-5 pb-6">
            <Eyebrow>Quick log</Eyebrow>
            <Text className="font-display text-[38px] leading-[1.05] text-ink mt-1.5">
              What did you do?
            </Text>
          </View>

          {/* ── Category grid 3×3 (paginated horizontally) ─────────────── */}
          <View className="mb-4">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleCategoryScroll}
              scrollEventThrottle={16}
            >
              {CATEGORY_PAGES.map((page, pageIdx) => (
                <View key={pageIdx} style={{ width: screenWidth }}>
                  <View className="px-5">
                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                      {page.map((c) => (
                        <View key={c.serviceType} style={{ width: '31.5%' }}>
                          <CategoryCell
                            icon={c.icon}
                            label={c.label}
                            active={form.serviceTypeKey === c.serviceType}
                            onPress={() => form.setServiceTypeKey(c.serviceType)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {CATEGORY_PAGES.length > 1 && (
              <View className="flex-row justify-center items-center gap-1.5 mt-3">
                {CATEGORY_PAGES.map((_, i) => (
                  <View
                    key={i}
                    className={`rounded-full ${
                      i === categoryPage ? 'bg-ink' : 'bg-hairline-2'
                    }`}
                    style={{
                      width: i === categoryPage ? 16 : 6,
                      height: 6,
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Date field ─────────────────────────────────────────────── */}
          <View className="mx-5 mt-3">
            <FieldCard
              label="Date"
              value={formatDateDisplay(form.date)}
              valueMono
              onPress={() => setDatePickerOpen(true)}
            />
          </View>

          {/* DateTimePicker — iOS inline, Android modal */}
          {datePickerOpen && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
          {/* iOS: show dismiss button below spinner */}
          {datePickerOpen && Platform.OS === 'ios' && (
            <View className="mx-5 mt-1 items-end">
              <Pressable
                onPress={() => setDatePickerOpen(false)}
                className="px-3 py-1.5"
              >
                <Text className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink">
                  Done
                </Text>
              </Pressable>
            </View>
          )}

          {/* ── Mileage field ───────────────────────────────────────────── */}
          <View className="mx-5 mt-3">
            <FieldCard label="Mileage">
              <View className="flex-row items-baseline gap-1">
                <TextInput
                  value={form.mileage}
                  onChangeText={form.setMileage}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="rgba(26,26,26,0.35)"
                  style={{
                    fontFamily: 'JetBrainsMono_500Medium',
                    fontSize: 16,
                    color: '#1A1A1A',
                    fontVariant: ['tabular-nums'],
                    flex: 1,
                  }}
                />
                <Text className="font-mono text-[12px] text-muted">KM</Text>
              </View>
            </FieldCard>
          </View>

          {/* ── Cost field ──────────────────────────────────────────────── */}
          <View className="mx-5 mt-3">
            <FieldCard label="Cost (S$)">
              <TextInput
                value={cost}
                onChangeText={form.setCost}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="rgba(26,26,26,0.35)"
                style={{
                  fontFamily: 'JetBrainsMono_500Medium',
                  fontSize: 16,
                  color: '#1A1A1A',
                  fontVariant: ['tabular-nums'],
                }}
              />
            </FieldCard>
          </View>

          {/* ── Scan receipt ────────────────────────────────────────────── */}
          <Pressable
            onPress={handleScan}
            className="mx-5 mt-3 px-4 py-[13px] rounded-[14px] items-center justify-center flex-row gap-2"
            style={{
              borderWidth: 1.5,
              borderColor: 'rgba(26,26,26,0.16)',
              borderStyle: 'dashed',
            }}
          >
            <Icon name="camera" size={16} stroke="#7A756C" />
            <Text className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              Scan receipt
            </Text>
          </Pressable>

          {/* ── Parts used ──────────────────────────────────────────────── */}
          <View
            className="mx-5 mt-3 px-4 py-[13px] rounded-[14px]"
            style={{ borderWidth: 1, borderColor: 'rgba(26,26,26,0.16)' }}
          >
            <Eyebrow className="mb-2">Parts used</Eyebrow>

            {/* Chips for existing parts (skip empty default blank) */}
            {form.parts.filter((p) => p.value.trim()).length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {form.parts
                  .filter((p) => p.value.trim())
                  .map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => form.removePart(p.id)}
                    >
                      <View
                        className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                        style={{ borderWidth: 1, borderColor: 'rgba(26,26,26,0.16)' }}
                      >
                        <Text className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-2">
                          {p.value}
                        </Text>
                        <Icon name="close" size={12} stroke="#7A756C" />
                      </View>
                    </Pressable>
                  ))}
              </View>
            )}

            <TextInput
              value={partDraft}
              onChangeText={setPartDraft}
              onSubmitEditing={handlePartSubmit}
              returnKeyType="done"
              placeholder="Add a part + return"
              placeholderTextColor="rgba(26,26,26,0.35)"
              style={{
                fontFamily: 'PlusJakartaSans-Medium',
                fontSize: 14,
                color: '#1A1A1A',
              }}
            />
          </View>

          {/* ── Workshop ────────────────────────────────────────────────── */}
          <View className="mx-5 mt-3">
            <WorkshopComboField
              workshopName={form.workshopName}
              workshopAddress={form.workshopAddress}
              expanded={workshopExpanded}
              onExpand={() => setWorkshopExpanded(true)}
              onCollapse={() => setWorkshopExpanded(false)}
              onClear={form.clearWorkshop}
            />
          </View>
        </ScrollView>

        {/* ── Sticky Save button ──────────────────────────────────────── */}
        <View
          className="absolute left-0 right-0 px-5 pt-4"
          style={{
            bottom: 0,
            paddingBottom: insets.bottom + 16,
            backgroundColor: '#F4F2EC',
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={!form.serviceTypeKey || form.isPending}
            className="h-12 rounded-[14px] bg-ink items-center justify-center"
            style={{ opacity: !form.serviceTypeKey || form.isPending ? 0.4 : 1 }}
          >
            <Text className="font-sans-semibold text-[14px] text-bg tracking-[-0.01em]">
              {form.isPending ? 'Saving…' : 'Save entry'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ConfirmationDialog
        visible={showDiscardDialog}
        title="Discard Log?"
        body="You have unsaved changes. They will be lost if you close now."
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </>
  );
}
