import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView,
  ActivityIndicator, LayoutChangeEvent,
  InteractionManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateBike } from '../lib/api/use-bikes';
import { useBikeCatalogMakes, useBikeCatalogModels } from '../lib/api/use-bike-catalog';
import { useBikeStore } from '../lib/store/bike-store';
import type { BikeClass, BikeCatalogEntry, CreateBikeInput } from '../lib/types/bike';
import { colors } from '../lib/colors';
import { TOP_BRANDS, getDisplayBrands } from '../lib/brand-picker';
import { FadeIn } from '../components/ui/fade-in';
import { ModalFormScreen } from '../components/ui/modal-form-screen';
import { PrimaryButton } from '../components/ui/primary-button';
import { SummaryPill } from '../components/ui/summary-pill';
import { TextField } from '../components/ui/text-field';
import { DateField } from '../components/ui/date-field';

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
    <View className="flex-row items-center justify-between mb-md">
      <Text className="font-sans-bold text-xxs text-muted uppercase tracking-wide-1">{children}</Text>
      {trailing && <Text className="text-xs font-sans-medium text-muted">{trailing}</Text>}
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
      <Text className="text-xs font-sans-bold text-muted uppercase tracking-widest mb-sm">
        Popular
      </Text>

      {isLoading ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={colors.muted} />
          <Text className="text-sm font-sans-medium text-muted mt-sm">Loading brands...</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-sm mb-md">
          {displayBrands.map((brand) => (
            <TouchableOpacity
              key={brand}
              className={`rounded-2xl px-lg py-md items-center justify-center border-2 ${
                selected === brand && !isOthers
                  ? 'bg-ink border-ink'
                  : 'bg-bg-2 border-transparent'
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
                  selected === brand && !isOthers ? 'text-white' : 'text-ink'
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
                isOthers ? 'bg-ink border-ink' : 'bg-bg-2 border-transparent'
              }`}
              style={{ minWidth: 90 }}
              onPress={onSelectOthers}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isOthers }}
              accessibilityLabel="Others"
            >
              <Text className={`font-sans-bold text-sm ${isOthers ? 'text-white' : 'text-ink'}`}>
                Others
              </Text>
            </TouchableOpacity>
          )}

          {/* 0 results state */}
          {isSearching && displayBrands.length === 0 && (
            <Text className="text-sm font-sans-medium text-muted px-xs">
              No brands found. Clear the search to add your brand manually.
            </Text>
          )}
        </View>
      )}

      {/* Separator label */}
      <View className="items-center mb-md mt-xs">
        <Text className="text-xs font-sans-bold text-muted uppercase tracking-widest">
          or search all brands
        </Text>
      </View>

      {/* Search */}
      <TextField
        placeholder="Search brands (e.g. Harley, CFMoto)"
        value={search}
        onChangeText={setSearch}
        inputClassName="text-base"
      />
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────
export default function AddMotorcycleScreen() {
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

  // Show CTA when details or compliance is expanded
  const showCTA = sections.details === 'expanded' || sections.compliance === 'expanded';
  const isComplianceStep = sections.compliance === 'expanded';

  const ctaLabel = isComplianceStep
    ? (createBike.isPending ? 'Adding...' : 'Add Motorcycle')
    : 'Continue';
  const ctaIcon = isComplianceStep ? 'check' : 'arrow-right';

  return (
    <ModalFormScreen
      ref={scrollRef}
      onClose={() => router.back()}
      label="New Motorcycle"
      title="Add to Garage"
      cta={showCTA ? { label: ctaLabel, icon: ctaIcon, onPress: isComplianceStep ? handleSubmit : handleDetailsContinue, disabled: createBike.isPending } : undefined}
      error={formError}
    >
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

          {sections.class !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('class')}
              className="mb-xl"
            >
              <SectionLabel>License Class</SectionLabel>

              {sections.class === 'expanded' && (
                <FadeIn>
                  <Text className="text-sm font-sans-medium text-muted mb-md">
                    What class is your license?
                  </Text>
                  <View className="flex-row gap-md">
                    {BIKE_CLASSES.map((cls) => (
                      <TouchableOpacity
                        key={cls}
                        className={`flex-1 rounded-xl py-lg items-center gap-xs ${
                          data.class === cls ? 'bg-ink' : 'bg-bg-2'
                        }`}
                        onPress={() => handleSelectClass(cls)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Class ${cls}`}
                      >
                        <Text className={`font-sans-xbold text-lg ${data.class === cls ? 'text-white' : 'text-ink'}`}>
                          {cls}
                        </Text>
                        <Text className={`text-xs font-sans-bold uppercase tracking-widest ${data.class === cls ? 'text-white opacity-70' : 'text-muted'}`}>
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
                      <TextField
                        icon="tag-outline"
                        label="Make (Brand)"
                        placeholder="e.g. Royal Enfield, CFMoto"
                        value={data.brand}
                        onChangeText={(v) => handleChange('brand', v)}
                        autoCapitalize="words"
                        className="mb-lg"
                      />
                      <TextField
                        icon="motorbike"
                        label="Model"
                        placeholder="e.g. Scrambler, Street Triple"
                        value={data.model}
                        onChangeText={(v) => handleChange('model', v)}
                        autoCapitalize="words"
                        className="mb-lg"
                      />
                      <Text className="text-xs font-sans-medium text-muted mb-md">
                        Tip: Specific models help us surface the right service intervals.
                      </Text>
                      <PrimaryButton
                        variant="accent"
                        label="Continue"
                        icon="arrowRight"
                        onPress={() => {
                          if (data.model.trim().length < 2) {
                            setFormError('Please enter a model name (at least 2 characters)');
                            return;
                          }
                          collapseAndAdvance('model', 'details');
                        }}
                      />
                    </View>
                  ) : (
                    /* Catalog model cards */
                    <View>
                      {modelsLoading ? (
                        <View className="py-xl items-center">
                          <ActivityIndicator size="small" color={colors.muted} />
                        </View>
                      ) : filteredModels.length === 0 ? (
                        <View className="bg-bg-2 rounded-2xl p-xl items-center">
                          <MaterialCommunityIcons name="magnify-close" size={28} color={colors.muted} />
                          <Text className="font-sans-bold text-ink text-sm mt-sm">
                            No Class {data.class} models found
                          </Text>
                          <Text className="text-xs font-sans-medium text-muted mt-xs">
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
                                className={`bg-bg-2 rounded-2xl p-lg flex-row items-center justify-between ${isSel ? 'border-l-4 border-yellow' : ''}`}
                                onPress={() => handleSelectCatalogEntry(entry)}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSel }}
                              >
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-sm">
                                    <Text className="font-sans-xbold text-ink text-lg">{entry.model}</Text>
                                    <View className="bg-ink rounded-full px-sm py-0.5">
                                      <Text className="font-sans-bold text-white text-xs uppercase tracking-widest">{entry.licenseClass}</Text>
                                    </View>
                                  </View>
                                  <View className="flex-row items-center gap-sm mt-xs">
                                    {entry.engineCc != null && (
                                      <>
                                        <Text className="font-sans-medium text-muted text-sm">{entry.engineCc}cc</Text>
                                        <Text className="font-sans-medium text-muted text-sm opacity-30">{'\u2022'}</Text>
                                      </>
                                    )}
                                    <Text className="font-sans-medium text-muted text-sm">{entry.bikeType}</Text>
                                  </View>
                                </View>
                                <View className="w-12 h-12 rounded-xl bg-surface items-center justify-center ml-md">
                                  <MaterialCommunityIcons name="motorbike" size={24} color={isSel ? colors.yellow : colors.muted} />
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
                    <Text className="font-sans-bold text-ink text-sm">
                      {selectedCatalogEntry?.model ?? data.model}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted">
                      {selectedCatalogEntry
                        ? `${selectedCatalogEntry.engineCc ?? ''}cc \u2022 ${selectedCatalogEntry.bikeType}`
                        : isOthers && data.brand
                          ? data.brand
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
              className="mb-xl"
            >
              <SectionLabel>Details</SectionLabel>

              {sections.details === 'expanded' && (
                <FadeIn>
                  <TextField
                    icon="calendar-blank-outline"
                    label="Year of Manufacture"
                    placeholder="e.g. 2022"
                    keyboardType="number-pad"
                    value={data.year}
                    onChangeText={(v) => handleChange('year', v)}
                    className="mb-lg"
                  />
                  <TextField
                    icon="card-text-outline"
                    label="Plate Number"
                    placeholder="e.g. SBA1234A"
                    autoCapitalize="characters"
                    value={data.plateNumber}
                    onChangeText={(v) => handleChange('plateNumber', v)}
                    className="mb-lg"
                  />
                  <TextField
                    icon="speedometer"
                    label="Current Mileage (km)"
                    placeholder="e.g. 12000"
                    keyboardType="number-pad"
                    value={data.currentMileage}
                    onChangeText={(v) => handleChange('currentMileage', v)}
                    className="mb-lg"
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

          {sections.compliance !== 'hidden' && (
            <View
              onLayout={handleSectionLayout('compliance')}
              className="mb-xl"
            >
              <SectionLabel trailing="Optional">Compliance Dates</SectionLabel>

              {sections.compliance === 'expanded' && (
                <FadeIn>
                  <Text className="text-sm font-sans-medium text-muted mb-lg">
                    {"Enter 2 dates and we'll calculate the rest."}
                  </Text>
                  <DateField label="Registration Date" value={data.registrationDate} onChange={(v) => handleChange('registrationDate', v)} className="mb-lg" />
                  <DateField label="Insurance Expiry" value={data.insuranceExpiry} onChange={(v) => handleChange('insuranceExpiry', v)} className="mb-lg" />

                  {/* Auto-calculated dates */}
                  {(hasRegistrationDate || hasInsuranceExpiry) && (
                    <View className="bg-bg-2 rounded-2xl p-lg mt-sm mb-lg">
                      <Text className="text-xxs font-sans-bold text-muted uppercase tracking-wide-1 mb-md">
                        Auto-calculated
                      </Text>
                      {hasRegistrationDate && (
                        <>
                          <View className="flex-row items-center justify-between mb-sm">
                            <View className="flex-row items-center gap-sm">
                              <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.muted} />
                              <Text className="font-sans-medium text-muted text-sm">COE Expiry</Text>
                            </View>
                            <Text className="font-sans-bold text-ink text-sm">{formatDisplayDate(derivedCoeExpiry)}</Text>
                          </View>
                          <View className="flex-row items-center justify-between mb-sm">
                            <View className="flex-row items-center gap-sm">
                              <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={colors.muted} />
                              <Text className="font-sans-medium text-muted text-sm">Inspection Due</Text>
                            </View>
                            <Text className="font-sans-bold text-ink text-sm">{formatDisplayDate(derivedInspectionDue)}</Text>
                          </View>
                        </>
                      )}
                      {hasInsuranceExpiry && (
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-sm">
                            <MaterialCommunityIcons name="shield-car" size={16} color={colors.muted} />
                            <Text className="font-sans-medium text-muted text-sm">Road Tax Expiry</Text>
                          </View>
                          <Text className="font-sans-bold text-ink text-sm">{formatDisplayDate(derivedRoadTaxExpiry)}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Motorcycle summary */}
                  {motorcycleName.trim().length > 0 && (
                    <View className="bg-bg-2 rounded-2xl p-lg mt-sm overflow-hidden">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-xs font-sans-bold text-muted uppercase tracking-widest mb-xs">Your Motorcycle</Text>
                          <Text className="font-sans-xbold text-ink text-xl">{motorcycleName}</Text>
                          {motorcycleSubtitle.length > 0 && (
                            <Text className="font-sans-medium text-muted text-sm mt-xs">{motorcycleSubtitle}</Text>
                          )}
                          {data.plateNumber && (
                            <Text className="font-sans-medium text-muted text-xs mt-xs">
                              {data.plateNumber.toUpperCase()} {'\u2022'} {Number(data.currentMileage).toLocaleString()} km
                            </Text>
                          )}
                        </View>
                        <View className="w-14 h-14 bg-surface rounded-2xl items-center justify-center ml-md">
                          <MaterialCommunityIcons name="motorbike" size={28} color={colors.ink} />
                        </View>
                      </View>
                    </View>
                  )}
                </FadeIn>
              )}
            </View>
          )}

    </ModalFormScreen>
  );
}
