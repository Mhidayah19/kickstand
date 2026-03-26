import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, LayoutChangeEvent,
  Animated, InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateBike } from '../../../lib/api/use-bikes';
import { useBikeCatalogMakes, useBikeCatalogModels } from '../../../lib/api/use-bike-catalog';
import { useBikeStore } from '../../../lib/store/bike-store';
import type { BikeClass, BikeCatalogEntry, CreateBikeInput } from '../../../lib/types/bike';
import { colors } from '../../../lib/colors';
import { TOP_BRANDS, getDisplayBrands } from '../../../lib/brand-picker';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ── Constants ───────────────────────────────────────────────────
const PLACEHOLDER_COLOR = colors.outline;
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
  coeExpiry: string;
  roadTaxExpiry: string;
  insuranceExpiry: string;
  inspectionDue: string;
}

// ── Fade-in wrapper for section reveals ─────────────────────────
function FadeIn({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ── Animated focus-underline input ──────────────────────────────
function FocusInput({
  icon,
  label,
  trailingIcon,
  ...inputProps
}: {
  icon?: IconName;
  label: string;
  trailingIcon?: IconName;
} & React.ComponentProps<typeof TextInput>) {
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(underlineWidth, { toValue: 1, duration: 280, useNativeDriver: false }).start();
  }, [underlineWidth]);

  const handleBlur = useCallback(() => {
    Animated.timing(underlineWidth, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [underlineWidth]);

  return (
    <View className="mb-lg">
      <View className="flex-row items-center gap-sm mb-xs">
        {icon && <MaterialCommunityIcons name={icon} size={18} color={colors.sand} />}
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">{label}</Text>
      </View>
      <View className="bg-surface-low rounded-xl overflow-hidden">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 px-md py-sm font-sans-medium text-charcoal"
            placeholderTextColor={PLACEHOLDER_COLOR}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...inputProps}
          />
          {trailingIcon && (
            <View className="pr-md">
              <MaterialCommunityIcons name={trailingIcon} size={20} color={colors.sand} />
            </View>
          )}
        </View>
        <Animated.View
          style={{
            height: 2,
            backgroundColor: colors.yellow,
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: underlineWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}

// ── Collapsed summary pill ──────────────────────────────────────
function SummaryPill({
  icon,
  label,
  onEdit,
  children,
}: {
  icon: IconName;
  label: string;
  onEdit: () => void;
  children?: React.ReactNode;
}) {
  return (
    <FadeIn>
      <TouchableOpacity
        className="bg-surface-low rounded-xl px-lg py-md flex-row items-center justify-between"
        onPress={onEdit}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label}`}
      >
        <View className="flex-row items-center gap-md flex-1">
          <MaterialCommunityIcons name={icon} size={20} color={colors.charcoal} />
          {children ?? (
            <Text className="font-sans-bold text-charcoal text-sm">{label}</Text>
          )}
        </View>
        <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.sand} />
      </TouchableOpacity>
    </FadeIn>
  );
}

// ── Section label ───────────────────────────────────────────────
function SectionLabel({ children, trailing }: { children: string; trailing?: string }) {
  return (
    <View className="flex-row items-center justify-between mb-md">
      <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">{children}</Text>
      {trailing && <Text className="text-xs font-sans-medium text-sand">{trailing}</Text>}
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
      <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-sm">
        Popular
      </Text>

      {isLoading ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={colors.sand} />
          <Text className="text-sm font-sans-medium text-sand mt-sm">Loading brands...</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-sm mb-md">
          {displayBrands.map((brand) => (
            <TouchableOpacity
              key={brand}
              className={`rounded-2xl px-lg py-md items-center justify-center border-2 ${
                selected === brand && !isOthers
                  ? 'bg-charcoal border-charcoal'
                  : 'bg-surface-low border-transparent'
              }`}
              style={{ minWidth: 90 }}
              onPress={() => onSelect(brand)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === brand && !isOthers }}
              accessibilityLabel={brand}
            >
              <Text
                className={`font-sans-bold text-sm ${
                  selected === brand && !isOthers ? 'text-white' : 'text-charcoal'
                }`}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Others pill — hidden when actively searching */}
          {!isSearching && (
            <TouchableOpacity
              className={`rounded-2xl px-lg py-md items-center justify-center border-2 ${
                isOthers ? 'bg-charcoal border-charcoal' : 'bg-surface-low border-transparent'
              }`}
              style={{ minWidth: 90 }}
              onPress={onSelectOthers}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isOthers }}
              accessibilityLabel="Others"
            >
              <Text className={`font-sans-bold text-sm ${isOthers ? 'text-white' : 'text-charcoal'}`}>
                Others
              </Text>
            </TouchableOpacity>
          )}

          {/* 0 results state */}
          {isSearching && displayBrands.length === 0 && (
            <Text className="text-sm font-sans-medium text-sand px-xs">
              No brands found. Clear the search to add your brand manually.
            </Text>
          )}
        </View>
      )}

      {/* Divider */}
      <View className="flex-row items-center gap-sm mb-md">
        <View className="flex-1 h-px bg-sand/40" />
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">
          or search all brands
        </Text>
        <View className="flex-1 h-px bg-sand/40" />
      </View>

      {/* Search */}
      <TextInput
        className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
        placeholder="Search brands (e.g. Harley, CFMoto)"
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={search}
        onChangeText={setSearch}
      />
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────
export default function AddMachineScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionYOffsets = useRef<Record<SectionKey, number>>({
    brand: 0, class: 0, model: 0, details: 0, compliance: 0,
  });

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
    coeExpiry: '', roadTaxExpiry: '', insuranceExpiry: '', inspectionDue: '',
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
    const order: SectionKey[] = ['brand', 'class', 'model', 'details', 'compliance'];
    const nextIdx = order.indexOf(next);
    setSections((prev) => {
      const updated = { ...prev };
      updated[current] = 'collapsed';
      updated[next] = 'expanded';
      // Hide everything after `next`
      for (let i = nextIdx + 1; i < order.length; i++) {
        updated[order[i]] = 'hidden';
      }
      return updated;
    });
    setFormError(null);
    InteractionManager.runAfterInteractions(() => scrollToSection(next));
  };

  const reopenSection = (key: SectionKey) => {
    const order: SectionKey[] = ['brand', 'class', 'model', 'details', 'compliance'];
    const idx = order.indexOf(key);
    setSections((prev) => {
      const updated = { ...prev };
      updated[key] = 'expanded';
      // Hide everything after this section
      for (let i = idx + 1; i < order.length; i++) {
        updated[order[i]] = 'hidden';
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

  // ── Submit ──
  const handleSubmit = async () => {
    // Validate date formats
    const dateFields: (keyof FormData)[] = ['coeExpiry', 'roadTaxExpiry', 'insuranceExpiry', 'inspectionDue'];
    for (const field of dateFields) {
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
      ...(data.coeExpiry && { coeExpiry: data.coeExpiry }),
      ...(data.roadTaxExpiry && { roadTaxExpiry: data.roadTaxExpiry }),
      ...(data.insuranceExpiry && { insuranceExpiry: data.insuranceExpiry }),
      ...(data.inspectionDue && { inspectionDue: data.inspectionDue }),
    };

    try {
      const bike = await createBike.mutateAsync(input);
      setActiveBikeId(bike.id);
      router.back();
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to add machine');
    }
  };

  // ── Derived display values ──
  const machineName = selectedCatalogEntry
    ? `${selectedCatalogEntry.make} ${selectedCatalogEntry.model}`
    : isOthers
      ? `${data.brand} ${data.model}`.trim()
      : `${data.brand} ${data.model}`.trim();

  const machineSubtitle = [
    data.class ? `Class ${data.class}` : null,
    selectedCatalogEntry?.bikeType,
    data.year || null,
  ].filter(Boolean).join(' \u2022 ');

  // Show CTA when details or compliance is expanded
  const showCTA = sections.details === 'expanded' || sections.compliance === 'expanded';
  const isComplianceStep = sections.compliance === 'expanded';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View className="px-lg pt-lg pb-md flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
          </TouchableOpacity>
          <View className="ml-sm">
            <Text className="text-xs font-sans-bold text-yellow tracking-widest uppercase">
              New Machine
            </Text>
            <Text className="font-sans-xbold text-charcoal text-xl">Add to Garage</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ═══ BRAND ═══ */}
          <View
            onLayout={handleSectionLayout('brand')}
            className="mb-xl"
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

          {/* ═══ LICENSE CLASS ═══ */}
          {sections.class !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('class')}
              className="mb-xl"
            >
              <SectionLabel>License Class</SectionLabel>

              {sections.class === 'expanded' && (
                <FadeIn>
                  <Text className="text-sm font-sans-medium text-sand mb-md">
                    What class is your license?
                  </Text>
                  <View className="flex-row gap-md">
                    {BIKE_CLASSES.map((cls) => (
                      <TouchableOpacity
                        key={cls}
                        className={`flex-1 rounded-xl py-lg items-center gap-xs ${
                          data.class === cls ? 'bg-charcoal' : 'bg-surface-low'
                        }`}
                        onPress={() => handleSelectClass(cls)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Class ${cls}`}
                      >
                        <Text className={`font-sans-xbold text-lg ${data.class === cls ? 'text-white' : 'text-charcoal'}`}>
                          {cls}
                        </Text>
                        <Text className={`text-xs font-sans-bold uppercase tracking-widest ${data.class === cls ? 'text-white opacity-70' : 'text-sand'}`}>
                          {CLASS_LABELS[cls]}
                        </Text>
                      </TouchableOpacity>
                    ))}
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

          {/* ═══ MODEL ═══ */}
          {sections.model !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('model')}
              className="mb-xl"
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
                    <View>
                      <FocusInput
                        icon="tag-outline"
                        label="Make (Brand)"
                        placeholder="e.g. Royal Enfield, CFMoto"
                        value={data.brand}
                        onChangeText={(v) => handleChange('brand', v)}
                        autoCapitalize="words"
                      />
                      <FocusInput
                        icon="motorbike"
                        label="Model"
                        placeholder="e.g. Scrambler, Street Triple"
                        value={data.model}
                        onChangeText={(v) => handleChange('model', v)}
                        autoCapitalize="words"
                      />
                      <Text className="text-xs font-sans-medium text-sand mb-md">
                        Tip: Specific models help us surface the right service intervals.
                      </Text>
                      <TouchableOpacity
                        className="bg-yellow rounded-full py-md flex-row items-center justify-center gap-sm"
                        onPress={() => {
                          if (data.model.trim().length < 2) {
                            setFormError('Please enter a model name (at least 2 characters)');
                            return;
                          }
                          collapseAndAdvance('model', 'details');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text className="text-charcoal font-sans-bold text-sm uppercase tracking-widest">Continue</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color={colors.charcoal} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Catalog model cards */
                    <View>
                      {modelsLoading ? (
                        <View className="py-xl items-center">
                          <ActivityIndicator size="small" color={colors.sand} />
                        </View>
                      ) : filteredModels.length === 0 ? (
                        <View className="bg-surface-low rounded-2xl p-xl items-center">
                          <MaterialCommunityIcons name="magnify-close" size={28} color={colors.sand} />
                          <Text className="font-sans-bold text-charcoal text-sm mt-sm">
                            No Class {data.class} models found
                          </Text>
                          <Text className="text-xs font-sans-medium text-sand mt-xs">
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
                                className={`bg-surface-low rounded-2xl p-lg flex-row items-center justify-between ${isSel ? 'border-l-4 border-yellow' : ''}`}
                                onPress={() => handleSelectCatalogEntry(entry)}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSel }}
                              >
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-sm">
                                    <Text className="font-sans-xbold text-charcoal text-lg">{entry.model}</Text>
                                    <View className="bg-charcoal rounded-full px-sm py-0.5">
                                      <Text className="font-sans-bold text-white text-xs uppercase tracking-widest">{entry.licenseClass}</Text>
                                    </View>
                                  </View>
                                  <View className="flex-row items-center gap-sm mt-xs">
                                    {entry.engineCc != null && (
                                      <>
                                        <Text className="font-sans-medium text-sand text-sm">{entry.engineCc}cc</Text>
                                        <Text className="font-sans-medium text-sand text-sm opacity-30">{'\u2022'}</Text>
                                      </>
                                    )}
                                    <Text className="font-sans-medium text-sand text-sm">{entry.bikeType}</Text>
                                  </View>
                                </View>
                                <View className="w-12 h-12 rounded-xl bg-surface items-center justify-center ml-md">
                                  <MaterialCommunityIcons name="motorbike" size={24} color={isSel ? colors.yellow : colors.sand} />
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
                  <View className="flex-row items-center gap-md">
                    <View className="w-10 h-10 rounded-lg bg-surface items-center justify-center">
                      <MaterialCommunityIcons name="motorbike" size={20} color={colors.yellow} />
                    </View>
                    <View>
                      <Text className="font-sans-bold text-charcoal text-sm">
                        {selectedCatalogEntry?.model ?? data.model}
                      </Text>
                      <Text className="text-xs font-sans-medium text-sand">
                        {selectedCatalogEntry
                          ? `${selectedCatalogEntry.engineCc ?? ''}cc \u2022 ${selectedCatalogEntry.bikeType}`
                          : isOthers && data.brand
                            ? data.brand
                            : ''}
                      </Text>
                    </View>
                  </View>
                </SummaryPill>
              )}
            </View>
          )}

          {/* ═══ DETAILS ═══ */}
          {sections.details !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('details')}
              className="mb-xl"
            >
              <SectionLabel>Details</SectionLabel>

              {sections.details === 'expanded' && (
                <FadeIn>
                  <FocusInput
                    icon="calendar-blank-outline"
                    label="Year of Manufacture"
                    placeholder="e.g. 2022"
                    keyboardType="number-pad"
                    value={data.year}
                    onChangeText={(v) => handleChange('year', v)}
                  />
                  <FocusInput
                    icon="card-text-outline"
                    label="Plate Number"
                    placeholder="e.g. SBA1234A"
                    autoCapitalize="characters"
                    value={data.plateNumber}
                    onChangeText={(v) => handleChange('plateNumber', v)}
                  />
                  <FocusInput
                    icon="speedometer"
                    label="Current Mileage (km)"
                    placeholder="e.g. 12000"
                    keyboardType="number-pad"
                    value={data.currentMileage}
                    onChangeText={(v) => handleChange('currentMileage', v)}
                  />
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

          {/* ═══ COMPLIANCE DATES ═══ */}
          {sections.compliance !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('compliance')}
              className="mb-xl"
            >
              <SectionLabel trailing="Optional">Compliance Dates</SectionLabel>

              {sections.compliance === 'expanded' && (
                <FadeIn>
                  <Text className="text-sm font-sans-medium text-sand mb-lg">
                    You can add or update these later.
                  </Text>
                  <FocusInput label="COE Expiry" trailingIcon="calendar-outline" placeholder="YYYY-MM-DD" value={data.coeExpiry} onChangeText={(v) => handleChange('coeExpiry', v)} keyboardType="numbers-and-punctuation" />
                  <FocusInput label="Road Tax Expiry" trailingIcon="calendar-outline" placeholder="YYYY-MM-DD" value={data.roadTaxExpiry} onChangeText={(v) => handleChange('roadTaxExpiry', v)} keyboardType="numbers-and-punctuation" />
                  <FocusInput label="Insurance Expiry" trailingIcon="calendar-outline" placeholder="YYYY-MM-DD" value={data.insuranceExpiry} onChangeText={(v) => handleChange('insuranceExpiry', v)} keyboardType="numbers-and-punctuation" />
                  <FocusInput label="Inspection Due" trailingIcon="calendar-outline" placeholder="YYYY-MM-DD" value={data.inspectionDue} onChangeText={(v) => handleChange('inspectionDue', v)} keyboardType="numbers-and-punctuation" />

                  {/* Machine summary */}
                  {machineName.trim().length > 0 && (
                    <View className="bg-surface-low rounded-2xl p-lg mt-sm overflow-hidden">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Your Machine</Text>
                          <Text className="font-sans-xbold text-charcoal text-xl">{machineName}</Text>
                          {machineSubtitle.length > 0 && (
                            <Text className="font-sans-medium text-sand text-sm mt-xs">{machineSubtitle}</Text>
                          )}
                          {data.plateNumber && (
                            <Text className="font-sans-medium text-sand text-xs mt-xs">
                              {data.plateNumber.toUpperCase()} {'\u2022'} {Number(data.currentMileage).toLocaleString()} km
                            </Text>
                          )}
                        </View>
                        <View className="w-14 h-14 bg-surface rounded-2xl items-center justify-center ml-md">
                          <MaterialCommunityIcons name="motorbike" size={28} color={colors.charcoal} />
                        </View>
                      </View>
                    </View>
                  )}
                </FadeIn>
              )}
            </View>
          )}

          {/* Error */}
          {formError && (
            <View className="bg-danger-surface rounded-xl px-md py-sm flex-row items-center gap-sm mb-lg">
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text className="text-sm text-danger font-sans-medium flex-1">{formError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed bottom CTA */}
        {showCTA && (
          <View className="absolute bottom-0 left-0 right-0 px-lg pb-xl pt-md bg-surface">
            <TouchableOpacity
              className="bg-yellow rounded-full py-md flex-row items-center justify-center gap-sm"
              onPress={isComplianceStep ? handleSubmit : handleDetailsContinue}
              disabled={createBike.isPending}
              activeOpacity={0.8}
            >
              <Text className="text-charcoal font-sans-bold text-sm uppercase tracking-widest">
                {isComplianceStep
                  ? (createBike.isPending ? 'Adding...' : 'Add Machine')
                  : 'Continue'}
              </Text>
              <MaterialCommunityIcons
                name={isComplianceStep ? 'check' : 'arrow-right'}
                size={18}
                color={colors.charcoal}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
