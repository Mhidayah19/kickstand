import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateBike } from '../../../lib/api/use-bikes';
import { useBikeCatalogMakes, useBikeCatalogModels } from '../../../lib/api/use-bike-catalog';
import { useBikeStore } from '../../../lib/store/bike-store';
import type { BikeClass, BikeCatalogEntry, CreateBikeInput } from '../../../lib/types/bike';

import { colors } from '../../../lib/colors';

const PLACEHOLDER_COLOR = colors.outline;

// ── Constants ───────────────────────────────────────────────────
const BIKE_CLASSES: BikeClass[] = ['2B', '2A', '2'];
const TOTAL_STEPS = 4;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

// ── Step header ─────────────────────────────────────────────────
function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  const labels = ['Select Brand', 'Select Model', 'Details', 'Compliance Dates'];
  const stepLabels = ['STEP 01', 'STEP 02', 'STEP 03', 'STEP 04'];

  return (
    <View className="flex-row items-center justify-between mb-2xl">
      <TouchableOpacity
        onPress={onBack}
        className="w-11 h-11 items-center justify-center"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.charcoal} />
      </TouchableOpacity>
      <View className="flex-1 ml-sm">
        <Text className="text-xs font-sans-bold text-yellow tracking-widest uppercase">{stepLabels[step]}</Text>
        <Text className="font-sans-bold text-charcoal text-xl">{labels[step]}</Text>
      </View>
    </View>
  );
}

// ── Step 0: Brand ───────────────────────────────────────────────
function StepBrand({
  selected,
  isOthers,
  onSelect,
  onSelectOthers,
}: {
  selected: string;
  isOthers: boolean;
  onSelect: (brand: string) => void;
  onSelectOthers: () => void;
}) {
  const [search, setSearch] = useState('');
  const { data: makes, isLoading } = useBikeCatalogMakes();

  const filtered = (makes ?? []).filter((b) =>
    b.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View>
      <TextInput
        className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal mb-md"
        placeholder="Search brands (e.g. Ducati, Triumph)"
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={colors.sand} />
          <Text className="text-sm font-sans-medium text-sand mt-sm">Loading brands...</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-sm">
          {filtered.map((brand) => (
            <TouchableOpacity
              key={brand}
              className={`rounded-2xl px-lg py-md items-center justify-center border-2 ${
                selected === brand && !isOthers ? 'bg-charcoal border-charcoal' : 'bg-surface-low border-transparent'
              }`}
              style={{ minWidth: 90 }}
              onPress={() => onSelect(brand)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === brand && !isOthers }}
              accessibilityLabel={brand}
            >
              <Text className={`font-sans-bold text-sm ${selected === brand && !isOthers ? 'text-white' : 'text-charcoal'}`}>
                {brand}
              </Text>
            </TouchableOpacity>
          ))}

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
        </View>
      )}
    </View>
  );
}

// ── Step 1: Model picker ────────────────────────────────────────
function StepModelCatalog({
  brand,
  selectedEntry,
  onSelect,
}: {
  brand: string;
  selectedEntry: BikeCatalogEntry | null;
  onSelect: (entry: BikeCatalogEntry) => void;
}) {
  const { data: models, isLoading } = useBikeCatalogModels(brand);

  if (isLoading) {
    return (
      <View className="py-xl items-center">
        <ActivityIndicator size="small" color={colors.sand} />
        <Text className="text-sm font-sans-medium text-sand mt-sm">Loading models...</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="bg-surface-low rounded-xl px-md py-xs mb-md flex-row items-center gap-xs">
        <Text className="font-sans-bold text-charcoal text-sm">{brand}</Text>
        <Text className="font-sans-medium text-sand text-sm">— select a model</Text>
      </View>

      <View className="gap-sm">
        {(models ?? []).map((entry) => {
          const isSelected = selectedEntry?.id === entry.id;
          return (
            <TouchableOpacity
              key={entry.id}
              className={`bg-surface-low rounded-2xl p-md ${isSelected ? 'border-l-4 border-yellow' : ''}`}
              onPress={() => onSelect(entry)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${entry.model} ${entry.engineCc ? `${entry.engineCc}cc` : ''}`}
            >
              <Text className="font-sans-bold text-charcoal text-base">{entry.model}</Text>
              <View className="flex-row items-center gap-sm mt-xs">
                {entry.engineCc != null && (
                  <Text className="font-sans-medium text-sand text-sm">{entry.engineCc}cc</Text>
                )}
                <View className="bg-charcoal rounded-lg px-sm py-xxs">
                  <Text className="font-sans-bold text-white text-xs">{entry.licenseClass}</Text>
                </View>
                <Text className="font-sans-medium text-sand text-sm">{entry.bikeType}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepModelOthers({
  brand,
  model,
  onChangeBrand,
  onChangeModel,
}: {
  brand: string;
  model: string;
  onChangeBrand: (v: string) => void;
  onChangeModel: (v: string) => void;
}) {
  return (
    <View className="gap-md">
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Make (Brand)</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
          placeholder="e.g. Royal Enfield, CFMoto"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={brand}
          onChangeText={onChangeBrand}
          autoCapitalize="words"
        />
      </View>
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Model</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
          placeholder="e.g. Scrambler, Street Triple"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={model}
          onChangeText={onChangeModel}
          autoCapitalize="words"
        />
      </View>
      <Text className="text-xs font-sans-medium text-sand">
        Tip: Specific models help us surface the right service intervals and parts.
      </Text>
    </View>
  );
}

// ── Step 2: Details ─────────────────────────────────────────────
function StepDetails({
  data,
  onChange,
  isClassLocked,
}: {
  data: Pick<FormData, 'year' | 'class' | 'plateNumber' | 'currentMileage'>;
  onChange: (field: keyof FormData, value: string) => void;
  isClassLocked: boolean;
}) {
  return (
    <View className="gap-md">
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Year</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
          placeholder="e.g. 2022"
          placeholderTextColor={PLACEHOLDER_COLOR}
          keyboardType="number-pad"
          value={data.year}
          onChangeText={(v) => onChange('year', v)}
        />
      </View>
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Class</Text>
        <View className="flex-row gap-sm">
          {BIKE_CLASSES.map((c) => {
            const isSelected = data.class === c;
            return (
              <TouchableOpacity
                key={c}
                className={`flex-1 rounded-xl py-sm items-center border-2 ${
                  isSelected ? 'bg-charcoal border-charcoal' : 'bg-surface-low border-transparent'
                } ${isClassLocked ? 'opacity-60' : ''}`}
                onPress={() => { if (!isClassLocked) onChange('class', c); }}
                activeOpacity={isClassLocked ? 1 : 0.8}
                disabled={isClassLocked}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: isClassLocked }}
                accessibilityLabel={`Class ${c}`}
              >
                <Text className={`font-sans-bold ${isSelected ? 'text-white' : 'text-charcoal'}`}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {isClassLocked && (
          <Text className="text-xs font-sans-medium text-sand mt-xs">
            Auto-filled from catalog selection
          </Text>
        )}
      </View>
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Plate Number</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
          placeholder="e.g. SBA1234A"
          placeholderTextColor={PLACEHOLDER_COLOR}
          autoCapitalize="characters"
          value={data.plateNumber}
          onChangeText={(v) => onChange('plateNumber', v)}
        />
      </View>
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Current Mileage (km)</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
          placeholder="e.g. 12000"
          placeholderTextColor={PLACEHOLDER_COLOR}
          keyboardType="number-pad"
          value={data.currentMileage}
          onChangeText={(v) => onChange('currentMileage', v)}
        />
      </View>
    </View>
  );
}

// ── Step 3: Compliance dates ────────────────────────────────────
function StepCompliance({
  data,
  onChange,
}: {
  data: Pick<FormData, 'coeExpiry' | 'roadTaxExpiry' | 'insuranceExpiry' | 'inspectionDue'>;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const fields: { key: keyof typeof data; label: string }[] = [
    { key: 'coeExpiry', label: 'COE Expiry' },
    { key: 'roadTaxExpiry', label: 'Road Tax Expiry' },
    { key: 'insuranceExpiry', label: 'Insurance Expiry' },
    { key: 'inspectionDue', label: 'Inspection Due' },
  ];

  return (
    <View className="gap-md">
      <Text className="text-xs font-sans-medium text-sand">
        All dates are optional. You can add or update them later.
      </Text>
      {fields.map(({ key, label }) => (
        <View key={key}>
          <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">{label}</Text>
          <TextInput
            className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal"
            placeholder="YYYY-MM-DD"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={data[key]}
            onChangeText={(v) => onChange(key, v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      ))}
    </View>
  );
}

// ── Validation ──────────────────────────────────────────────────
function validateStep(
  step: number,
  data: FormData,
  isOthers: boolean,
  selectedCatalogEntry: BikeCatalogEntry | null,
): string | null {
  if (step === 0) {
    if (!isOthers && !data.brand) return 'Please select a brand';
    if (isOthers) return null; // "Others" counts as a selection
  }
  if (step === 1) {
    if (isOthers) {
      if (data.model.trim().length < 2) return 'Please enter a model name (at least 2 characters)';
    } else {
      if (!selectedCatalogEntry) return 'Please select a model from the list';
    }
  }
  if (step === 2) {
    const year = parseInt(data.year, 10);
    if (!data.year || isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1)
      return 'Enter a valid year (1990\u2013present)';
    if (!data.class) return 'Please select a bike class';
    if (data.plateNumber.trim().length < 3) return 'Plate number must be at least 3 characters';
    const mileage = parseInt(data.currentMileage, 10);
    if (data.currentMileage === '' || isNaN(mileage) || mileage < 0) return 'Enter a valid mileage';
  }
  if (step === 3) {
    const dateFields: (keyof FormData)[] = ['coeExpiry', 'roadTaxExpiry', 'insuranceExpiry', 'inspectionDue'];
    for (const field of dateFields) {
      const val = data[field].trim();
      if (val.length > 0 && !DATE_REGEX.test(val)) {
        return `Invalid date format for ${field}. Use YYYY-MM-DD`;
      }
    }
  }
  return null;
}

// ── Main screen ─────────────────────────────────────────────────
export default function AddMachineScreen() {
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isOthers, setIsOthers] = useState(false);
  const [selectedCatalogEntry, setSelectedCatalogEntry] = useState<BikeCatalogEntry | null>(null);
  const [data, setData] = useState<FormData>({
    brand: '',
    model: '',
    year: '',
    class: '',
    plateNumber: '',
    currentMileage: '',
    coeExpiry: '',
    roadTaxExpiry: '',
    insuranceExpiry: '',
    inspectionDue: '',
  });

  const createBike = useCreateBike();
  const setActiveBikeId = useBikeStore((s) => s.setActiveBikeId);

  const handleChange = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSelectBrand = (brand: string) => {
    setIsOthers(false);
    setSelectedCatalogEntry(null);
    setData((prev) => ({ ...prev, brand, model: '', class: '' }));
    setFormError(null);
  };

  const handleSelectOthers = () => {
    setIsOthers(true);
    setSelectedCatalogEntry(null);
    setData((prev) => ({ ...prev, brand: '', model: '', class: '' }));
    setFormError(null);
  };

  const handleSelectCatalogEntry = (entry: BikeCatalogEntry) => {
    setSelectedCatalogEntry(entry);
    setData((prev) => ({
      ...prev,
      model: entry.model,
      class: entry.licenseClass,
    }));
    setFormError(null);
  };

  const submitBike = async () => {
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
    const bike = await createBike.mutateAsync(input);
    setActiveBikeId(bike.id);
    router.back();
  };

  const handleNext = async () => {
    const error = validateStep(step, data, isOthers, selectedCatalogEntry);
    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);

    if (step < TOTAL_STEPS - 1) {
      setStep((current) => current + 1);
      return;
    }

    try {
      await submitBike();
    } catch (err) {
      setFormError((err as Error).message ?? 'Failed to add machine');
    }
  };

  const handleBack = () => {
    if (step === 0) { router.back(); return; }
    setStep(step - 1);
    setFormError(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
          <StepHeader step={step} onBack={handleBack} />

          {/* Step progress bar */}
          <View className="flex-row gap-xs mb-xl">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={`step-${i}`}
                className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-charcoal' : 'bg-surface-low'}`}
              />
            ))}
          </View>

          {/* Step content */}
          {step === 0 && (
            <StepBrand
              selected={data.brand}
              isOthers={isOthers}
              onSelect={handleSelectBrand}
              onSelectOthers={handleSelectOthers}
            />
          )}
          {step === 1 && (
            isOthers ? (
              <StepModelOthers
                brand={data.brand}
                model={data.model}
                onChangeBrand={(v) => handleChange('brand', v)}
                onChangeModel={(v) => handleChange('model', v)}
              />
            ) : (
              <StepModelCatalog
                brand={data.brand}
                selectedEntry={selectedCatalogEntry}
                onSelect={handleSelectCatalogEntry}
              />
            )
          )}
          {step === 2 && (
            <StepDetails
              data={data}
              onChange={handleChange}
              isClassLocked={!!selectedCatalogEntry}
            />
          )}
          {step === 3 && (
            <StepCompliance data={data} onChange={handleChange} />
          )}

          {/* Error */}
          {formError ? (
            <View className="bg-danger-surface rounded-xl px-md py-sm mt-md">
              <Text className="text-sm text-danger font-sans-medium">{formError}</Text>
            </View>
          ) : null}

          {/* Next/Submit CTA */}
          <TouchableOpacity
            className="bg-yellow rounded-full py-md items-center flex-row justify-center gap-xs mt-xl"
            onPress={handleNext}
            disabled={createBike.isPending}
            activeOpacity={0.8}
          >
            <Text className="text-charcoal font-sans-bold text-base">
              {step === TOTAL_STEPS - 1
                ? (createBike.isPending ? 'Adding...' : 'Add Machine')
                : 'Next Step \u2192'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
