import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { HeroCard } from '../../../../components/ui/hero-card';
import { Section } from '../../../../components/ui/section';
import { StatusCard } from '../../../../components/ui/status-card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ConfirmationDialog } from '../../../../components/ui/confirmation-dialog';
import { MetricDisplay } from '../../../../components/ui/metric-display';
import { BikeDetailsCard } from '../../../../components/bike/bike-details-card';
import { useBike, useDeleteBike } from '../../../../lib/api/use-bikes';
import { daysUntil, getComplianceVariant } from '../../../../lib/theme';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function BikeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const { mutate: deleteBike, isPending: isDeleting } = useDeleteBike(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const rightActions = bike ? (
    <View className="flex-row gap-sm">
      <TouchableOpacity onPress={() => router.push(`/(tabs)/garage/${id}/edit`)}>
        <Text className="text-accent text-sm font-sans-medium">Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
        <Text className="text-danger text-sm font-sans-medium">Delete</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  if (isLoading || !bike) {
    return (
      <SafeScreen scrollable>
        <Skeleton height={32} className="mb-lg" />
        <Skeleton height={140} className="mb-lg" />
        <Skeleton height={200} />
      </SafeScreen>
    );
  }

  const inspectionDays = daysUntil(bike.inspectionDue);
  const roadTaxDays = daysUntil(bike.roadTaxExpiry);
  const insuranceDays = daysUntil(bike.insuranceExpiry);
  const coeDays = daysUntil(bike.coeExpiry);

  const complianceItems = [
    { label: 'Inspection', days: inspectionDays, date: bike.inspectionDue },
    { label: 'Road Tax', days: roadTaxDays, date: bike.roadTaxExpiry },
    { label: 'Insurance', days: insuranceDays, date: bike.insuranceExpiry },
    { label: 'COE', days: coeDays, date: bike.coeExpiry },
  ];

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title={bike.model}
        subtitle={bike.plateNumber}
        rightAction={rightActions}
      />

      <HeroCard>
        <Text className="text-xs font-sans-medium text-hero-muted uppercase tracking-widest mb-xs">
          Current Mileage
        </Text>
        <MetricDisplay
          value={bike.currentMileage.toLocaleString()}
          unit="km"
          size="xl"
          onHero
        />
      </HeroCard>

      <Section label="Compliance">
        <View className="flex-row flex-wrap gap-sm">
          {complianceItems.map((item) => (
            <View key={item.label} className="w-[47%]">
              <StatusCard
                label={item.label}
                value={item.days !== null ? Math.abs(item.days) : '—'}
                unit={item.days !== null ? (Math.abs(item.days) === 1 ? 'day' : 'days') : ''}
                date={formatDate(item.date)}
                variant={getComplianceVariant(item.days)}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section label="Service History">
        <Text className="text-sm text-text-muted font-sans py-sm">
          No services logged yet
        </Text>
      </Section>

      <Section label="Bike Details">
        <BikeDetailsCard bike={bike} />
      </Section>

      <ConfirmationDialog
        visible={showDeleteConfirm}
        title={`Delete ${bike.model}?`}
        body="This will also delete all service history for this bike."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          deleteBike(undefined, {
            onSuccess: () => router.replace('/(tabs)/garage'),
          });
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeScreen>
  );
}
