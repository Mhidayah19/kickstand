import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../lib/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const motorcycleImage = require('../../assets/images/motorcycle.png');

// ── Dot indicator ──────────────────────────────────────────────
function DotIndicator({ total, active }: { total: number; active: number }) {
  return (
    <View
      className="flex-row gap-xs"
      accessibilityLabel={`Slide ${active + 1} of ${total}`}
      accessibilityRole="progressbar"
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={`dot-${i}`}
          className={`rounded-full ${i === active ? 'w-8 h-2.5 bg-charcoal' : 'w-2.5 h-2.5 bg-sand'}`}
        />
      ))}
    </View>
  );
}

// ── Shared onboarding card ─────────────────────────────────────
interface OnboardingEntry {
  label: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  borderColor: string | null;
  translateX: number;
  scale: number;
  opacity: number;
  cardBg: string;
}

function OnboardingCard({ entry }: { entry: OnboardingEntry }) {
  return (
    <View
      className={`${entry.cardBg} rounded-2xl px-md py-md flex-row items-center gap-md overflow-hidden`}
      style={{
        transform: [{ translateX: entry.translateX }, { scale: entry.scale }],
        opacity: entry.opacity,
      }}
    >
      {entry.borderColor && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: entry.borderColor,
          }}
        />
      )}
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: entry.iconBg }}
      >
        <MaterialCommunityIcons name={entry.iconName as any} size={20} color={entry.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-1">{entry.label}</Text>
        <Text className={`font-sans-bold ${entry.titleColor} text-base`}>{entry.title}</Text>
        <Text className="font-sans-medium text-sand text-sm">{entry.subtitle}</Text>
      </View>
    </View>
  );
}

// ── Slides ─────────────────────────────────────────────────────
function SlideWelcome({
  active,
  onGetStarted,
  onSignIn,
}: {
  active: number;
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  return (
    <View className="flex-1 px-lg pt-12">
      {/* Hero image */}
      <View
        className="bg-charcoal rounded-3xl overflow-hidden items-center justify-center mb-xl"
        style={{ height: SCREEN_HEIGHT * 0.42 }}
      >
        <Text className="text-white font-sans-bold text-2xl tracking-widest absolute top-6 left-6">
          KICKSTAND.
        </Text>
        <Image
          source={motorcycleImage}
          style={{ width: 280, height: 200 }}
          resizeMode="contain"
          accessible={false}
        />
      </View>

      {/* Headline */}
      <Text className="font-sans-bold text-charcoal" style={{ fontSize: 36, lineHeight: 44, letterSpacing: -0.5 }}>
        Your Motorcycle.{'\n'}Your Record.
      </Text>
      <Text className="font-sans-medium text-sand mt-sm text-base">
        Precision maintenance records for motorcycles that matter.
      </Text>

      {/* Dots */}
      <View className="flex-1 justify-end mb-lg">
        <DotIndicator total={3} active={active} />
      </View>

      {/* CTAs */}
      <TouchableOpacity
        className="bg-yellow rounded-full py-md items-center flex-row justify-center gap-xs mb-md"
        onPress={onGetStarted}
        activeOpacity={0.8}
      >
        <Text className="text-charcoal font-sans-bold text-base">Get Started</Text>
        <Text className="text-charcoal font-sans-bold">→</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSignIn} activeOpacity={0.7} className="items-center mb-xl">
        <Text className="text-charcoal font-sans-semibold text-sm tracking-widest uppercase">
          Sign In to Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const MAINTENANCE_ENTRIES: OnboardingEntry[] = [
  {
    label: 'PREVIOUS JOB',
    title: 'Oil & Filter Change',
    subtitle: 'Motul 7100 10W40 Full Synth',
    iconName: 'oil',
    iconBg: colors.yellow,
    iconColor: colors.charcoal,
    titleColor: 'text-charcoal',
    borderColor: colors.yellow,
    translateX: 16,
    scale: 1,
    opacity: 1,
    cardBg: 'bg-white',
  },
  {
    label: 'UPCOMING',
    title: 'Brake Fluid Flush',
    subtitle: 'Scheduled for 12,000mi Service',
    iconName: 'cog',
    iconBg: '#E8E0D5',
    iconColor: colors.charcoal,
    titleColor: 'text-charcoal',
    borderColor: null,
    translateX: 0,
    scale: 0.95,
    opacity: 0.8,
    cardBg: 'bg-surface-low',
  },
  {
    label: 'RECORDED TODAY',
    title: 'Valve Clearance Check',
    subtitle: 'Precision alignment verified',
    iconName: 'wrench',
    iconBg: colors.charcoal,
    iconColor: colors.yellow,
    titleColor: 'text-charcoal',
    borderColor: colors.charcoal,
    translateX: 8,
    scale: 1,
    opacity: 1,
    cardBg: 'bg-white',
  },
];

function SlideMaintenance({
  active,
  onSkip,
  onNext,
}: {
  active: number;
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <View className="flex-1 px-lg pt-12">
      {/* Header row */}
      <View className="flex-row justify-between items-center mb-xl">
        <Text className="font-sans-bold text-charcoal text-xs tracking-widest uppercase">
          Kickstand
        </Text>
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip overview"
        >
          <Text className="font-sans-semibold text-charcoal text-sm uppercase tracking-widest">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Service cards — visual hero first */}
      <View className="gap-sm mb-xl">
        {MAINTENANCE_ENTRIES.map((e) => (
          <OnboardingCard key={e.label} entry={e} />
        ))}
      </View>

      {/* Headline copy */}
      <Text className="font-sans-bold text-charcoal mb-sm" style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1 }}>
        Track Every{'\n'}<Text style={{ color: colors.yellow }}>Service.</Text>
      </Text>
      <Text className="font-sans-medium text-sand text-base">
        From oil changes to full engine overhauls, keep your digital service record pristine.
      </Text>

      {/* Dots + Next button row */}
      <View className="flex-1 justify-end">
        <View className="flex-row items-center justify-between mb-xl">
          <DotIndicator total={3} active={active} />
          <TouchableOpacity
            className="bg-charcoal rounded-full px-xl py-md flex-row items-center gap-xs"
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-bold text-base">Next</Text>
            <Text className="text-white font-sans-bold text-base">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const FLEET_ENTRIES: OnboardingEntry[] = [
  {
    label: 'Honda CB400X',
    title: 'Ready to Ride',
    subtitle: '8,420 km · Last serviced 2 weeks ago',
    iconName: 'motorbike',
    iconBg: colors.yellow,
    iconColor: colors.charcoal,
    titleColor: 'text-charcoal',
    borderColor: colors.yellow,
    translateX: 16,
    scale: 1,
    opacity: 1,
    cardBg: 'bg-white',
  },
  {
    label: 'Yamaha MT-15',
    title: 'Next Service in 800 km',
    subtitle: '3,200 km · Routine check upcoming',
    iconName: 'motorbike',
    iconBg: '#E8E0D5',
    iconColor: colors.charcoal,
    titleColor: 'text-charcoal',
    borderColor: null,
    translateX: 0,
    scale: 0.95,
    opacity: 0.8,
    cardBg: 'bg-surface-low',
  },
  {
    label: 'Royal Enfield Meteor 350',
    title: 'Insurance Expired',
    subtitle: '1,050 km · Needs attention',
    iconName: 'motorbike',
    iconBg: colors.charcoal,
    iconColor: colors.danger,
    titleColor: 'text-danger',
    borderColor: colors.danger,
    translateX: 8,
    scale: 1,
    opacity: 1,
    cardBg: 'bg-white',
  },
];

function SlideFleet({
  active,
  onFinish,
  onSkip,
}: {
  active: number;
  onFinish: () => void;
  onSkip: () => void;
}) {
  return (
    <View className="flex-1 px-lg pt-12">
      {/* Header row */}
      <View className="flex-row justify-between items-center mb-xl">
        <Text className="font-sans-bold text-charcoal text-xs tracking-widest uppercase">
          Kickstand
        </Text>
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip overview"
        >
          <Text className="font-sans-semibold text-charcoal text-sm uppercase tracking-widest">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Fleet cards — visual hero first */}
      <View className="gap-sm mb-xl">
        {FLEET_ENTRIES.map((e) => (
          <OnboardingCard key={e.label} entry={e} />
        ))}
      </View>

      {/* Headline copy */}
      <Text className="font-sans-bold text-charcoal mb-sm" style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1 }}>
        Every Motorcycle.{'\n'}One <Text style={{ color: colors.yellow }}>Garage.</Text>
      </Text>
      <Text className="font-sans-medium text-sand text-base">
        Track status, mileage, and compliance across your entire fleet at a glance.
      </Text>

      {/* Dots + Finish button */}
      <View className="flex-1 justify-end">
        <View className="flex-row items-center justify-between mb-xl">
          <DotIndicator total={3} active={active} />
          <TouchableOpacity
            className="bg-charcoal rounded-full px-xl py-md flex-row items-center gap-xs"
            onPress={onFinish}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-bold text-base">Finish</Text>
            <Text className="text-white font-sans-bold text-base">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Main carousel ──────────────────────────────────────────────
export default function OnboardingCarousel() {
  const [slide, setSlide] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  const goToSlide = (n: number) => {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSlide(n);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const goToSignUp = () => router.push('/(onboarding)/sign-up');
  const goToLogin = () => router.push('/(auth)/login');

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <Animated.View style={{ flex: 1, opacity }}>
        {slide === 0 && (
          <SlideWelcome
            active={slide}
            onGetStarted={() => goToSlide(1)}
            onSignIn={goToLogin}
          />
        )}
        {slide === 1 && (
          <SlideMaintenance
            active={slide}
            onSkip={goToSignUp}
            onNext={() => goToSlide(2)}
          />
        )}
        {slide === 2 && (
          <SlideFleet
            active={slide}
            onFinish={goToSignUp}
            onSkip={goToSignUp}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
