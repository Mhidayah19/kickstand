import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../lib/colors';
import { useBike } from '../lib/api/use-bikes';
import { useBikeStore } from '../lib/store/bike-store';
import { formatBikeLabel } from '../lib/format-bike-label';
import { ScreenHeader } from '../components/ui/screen-header';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MethodCardProps {
  variant: 'primary' | 'secondary';
  icon: IconName;
  title: string;
  description: string;
  eyebrow?: string;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
}

function MethodCard({ variant, icon, title, description, eyebrow, onPress, testID, accessibilityLabel }: MethodCardProps) {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? 'bg-charcoal' : 'bg-sand/10';
  const iconColor = isPrimary ? colors.yellow : colors.charcoal;
  const titleClass = isPrimary ? 'text-surface-card' : 'text-charcoal';
  const descClass = isPrimary ? 'text-sand' : 'text-charcoal/55';

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`rounded-3xl ${bg} p-lg mb-md active:opacity-85`}
    >
      <View className="flex-row items-start gap-md">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-sand/20">
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`font-sans-xbold text-lg ${titleClass}`}>{title}</Text>
          <Text className={`font-sans-medium text-sm mt-0.5 leading-snug ${descClass}`}>{description}</Text>
          {eyebrow && (
            <Text className="font-sans-bold text-[10px] tracking-atelier uppercase text-yellow mt-md">
              {eyebrow}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function LogMethodScreen() {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams<{ serviceType?: string }>();
  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  const bikeLabel = bike ? formatBikeLabel(bike) : undefined;

  const handleScan = () => router.replace('/scan-receipt');
  const handleManual = () => {
    const target: Href = serviceType
      ? { pathname: '/add-service', params: { serviceType } }
      : '/add-service';
    router.replace(target);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-lg pt-3xl">
        <ScreenHeader
          title="New service log"
          subtitle={bikeLabel}
          size="md"
          rightAction={
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={8}
              className="w-10 h-10 rounded-full bg-sand/20 items-center justify-center active:opacity-70"
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.charcoal} />
            </TouchableOpacity>
          }
        />
      </View>

      <View className="flex-1 px-lg">
        <Text className="font-sans-bold text-[11px] tracking-atelier uppercase text-charcoal/55 mb-md">
          Choose a method
        </Text>

        <MethodCard
          variant="primary"
          icon="line-scan"
          title="Scan receipt"
          description="Auto-fill date, cost, parts and workshop from a photo."
          eyebrow="Fastest · Recommended"
          onPress={handleScan}
          testID="log-method-scan"
          accessibilityLabel="Scan receipt to auto-fill the service log"
        />

        <MethodCard
          variant="secondary"
          icon="pencil-outline"
          title="Enter manually"
          description="Type the details in by hand — best for DIY jobs with no receipt."
          onPress={handleManual}
          testID="log-method-manual"
          accessibilityLabel="Enter service details manually"
        />
      </View>
    </SafeAreaView>
  );
}
