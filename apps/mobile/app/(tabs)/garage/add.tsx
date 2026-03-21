import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCreateBike } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import type { BikeClass } from '../../../lib/types/bike';

const PLACEHOLDER_COLOR = '#D0C5BA'; // matches TextField component

// ── Constants ───────────────────────────────────────────────────
const BRANDS = ['Ducati', 'Triumph', 'BMW', 'Honda', 'Kawasaki', 'Yamaha', 'Suzuki', 'KTM'];
const BIKE_CLASSES: BikeClass[] = ['2B', '2A', '2'];

const TOTAL_STEPS = 4;

interface FormData {
  brand: string;
  model: string;
  year: string;
  class: BikeClass | '';
  plateNumber: string;
  currentMileage: string;
  vin: string;
}

// ── Step header ─────────────────────────────────────────────────
function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  const labels = ['Select Brand', 'Model Name', 'Details', 'VIN Identification'];
  const stepLabels = ['STEP 01', 'STEP 02', 'STEP 03', 'STEP 04'];

  return (
    <View className="flex-row items-center justify-between mb-2xl">
      <TouchableOpacity
        onPress={onBack}
        className="w-11 h-11 items-center justify-center"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color="#1E1E1E" />
      </TouchableOpacity>
      <View className="flex-1 ml-sm">
        <Text className="text-xs font-sans-bold text-yellow tracking-widest uppercase">{stepLabels[step]}</Text>
        <Text className="font-sans-bold text-charcoal text-xl">{labels[step]}</Text>
      </View>
    </View>
  );
}

// ── Step 0: Brand ───────────────────────────────────────────────
function StepBrand({ selected, onSelect }: { selected: string; onSelect: (b: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = BRANDS.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <View>
      <TextInput
        className="bg-surface-low rounded-xl px-md py-sm font-sans text-charcoal mb-md"
        placeholder="Search brands (e.g. Ducati, Triumph)"
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={search}
        onChangeText={setSearch}
      />
      <View className="flex-row flex-wrap gap-sm">
        {filtered.map((brand) => (
          <TouchableOpacity
            key={brand}
            className={`rounded-2xl px-lg py-md items-center justify-center border-2 ${
              selected === brand ? 'bg-charcoal border-charcoal' : 'bg-surface-low border-transparent'
            }`}
            style={{ minWidth: 90 }}
            onPress={() => onSelect(brand)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === brand }}
            accessibilityLabel={brand}
          >
            <Text className={`font-sans-bold text-sm ${selected === brand ? 'text-white' : 'text-charcoal'}`}>
              {brand}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Step 1: Model name ──────────────────────────────────────────
function StepModel({
  brand, value, onChange,
}: { brand: string; value: string; onChange: (v: string) => void }) {
  return (
    <View>
      {brand ? (
        <View className="bg-yellow/20 rounded-xl px-md py-xs mb-md flex-row items-center gap-xs">
          <Text className="font-sans-bold text-charcoal text-sm">{brand}</Text>
          <Text className="font-sans-medium text-sand text-sm">— selected brand</Text>
        </View>
      ) : null}
      <TextInput
        className="bg-surface-low rounded-xl px-md py-sm font-sans text-charcoal"
        placeholder="Enter model (e.g. Scrambler, Street Triple)"
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={value}
        onChangeText={onChange}
        autoCapitalize="words"
      />
      <Text className="text-xs font-sans-medium text-sand mt-xs">
        Tip: Specific models help us surface the right service intervals and parts.
      </Text>
    </View>
  );
}

// ── Step 2: Details ─────────────────────────────────────────────
function StepDetails({
  data, onChange,
}: {
  data: Pick<FormData, 'year' | 'class' | 'plateNumber' | 'currentMileage'>;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <View className="gap-md">
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Year</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans text-charcoal"
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
          {BIKE_CLASSES.map((c) => (
            <TouchableOpacity
              key={c}
              className={`flex-1 rounded-xl py-sm items-center border-2 ${
                data.class === c ? 'bg-charcoal border-charcoal' : 'bg-surface-low border-transparent'
              }`}
              onPress={() => onChange('class', c)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: data.class === c }}
              accessibilityLabel={`Class ${c}`}
            >
              <Text className={`font-sans-bold ${data.class === c ? 'text-white' : 'text-charcoal'}`}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-xs">Plate Number</Text>
        <TextInput
          className="bg-surface-low rounded-xl px-md py-sm font-sans text-charcoal"
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
          className="bg-surface-low rounded-xl px-md py-sm font-sans text-charcoal"
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

// ── Step 3: VIN ─────────────────────────────────────────────────
function StepVin({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <View className="flex-row items-center gap-xs mb-xs">
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">
          Vehicle Identification Number
        </Text>
        <Text className="text-xs font-sans-medium text-sand uppercase tracking-widest">(Optional)</Text>
      </View>
      <TextInput
        className="bg-surface-low rounded-xl px-md py-sm font-sans-medium text-charcoal tracking-widest"
        placeholder="17-DIGIT ALPHA-NUMERIC"
        placeholderTextColor={PLACEHOLDER_COLOR}
        autoCapitalize="characters"
        maxLength={17}
        value={value}
        onChangeText={onChange}
      />
      <Text className="text-xs font-sans-medium text-sand mt-xs">
        Found on your registration card or frame
      </Text>

      {/* Scan placeholder — camera not implemented */}
      <TouchableOpacity
        className="mt-lg border border-outline rounded-xl py-md items-center flex-row justify-center gap-xs"
        activeOpacity={0.7}
        onPress={() => { /* camera scan — out of scope */ }}
        accessibilityLabel="Scan VIN from registration card"
      >
        <MaterialCommunityIcons name="camera-outline" size={16} color="#1E1E1E" />
        <Text className="font-sans-semibold text-charcoal text-sm">Scan VIN from Registration</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Validation ──────────────────────────────────────────────────
function validateStep(step: number, data: FormData): string | null {
  if (step === 0 && !data.brand) return 'Please select a brand';
  if (step === 1 && data.model.trim().length < 2) return 'Please enter a model name (at least 2 characters)';
  if (step === 2) {
    const year = parseInt(data.year, 10);
    if (!data.year || isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) return 'Enter a valid year (1990–present)';
    if (!data.class) return 'Please select a bike class';
    if (data.plateNumber.trim().length < 3) return 'Plate number must be at least 3 characters';
    const mileage = parseInt(data.currentMileage, 10);
    if (data.currentMileage === '' || isNaN(mileage) || mileage < 0) return 'Enter a valid mileage';
  }
  if (step === 3 && data.vin.trim().length > 0 && data.vin.trim().length !== 17) return 'VIN must be exactly 17 characters';
  return null;
}

// ── Main screen ─────────────────────────────────────────────────
export default function AddMachineScreen() {
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [data, setData] = useState<FormData>({
    brand: '', model: '', year: '', class: '', plateNumber: '', currentMileage: '', vin: '',
  });

  const createBike = useCreateBike();
  const setActiveBikeId = useBikeStore((s) => s.setActiveBikeId);

  const handleChange = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleNext = async () => {
    const error = validateStep(step, data);
    if (error) { setFormError(error); return; }
    setFormError(null);

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }

    // Final step — submit
    try {
      if (!data.class) { setFormError('Please select a bike class'); return; }
      const fullModel = data.brand ? `${data.brand} ${data.model}`.trim() : data.model;
      // Note: VIN is collected for UX but not submitted to API (schema extension deferred)
      const bike = await createBike.mutateAsync({
        model: fullModel,
        year: parseInt(data.year, 10),
        plateNumber: data.plateNumber,
        class: data.class as BikeClass,
        currentMileage: parseInt(data.currentMileage, 10),
      });
      setActiveBikeId(bike.id);
      router.back();
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
            <StepBrand selected={data.brand} onSelect={(b) => handleChange('brand', b)} />
          )}
          {step === 1 && (
            <StepModel brand={data.brand} value={data.model} onChange={(v) => handleChange('model', v)} />
          )}
          {step === 2 && (
            <StepDetails data={data} onChange={handleChange} />
          )}
          {step === 3 && (
            <StepVin value={data.vin} onChange={(v) => handleChange('vin', v)} />
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
                : 'Next Step →'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
