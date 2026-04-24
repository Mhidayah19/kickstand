import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView,
  ActivityIndicator, LayoutChangeEvent,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateBike } from '../lib/api/use-bikes';
import { useBikeCatalogMakes, useBikeCatalogModels } from '../lib/api/use-bike-catalog';
import { useBikeStore } from '../lib/store/bike-store';
import type { BikeClass, BikeCatalogEntry, CreateBikeInput } from '../lib/types/bike';
import { colors } from '../lib/colors';
import { TOP_BRANDS, getDisplayBrands } from '../lib/brand-picker';
import { FadeIn } from '../components/ui/fade-in';
import { SummaryPill } from '../components/ui/summary-pill';
import { TextField } from '../components/ui/text-field';
import { DateField } from '../components/ui/date-field';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';
import {
  Icon as AtelierIcon,
  IconBtn,
  Eyebrow,
  FieldCard,
} from '../components/ui/atelier';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ── Constants ───────────────────────────────────────────────────
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const BIKE_CLASSES: BikeClass[] = ['2B', '2A', '2'];
const CLASS_LABELS: Record<BikeClass, string> = { '2B': '\u2264 200cc', '2A': '\u2264 400cc', '2': 'No limit' };

const BRAND_ICONS: Record<string, IconName> = {
  Honda: 'motorbike',
  Yamaha: 'music-note',
  Kawasaki: 'racing-helmet',
  Ducati: 'speedometer',
  BMW: 'cog',
  Triumph: 'shield-outline',
  KTM: 'flash',
  'Harley-Davidson': 'road-variant',
  'Royal Enfield': 'crown',
  Aprilia: 'alpha-a-circle-outline',
  'Moto Guzzi': 'star-circle-outline',
  Suzuki: 'alpha-s-circle-outline',
  Benelli: 'alpha-b-circle-outline',
  Husqvarna: 'hexagon-outline',
  Indian: 'feather',
};

const SECTION_ORDER: SectionKey[] = ['brand', 'class', 'model', 'details', 'compliance'];

// Which sections are visible and in what state
type SectionKey = 'brand' | 'class' | 'model' | 'details' | 'compliance';
type SectionState = 'expanded' | 'collapsed' | 'hidden';

interface FormData {
  brand: string;
  model: string;
  year: string;
  class: BikeClass | '';
  plateNumber: string;
  currentMileage: string;
  registrationDate: string;
  insuranceExpiry: string;
}

// ── SG compliance date helpers ──────────────────────────────────
function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function calcCoeExpiry(registrationDate: string): string {
  return addYears(registrationDate, 10);
}

function calcInspectionDue(registrationDate: string): string {
  const firstInspection = new Date(addYears(registrationDate, 3));
  if (firstInspection > new Date()) return firstInspection.toISOString().slice(0, 10);
  // Find next yearly anniversary after today
  const regDate = new Date(registrationDate);
  const now = new Date();
  let year = now.getFullYear();
  let next = new Date(year, regDate.getMonth(), regDate.getDate());
  if (next <= now) next = new Date(year + 1, regDate.getMonth(), regDate.getDate());
  return next.toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Section label ───────────────────────────────────────────────
function SectionLabel({ children, trailing }: { children: string; trailing?: string }) {
  return (
    <View className="flex-row items-baseline justify-between mb-md">
      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">{children}</Text>
      {trailing && (
        <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">{trailing}</Text>
      )}
    </View>
  );
}

// ── Brand picker step ────────────────────────────────────────────
function StepBrand({
  selected,
  isOthers,
  onSelect,
  onSelectOthers,
  makes,
  isLoading,
}: {
  selected: string;
  isOthers: boolean;
  onSelect: (brand: string) => void;
  onSelectOthers: () => void;
  makes: string[];
  isLoading: boolean;
}) {
  const [search, setSearch] = useState('');
  const displayBrands = getDisplayBrands(search, makes, TOP_BRANDS);
  const isSearching = search.trim().length > 0;

  return (
    <View>
      {/* Popular brands */}
      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-sm">
        Popular
      </Text>

      {isLoading ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={colors.muted} />
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-sm">
            Loading
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-sm mb-md">
          {displayBrands.map((brand) => {
            const isSel = selected === brand && !isOthers;
            return (
              <TouchableOpacity
                key={brand}
                className={`rounded-full px-lg py-md items-center justify-center ${
                  isSel ? 'bg-ink' : 'bg-bg-2'
                }`}
                onPress={() => onSelect(brand)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
                accessibilityLabel={brand}
              >
                <Text
                  className={`font-sans-semibold text-sm tracking-[-0.01em] ${
                    isSel ? 'text-bg' : 'text-ink'
                  }`}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Others pill — hidden when actively searching */}
          {!isSearching && (
            <TouchableOpacity
              className={`rounded-full px-lg py-md items-center justify-center ${
                isOthers ? 'bg-ink' : 'bg-bg-2'
              }`}
              onPress={onSelectOthers}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isOthers }}
              accessibilityLabel="Others"
            >
              <Text
                className={`font-sans-semibold text-sm tracking-[-0.01em] ${
                  isOthers ? 'text-bg' : 'text-ink'
                }`}
              >
                Others
              </Text>
            </TouchableOpacity>
          )}

          {/* 0 results state */}
          {isSearching && displayBrands.length === 0 && (
            <Text className="font-sans text-sm text-muted px-xs">
              No brands match. Clear the search to enter one manually.
            </Text>
          )}
        </View>
      )}

      {/* Separator label */}
      <View className="items-center mb-md mt-xs">
        <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
          Or search all brands
        </Text>
      </View>

      {/* Search */}
      <TextField
        placeholder="e.g. Harley, CFMoto"
        value={search}
        onChangeText={setSearch}
        inputClassName="text-base"
      />
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────
export default function AddMotorcycleScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const sectionYOffsets = useRef<Record<SectionKey, number>>({
    brand: 0, class: 0, model: 0, details: 0, compliance: 0,
  });
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleSectionLayout = (key: SectionKey) => (e: LayoutChangeEvent) => {
    sectionYOffsets.current[key] = e.nativeEvent.layout.y;
  };

  // Section visibility
  const [sections, setSections] = useState<Record<SectionKey, SectionState>>({
    brand: 'expanded',
    class: 'hidden',
    model: 'hidden',
    details: 'hidden',
    compliance: 'hidden',
  });

  // Form state
  const [formError, setFormError] = useState<string | null>(null);
  const [isOthers, setIsOthers] = useState(false);
  const [selectedCatalogEntry, setSelectedCatalogEntry] = useState<BikeCatalogEntry | null>(null);
  const [data, setData] = useState<FormData>({
    brand: '', model: '', year: '', class: '',
    plateNumber: '', currentMileage: '',
    registrationDate: '', insuranceExpiry: '',
  });

  const createBike = useCreateBike();
  const setActiveBikeId = useBikeStore((s) => s.setActiveBikeId);

  // API hooks
  const { data: makes, isLoading: makesLoading } = useBikeCatalogMakes();
  const { data: allModels, isLoading: modelsLoading } = useBikeCatalogModels(
    !isOthers ? data.brand : null,
  );

  // Filter models by selected license class
  const filteredModels = useMemo(() => {
    if (!allModels || !data.class) return [];
    return allModels.filter((m) => m.licenseClass === data.class);
  }, [allModels, data.class]);


  // ── Helpers ──
  const scrollToSection = (key: SectionKey) => {
    const y = sectionYOffsets.current[key];
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  };

  const collapseAndAdvance = (current: SectionKey, next: SectionKey) => {
    const nextIdx = SECTION_ORDER.indexOf(next);
    setSections((prev) => {
      const updated = { ...prev };
      updated[current] = 'collapsed';
      updated[next] = 'expanded';
      for (let i = nextIdx + 1; i < SECTION_ORDER.length; i++) {
        updated[SECTION_ORDER[i]] = 'hidden';
      }
      return updated;
    });
    setFormError(null);
    InteractionManager.runAfterInteractions(() => scrollToSection(next));
  };

  const reopenSection = (key: SectionKey) => {
    const idx = SECTION_ORDER.indexOf(key);
    setSections((prev) => {
      const updated = { ...prev };
      updated[key] = 'expanded';
      for (let i = idx + 1; i < SECTION_ORDER.length; i++) {
        updated[SECTION_ORDER[i]] = 'hidden';
      }
      return updated;
    });
    // Reset downstream selections
    if (key === 'brand') {
      setData((prev) => ({ ...prev, class: '', model: '' }));
      setSelectedCatalogEntry(null);
    } else if (key === 'class') {
      setData((prev) => ({ ...prev, model: '' }));
      setSelectedCatalogEntry(null);
    } else if (key === 'model') {
      setSelectedCatalogEntry(null);
    }
    setFormError(null);
    InteractionManager.runAfterInteractions(() => scrollToSection(key));
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // ── Brand selection ──
  const handleSelectBrand = (brand: string) => {
    setIsOthers(false);
    setSelectedCatalogEntry(null);
    setData((prev) => ({ ...prev, brand, model: '', class: '' }));
    collapseAndAdvance('brand', 'class');
  };

  const handleSelectOthers = () => {
    setIsOthers(true);
    setSelectedCatalogEntry(null);
    setData((prev) => ({ ...prev, brand: '', model: '', class: '' }));
    collapseAndAdvance('brand', 'class');
  };

  // ── Class selection ──
  const handleSelectClass = (cls: BikeClass) => {
    setSelectedCatalogEntry(null);
    setData((prev) => ({ ...prev, class: cls, model: '' }));
    collapseAndAdvance('class', 'model');
  };

  // ── Model selection ──
  const handleSelectCatalogEntry = (entry: BikeCatalogEntry) => {
    setSelectedCatalogEntry(entry);
    setData((prev) => ({ ...prev, model: entry.model }));
    collapseAndAdvance('model', 'details');
  };

  // ── Details continue ──
  const handleDetailsContinue = () => {
    const year = parseInt(data.year, 10);
    if (!data.year || isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      setFormError('Enter a valid year (1990\u2013present)');
      return;
    }
    if (data.plateNumber.trim().length < 3) {
      setFormError('Plate number must be at least 3 characters');
      return;
    }
    const mileage = parseInt(data.currentMileage, 10);
    if (data.currentMileage === '' || isNaN(mileage) || mileage < 0) {
      setFormError('Enter a valid mileage');
      return;
    }
    collapseAndAdvance('details', 'compliance');
  };

  // ── Derived compliance dates ──
  const hasRegistrationDate = DATE_REGEX.test(data.registrationDate);
  const hasInsuranceExpiry = DATE_REGEX.test(data.insuranceExpiry);
  const derivedCoeExpiry = hasRegistrationDate ? calcCoeExpiry(data.registrationDate) : '';
  const derivedInspectionDue = hasRegistrationDate ? calcInspectionDue(data.registrationDate) : '';
  const derivedRoadTaxExpiry = hasInsuranceExpiry ? data.insuranceExpiry : '';

  // ── Submit ──
  const handleSubmit = async () => {
    // Validate date formats for the two input fields
    for (const field of ['registrationDate', 'insuranceExpiry'] as const) {
      const val = data[field].trim();
      if (val.length > 0 && !DATE_REGEX.test(val)) {
        setFormError(`Invalid date format. Use YYYY-MM-DD`);
        return;
      }
    }

    const input: CreateBikeInput = {
      model: isOthers ? data.model : selectedCatalogEntry!.model,
      year: parseInt(data.year, 10),
      plateNumber: data.plateNumber,
      class: data.class as BikeClass,
      currentMileage: parseInt(data.currentMileage, 10),
      ...(selectedCatalogEntry && {
        catalogId: selectedCatalogEntry.id,
        make: selectedCatalogEntry.make,
        engineCc: selectedCatalogEntry.engineCc ?? undefined,
        bikeType: selectedCatalogEntry.bikeType,
      }),
      ...(isOthers && data.brand && { make: data.brand }),
      ...(derivedCoeExpiry && { coeExpiry: derivedCoeExpiry }),
      ...(derivedRoadTaxExpiry && { roadTaxExpiry: derivedRoadTaxExpiry }),
      ...(data.insuranceExpiry && { insuranceExpiry: data.insuranceExpiry }),
      ...(derivedInspectionDue && { inspectionDue: derivedInspectionDue }),
    };

    try {
      const bike = await createBike.mutateAsync(input);
      setActiveBikeId(bike.id);
      router.back();
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to add motorcycle');
    }
  };

  // ── Derived display values ──
  const motorcycleName = selectedCatalogEntry
    ? `${selectedCatalogEntry.make} ${selectedCatalogEntry.model}`
    : `${data.brand} ${data.model}`.trim();

  const motorcycleSubtitle = [
    data.class ? `Class ${data.class}` : null,
    selectedCatalogEntry?.bikeType,
    data.year || null,
  ].filter(Boolean).join(' \u2022 ');

  // CTA state — sticky ink button at the bottom (add-service pattern)
  const isOthersModelStep = sections.model === 'expanded' && isOthers;
  const showCTA =
    isOthersModelStep ||
    sections.details === 'expanded' ||
    sections.compliance === 'expanded';
  const isComplianceStep = sections.compliance === 'expanded';

  const ctaLabel = isComplianceStep
    ? (createBike.isPending ? 'Saving…' : 'Save bike')
    : 'Continue';
  const ctaDisabled = createBike.isPending;

  const handleCtaPress = () => {
    if (isOthersModelStep) {
      if (data.model.trim().length < 2) {
        setFormError('Enter a model name (at least 2 characters)');
        return;
      }
      collapseAndAdvance('model', 'details');
      return;
    }
    if (sections.details === 'expanded') {
      handleDetailsContinue();
      return;
    }
    if (isComplianceStep) {
      handleSubmit();
    }
  };

  const isDirty =
    Boolean(data.brand) ||
    isOthers ||
    Boolean(data.class) ||
    Boolean(data.model) ||
    Boolean(data.year) ||
    Boolean(data.plateNumber) ||
    Boolean(data.currentMileage);

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    router.back();
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Sticky mono header */}
          <View className="bg-bg px-5 pt-4 pb-5 flex-row justify-between items-center">
            <IconBtn icon="close" onPress={handleClose} />
            <Text className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              NEW {'·'} BIKE
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ paddingBottom: showCTA ? 128 : 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View className="px-5 pb-6">
              <Eyebrow>Add to garage</Eyebrow>
              <Text className="font-display text-[38px] leading-[1.05] text-ink mt-1.5">
                What are you riding?
              </Text>
            </View>

            <View className="px-5">
          <View
            onLayout={handleSectionLayout('brand')}
            className="mb-2xl"
          >
            <SectionLabel>Brand</SectionLabel>

            {sections.brand === 'expanded' && (
              <FadeIn>
                <StepBrand
                  selected={data.brand}
                  isOthers={isOthers}
                  onSelect={handleSelectBrand}
                  onSelectOthers={handleSelectOthers}
                  makes={makes ?? []}
                  isLoading={makesLoading}
                />
              </FadeIn>
            )}

            {sections.brand === 'collapsed' && (
              <SummaryPill
                icon={BRAND_ICONS[data.brand] ?? (isOthers ? 'plus' : 'motorbike')}
                label={isOthers ? 'Custom Brand' : data.brand}
                onEdit={() => reopenSection('brand')}
              />
            )}
          </View>

          {sections.class !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('class')}
              className="mb-2xl"
            >
              <SectionLabel>License Class</SectionLabel>

              {sections.class === 'expanded' && (
                <FadeIn>
                  <Text className="font-sans text-sm text-muted mb-md">
                    What class is your license?
                  </Text>
                  <View className="flex-row gap-md">
                    {BIKE_CLASSES.map((cls) => {
                      const isSel = data.class === cls;
                      return (
                        <TouchableOpacity
                          key={cls}
                          className={`flex-1 rounded-card py-lg items-center gap-xs ${
                            isSel ? 'bg-ink' : 'bg-bg-2'
                          }`}
                          onPress={() => handleSelectClass(cls)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Class ${cls}`}
                        >
                          <Text
                            className={`font-display text-[28px] leading-[30px] tracking-[-0.02em] ${
                              isSel ? 'text-bg' : 'text-ink'
                            }`}
                          >
                            {cls}
                          </Text>
                          <Text
                            className={`font-mono text-[10px] tracking-[0.14em] uppercase ${
                              isSel ? 'text-bg opacity-70' : 'text-muted'
                            }`}
                          >
                            {CLASS_LABELS[cls]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </FadeIn>
              )}

              {sections.class === 'collapsed' && (
                <SummaryPill
                  icon="card-account-details-outline"
                  label={`Class ${data.class}`}
                  onEdit={() => reopenSection('class')}
                />
              )}
            </View>
          )}

          {sections.model !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('model')}
              className="mb-2xl"
            >
              <SectionLabel
                trailing={!isOthers && sections.model === 'expanded'
                  ? `${filteredModels.length} model${filteredModels.length !== 1 ? 's' : ''}`
                  : undefined}
              >
                Model
              </SectionLabel>

              {sections.model === 'expanded' && (
                <FadeIn>
                  {isOthers ? (
                    /* Manual entry for "Others" */
                    <View className="gap-3">
                      <FieldCard label="Make">
                        <TextInput
                          value={data.brand}
                          onChangeText={(v) => handleChange('brand', v)}
                          placeholder="e.g. Royal Enfield"
                          placeholderTextColor="rgba(26,26,26,0.35)"
                          autoCapitalize="words"
                          style={{
                            fontFamily: 'PlusJakartaSans-SemiBold',
                            fontSize: 16,
                            color: colors.ink,
                          }}
                        />
                      </FieldCard>
                      <FieldCard label="Model">
                        <TextInput
                          value={data.model}
                          onChangeText={(v) => handleChange('model', v)}
                          placeholder="e.g. Scrambler"
                          placeholderTextColor="rgba(26,26,26,0.35)"
                          autoCapitalize="words"
                          style={{
                            fontFamily: 'PlusJakartaSans-SemiBold',
                            fontSize: 16,
                            color: colors.ink,
                          }}
                        />
                      </FieldCard>
                      <Text className="font-sans text-xs text-muted">
                        Specific models surface tighter service intervals.
                      </Text>
                    </View>
                  ) : (
                    /* Catalog model cards */
                    <View>
                      {modelsLoading ? (
                        <View className="py-xl items-center">
                          <ActivityIndicator size="small" color={colors.muted} />
                        </View>
                      ) : filteredModels.length === 0 ? (
                        <View className="bg-bg-2 rounded-card-lg p-xl items-center">
                          <AtelierIcon name="search" size={24} stroke={colors.muted} />
                          <Text className="font-sans-semibold text-ink text-sm mt-sm tracking-[-0.01em]">
                            No Class {data.class} models
                          </Text>
                          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-xs">
                            Try a different class
                          </Text>
                        </View>
                      ) : (
                        <View className="gap-md">
                          {filteredModels.map((entry) => {
                            const isSel = selectedCatalogEntry?.id === entry.id;
                            return (
                              <TouchableOpacity
                                key={entry.id}
                                className={`rounded-card-lg p-lg flex-row items-center justify-between ${
                                  isSel ? 'bg-ink' : 'bg-bg-2'
                                }`}
                                onPress={() => handleSelectCatalogEntry(entry)}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSel }}
                              >
                                <View className="flex-1">
                                  <Text
                                    className={`font-sans-semibold text-[17px] tracking-[-0.01em] ${
                                      isSel ? 'text-bg' : 'text-ink'
                                    }`}
                                  >
                                    {entry.model}
                                  </Text>
                                  <Text
                                    className={`font-mono text-[11px] tracking-[0.04em] mt-1 ${
                                      isSel ? 'text-bg opacity-70' : 'text-muted'
                                    }`}
                                    style={{ fontVariant: ['tabular-nums'] }}
                                  >
                                    {[
                                      entry.engineCc != null ? `${entry.engineCc}CC` : null,
                                      entry.bikeType?.toUpperCase(),
                                    ]
                                      .filter(Boolean)
                                      .join(' \u00b7 ')}
                                  </Text>
                                </View>
                                <View
                                  className={`w-10 h-10 rounded-full items-center justify-center ml-md ${
                                    isSel ? 'bg-bg' : 'bg-surface'
                                  }`}
                                >
                                  <AtelierIcon
                                    name="bike"
                                    size={20}
                                    stroke={colors.ink}
                                  />
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </FadeIn>
              )}

              {sections.model === 'collapsed' && (
                <SummaryPill
                  icon="motorbike"
                  label=""
                  onEdit={() => reopenSection('model')}
                >
                  <View>
                    <Text className="font-sans-semibold text-ink text-[15px] tracking-[-0.01em]">
                      {selectedCatalogEntry?.model ?? data.model}
                    </Text>
                    <Text
                      className="font-mono text-[11px] tracking-[0.04em] text-muted mt-0.5"
                      style={{ fontVariant: ['tabular-nums'] }}
                    >
                      {selectedCatalogEntry
                        ? `${selectedCatalogEntry.engineCc ? `${selectedCatalogEntry.engineCc}CC \u00b7 ` : ''}${selectedCatalogEntry.bikeType.toUpperCase()}`
                        : isOthers && data.brand
                          ? data.brand.toUpperCase()
                          : ''}
                    </Text>
                  </View>
                </SummaryPill>
              )}
            </View>
          )}

          {sections.details !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('details')}
              className="mb-2xl"
            >
              <SectionLabel>Details</SectionLabel>

              {sections.details === 'expanded' && (
                <FadeIn>
                  <View className="gap-3">
                    <FieldCard label="Year">
                      <TextInput
                        value={data.year}
                        onChangeText={(v) => handleChange('year', v)}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholder="2022"
                        placeholderTextColor="rgba(26,26,26,0.35)"
                        style={{
                          fontFamily: 'JetBrainsMono_500Medium',
                          fontSize: 16,
                          color: colors.ink,
                          fontVariant: ['tabular-nums'],
                        }}
                      />
                    </FieldCard>
                    <FieldCard label="Plate number">
                      <TextInput
                        value={data.plateNumber}
                        onChangeText={(v) => handleChange('plateNumber', v.toUpperCase())}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        placeholder="SBA1234A"
                        placeholderTextColor="rgba(26,26,26,0.35)"
                        style={{
                          fontFamily: 'JetBrainsMono_500Medium',
                          fontSize: 16,
                          color: colors.ink,
                          letterSpacing: 1,
                        }}
                      />
                    </FieldCard>
                    <FieldCard label="Current mileage">
                      <View className="flex-row items-baseline gap-1">
                        <TextInput
                          value={data.currentMileage}
                          onChangeText={(v) => handleChange('currentMileage', v)}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor="rgba(26,26,26,0.35)"
                          style={{
                            fontFamily: 'JetBrainsMono_500Medium',
                            fontSize: 16,
                            color: colors.ink,
                            fontVariant: ['tabular-nums'],
                            flex: 1,
                          }}
                        />
                        <Text className="font-mono text-[12px] text-muted">KM</Text>
                      </View>
                    </FieldCard>
                  </View>
                </FadeIn>
              )}

              {sections.details === 'collapsed' && (
                <SummaryPill
                  icon="information-outline"
                  label={`${data.year} \u2022 ${data.plateNumber.toUpperCase()} \u2022 ${Number(data.currentMileage).toLocaleString()} km`}
                  onEdit={() => reopenSection('details')}
                />
              )}
            </View>
          )}

          {sections.compliance !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('compliance')}
              className="mb-2xl"
            >
              <SectionLabel trailing="Optional">Compliance Dates</SectionLabel>

              {sections.compliance === 'expanded' && (
                <FadeIn>
                  <Text className="font-sans text-sm text-muted mb-lg">
                    {"Enter 2 dates and we'll calculate the rest."}
                  </Text>
                  <DateField label="Registration Date" value={data.registrationDate} onChange={(v) => handleChange('registrationDate', v)} className="mb-lg" />
                  <DateField label="Insurance Expiry" value={data.insuranceExpiry} onChange={(v) => handleChange('insuranceExpiry', v)} className="mb-lg" />

                  {/* Auto-calculated dates */}
                  {(hasRegistrationDate || hasInsuranceExpiry) && (
                    <View className="bg-bg-2 rounded-card-lg p-lg mt-sm mb-lg">
                      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-md">
                        Auto-calculated
                      </Text>
                      {hasRegistrationDate && (
                        <>
                          <View className="flex-row items-center justify-between mb-sm">
                            <View className="flex-row items-center gap-sm">
                              <AtelierIcon name="doc" size={16} stroke={colors.muted} />
                              <Text className="font-sans text-sm text-muted">COE expiry</Text>
                            </View>
                            <Text
                              className="font-mono text-[12px] text-ink"
                              style={{ fontVariant: ['tabular-nums'] }}
                            >
                              {formatDisplayDate(derivedCoeExpiry).toUpperCase()}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between mb-sm">
                            <View className="flex-row items-center gap-sm">
                              <AtelierIcon name="clipboard" size={16} stroke={colors.muted} />
                              <Text className="font-sans text-sm text-muted">Inspection due</Text>
                            </View>
                            <Text
                              className="font-mono text-[12px] text-ink"
                              style={{ fontVariant: ['tabular-nums'] }}
                            >
                              {formatDisplayDate(derivedInspectionDue).toUpperCase()}
                            </Text>
                          </View>
                        </>
                      )}
                      {hasInsuranceExpiry && (
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-sm">
                            <AtelierIcon name="shield" size={16} stroke={colors.muted} />
                            <Text className="font-sans text-sm text-muted">Road tax expiry</Text>
                          </View>
                          <Text
                            className="font-mono text-[12px] text-ink"
                            style={{ fontVariant: ['tabular-nums'] }}
                          >
                            {formatDisplayDate(derivedRoadTaxExpiry).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Motorcycle summary */}
                  {motorcycleName.trim().length > 0 && (
                    <View className="bg-bg-2 rounded-card-lg p-lg mt-sm overflow-hidden">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-xs">
                            Your bike
                          </Text>
                          <Text className="font-display text-[28px] leading-[30px] tracking-[-0.01em] text-ink">
                            {motorcycleName}
                          </Text>
                          {motorcycleSubtitle.length > 0 && (
                            <Text className="font-mono text-[11px] tracking-[0.04em] text-muted mt-xs">
                              {motorcycleSubtitle.toUpperCase()}
                            </Text>
                          )}
                          {data.plateNumber && (
                            <Text
                              className="font-mono text-[11px] tracking-[0.04em] text-muted mt-xs"
                              style={{ fontVariant: ['tabular-nums'] }}
                            >
                              {`${data.plateNumber.toUpperCase()} \u00b7 ${Number(data.currentMileage).toLocaleString()} KM`}
                            </Text>
                          )}
                        </View>
                        <View className="w-14 h-14 bg-surface rounded-hero items-center justify-center ml-md">
                          <AtelierIcon name="bike" size={26} stroke={colors.ink} />
                        </View>
                      </View>
                    </View>
                  )}
                </FadeIn>
              )}
            </View>
          )}
            </View>

            {formError && (
              <View className="mx-5 mt-sm bg-danger-surface rounded-[14px] px-md py-sm flex-row items-center gap-sm">
                <AtelierIcon name="close" size={14} stroke={colors.danger} />
                <Text className="font-sans text-sm text-danger flex-1">{formError}</Text>
              </View>
            )}
          </ScrollView>

          {showCTA && (
            <View
              className="bg-bg absolute left-0 right-0 px-5 pt-4"
              style={{
                bottom: 0,
                paddingBottom: insets.bottom + 16,
              }}
            >
              <Pressable
                onPress={handleCtaPress}
                disabled={ctaDisabled}
                className="h-12 rounded-[14px] bg-ink items-center justify-center"
                style={{ opacity: ctaDisabled ? 0.4 : 1 }}
              >
                <Text className="font-sans-semibold text-[14px] text-bg tracking-[-0.01em]">
                  {ctaLabel}
                </Text>
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ConfirmationDialog
        visible={showDiscardDialog}
        eyebrow="UNSAVED CHANGES"
        title="Discard bike?"
        body="Your entry will be lost."
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={() => {
          setShowDiscardDialog(false);
          router.back();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </>
  );
}
