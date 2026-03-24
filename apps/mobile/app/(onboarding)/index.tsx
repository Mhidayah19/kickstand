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
          className={`rounded-full ${i === active ? 'w-6 h-2 bg-charcoal' : 'w-2 h-2 bg-sand'}`}
        />
      ))}
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
        Your Machine.{'\n'}Your Record.
      </Text>
      <Text className="font-sans-medium text-sand mt-sm text-base">
        Precision maintenance records for machines that matter.
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

function SlideMaintenance({
  active,
  onSkip,
  onNext,
}: {
  active: number;
  onSkip: () => void;
  onNext: () => void;
}) {
  const entries = [
    {
      label: 'PREVIOUS JOB',
      title: 'Oil & Filter Change',
      subtitle: 'Motul 7100 10W40 Full Synth',
      iconName: 'oil',
      iconBg: colors.yellow,
      iconColor: colors.charcoal,
    },
    {
      label: 'UPCOMING',
      title: 'Brake Fluid Flush',
      subtitle: 'Scheduled for 12,000mi Service',
      iconName: 'cog',
      iconBg: '#E8E0D5',
      iconColor: colors.charcoal,
    },
    {
      label: 'RECORDED TODAY',
      title: 'Valve Clearance Check',
      subtitle: 'Precision alignment verified',
      iconName: 'wrench',
      iconBg: colors.charcoal,
      iconColor: colors.yellow,
    },
  ];

  return (
    <View className="flex-1 px-lg pt-12">
      {/* Header row */}
      <View className="flex-row justify-between items-center mb-xl">
        <Text className="font-sans-bold text-charcoal text-xs tracking-widest uppercase">
          Precision Atelier
        </Text>
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip overview"
        >
          <Text className="font-sans-semibold text-charcoal text-sm uppercase tracking-widest">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Headline */}
      <Text className="font-sans-bold text-charcoal mb-sm" style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1 }}>
        Track Every{'\n'}Service.
      </Text>
      <Text className="font-sans-medium text-sand text-base mb-xl">
        From oil changes to full engine overhauls, keep your digital service record pristine.
      </Text>

      {/* Service cards */}
      <View className="gap-sm mb-xl">
        {entries.map((e) => (
          <View key={e.label} className="bg-white rounded-2xl px-md py-sm flex-row items-center gap-md">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: e.iconBg }}
            >
              <MaterialCommunityIcons name={e.iconName as any} size={18} color={e.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-1">{e.label}</Text>
              <Text className="font-sans-bold text-charcoal text-base">{e.title}</Text>
              <Text className="font-sans-medium text-sand text-sm">{e.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Dots + Next button row */}
      <View className="flex-1 justify-end">
        <View className="flex-row items-center justify-between mb-xl">
          <DotIndicator total={3} active={active} />
          <TouchableOpacity
            className="bg-charcoal rounded-full px-lg py-sm flex-row items-center gap-xs"
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-bold text-sm">Next</Text>
            <Text className="text-white font-sans-bold text-sm">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
          Precision Atelier
        </Text>
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip overview"
        >
          <Text className="font-sans-semibold text-charcoal text-sm uppercase tracking-widest">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Headline at top (matches stitch) */}
      <Text className="font-sans-bold text-charcoal" style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1 }}>
        Manage Your{'\n'}Fleet.
      </Text>
      <Text className="font-sans-medium text-sand mt-sm text-base mb-xl">
        Monitor the health and vitals of all your machines in one centralised atelier.
      </Text>

      {/* Fleet card preview */}
      <View className="bg-white rounded-2xl px-md py-md mb-xl">
        <View className="flex-row justify-between items-start mb-sm">
          <View>
            <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-1">Fleet ID: 092</Text>
            <Text className="font-sans-bold text-charcoal text-xl">NORDEN 901</Text>
          </View>
          <View className="bg-surface-low rounded-xl px-sm py-xs">
            <Text className="text-xs font-sans-bold text-charcoal uppercase tracking-widest">Optimal</Text>
          </View>
        </View>
        <View className="flex-row gap-xl">
          <View>
            <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">Last Service</Text>
            <Text className="font-sans-bold text-charcoal text-sm mt-1">11,250 mi</Text>
          </View>
          <View>
            <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">Next Due</Text>
            <Text className="font-sans-bold text-charcoal text-sm mt-1">12,000 mi</Text>
          </View>
          <View>
            <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">Location</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={colors.sand} />
              <Text className="font-sans-medium text-sand text-xs">Warehouse Dist.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dots + CTA */}
      <View className="flex-1 justify-end">
        <DotIndicator total={3} active={active} />
        <TouchableOpacity
          className="bg-charcoal rounded-full py-md items-center flex-row justify-center gap-xs mt-lg mb-xl"
          onPress={onFinish}
          activeOpacity={0.8}
        >
          <Text className="text-white font-sans-bold text-base tracking-widest uppercase">Finish</Text>
          <Text className="text-white font-sans-bold">→</Text>
        </TouchableOpacity>
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

  const goToSignUp = () => router.push('/(onboarding)/sign-up' as any);
  const goToLogin = () => router.push('/(auth)/login' as any);

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
