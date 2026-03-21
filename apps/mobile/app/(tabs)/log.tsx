import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { FilterChips } from '../../components/ui/filter-chips';
import { TimelineEntry } from '../../components/ui/timeline-entry';

const FILTER_OPTIONS = ['All', 'Maintenance', 'Repairs', 'Performance'];

export default function LogScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Service History" size="md" />

      {/* Total spend badge */}
      <View className="bg-yellow self-start px-4 py-2 rounded-xl mb-6">
        <Text className="font-sans-xbold text-lg text-charcoal">$1,623.50</Text>
      </View>

      {/* Filter chips */}
      <View className="mb-8">
        <FilterChips
          options={FILTER_OPTIONS}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
          wrap={false}
        />
      </View>

      {/* Timeline */}
      <View className="relative">
        {/* Vertical line */}
        <View
          className="absolute bg-sand/30"
          style={{ left: 16, top: 0, bottom: 0, width: 2 }}
        />

        <TimelineEntry
          date="October 12, 2023"
          title="Full Seasonal Service"
          cost="$450.00"
          icon="wrench"
          color="yellow"
          tags={[
            { label: 'Oil Change' },
            { label: 'Filter Sync' },
            { label: 'Brake Fluid' },
          ]}
          quote="Engine response significantly improved..."
        />

        <TimelineEntry
          date="August 28, 2023"
          title="Chain Maintenance"
          cost="$85.50"
          icon="cog"
          color="charcoal"
          tags={[
            { label: 'Cleaning' },
            { label: 'Tensioning' },
            { label: 'Waxing' },
          ]}
        />

        <TimelineEntry
          date="June 04, 2023"
          title="Emergency Repair"
          cost="$1,088.00"
          icon="alert"
          color="danger"
          tags={[
            { label: 'Clutch Plate', danger: true },
            { label: 'Gasket Kit', danger: true },
            { label: 'Labor', danger: true },
          ]}
        />
      </View>
    </SafeScreen>
  );
}
