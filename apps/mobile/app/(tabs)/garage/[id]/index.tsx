import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BikeDetailsCard } from '../../../../components/bike/bike-details-card';
import { ConfirmationDialog } from '../../../../components/ui/confirmation-dialog';
import { HeroCard } from '../../../../components/ui/hero-card';
import { MetricDisplay } from '../../../../components/ui/metric-display';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Section } from '../../../../components/ui/section';
import { Skeleton } from '../../../../components/ui/skeleton';
import { StatusCard } from '../../../../components/ui/status-card';
import { useDeleteBike, useBike } from '../../../../lib/api/use-bikes';
import { daysUntil, getComplianceVariant } from '../../../../lib/theme';

export default function BikeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const deleteBike = useDeleteBike(id ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    router.replace('/(tabs)/garage' as any);
  };

  if (isLoading || !bike) {
    return (
      <SafeScreen scrollable>
        <Skeleton height={32} className="rounded-md mb-lg w-48" />
        <Skeleton height={120} className="rounded-2xl mb-lg" />
        <Skeleton height={160} className="rounded-xl mb-lg" />
      </SafeScreen>
    );
  }

  const complianceItems = [
    { label: 'Inspection', dateField: bike.inspectionDue },
    { label: 'Road Tax', dateField: bike.roadTaxExpiry },
    { label: 'Insurance', dateField: bike.insuranceExpiry },
    { label: 'COE', dateField: bike.coeExpiry },
  ];

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title={bike.model}
        subtitle={bike.plateNumber}
        rightAction={
          <View className="flex-row items-center gap-sm">
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/garage/${id}/edit` as any)}
              className="bg-surface-muted rounded-full px-md py-sm"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-sans-semibold text-text-secondary">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteDialog(true)}
              className="bg-danger-surface rounded-full p-sm"
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Mileage hero */}
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
        {bike.updatedAt ? (
          <Text className="text-xs font-sans text-hero-muted mt-xs">
            Updated {new Date(bike.updatedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        ) : null}
      </HeroCard>

      {/* Compliance grid */}
      <Section label="Compliance" action="Edit dates" onAction={() => router.push(`/(tabs)/garage/${id}/edit` as any)}>
        <View className="flex-row flex-wrap gap-sm">
          {complianceItems.map(({ label, dateField }) => {
            const days = daysUntil(dateField);
            const variant = getComplianceVariant(days);
            const value = days === null ? '–' : Math.abs(days);
            const unit = days === null ? '' : days < 0 ? 'days overdue' : 'days';
            const dateDisplay = dateField
              ? new Date(dateField).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Not set';
            return (
              <View key={label} style={{ width: '47%' }}>
                <StatusCard
                  label={label}
                  value={String(value)}
                  unit={unit}
                  date={dateDisplay}
                  variant={variant}
                />
              </View>
            );
          })}
        </View>
      </Section>

      {/* Service history placeholder */}
      <Section label="Service History" action="See all" onAction={() => router.push(`/(tabs)/garage/${id}/services` as any)}>
        <Text className="text-sm font-sans text-muted text-center py-lg">No services logged yet</Text>
      </Section>

      {/* Bike details */}
      <Section label="Bike Details">
        <BikeDetailsCard bike={bike} />
      </Section>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title={`Delete ${bike.model}?`}
        body="This will also delete all service history for this bike. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeScreen>
  );
}
