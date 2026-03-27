// apps/mobile/lib/constants/service-types.ts

import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
export type TimelineColor = 'yellow' | 'charcoal' | 'danger';

export const SERVICE_TYPE_META = {
  oil_change: { label: 'Oil Change', icon: 'oil' as IconName, color: 'yellow' as TimelineColor },
  chain_adjustment: { label: 'Chain Adjustment', icon: 'cog' as IconName, color: 'charcoal' as TimelineColor },
  chain_replacement: { label: 'Chain & Sprocket Replacement', icon: 'cog' as IconName, color: 'charcoal' as TimelineColor },
  brake_pads: { label: 'Brake Pads Replacement', icon: 'car-brake-alert' as IconName, color: 'danger' as TimelineColor },
  brake_fluid: { label: 'Brake Fluid', icon: 'car-brake-fluid-level' as IconName, color: 'yellow' as TimelineColor },
  coolant: { label: 'Coolant', icon: 'coolant-temperature' as IconName, color: 'yellow' as TimelineColor },
  air_filter: { label: 'Air Filter', icon: 'air-filter' as IconName, color: 'charcoal' as TimelineColor },
  spark_plugs: { label: 'Spark Plugs', icon: 'flash' as IconName, color: 'charcoal' as TimelineColor },
  tire_front: { label: 'Front Tire', icon: 'tire' as IconName, color: 'charcoal' as TimelineColor },
  tire_rear: { label: 'Rear Tire', icon: 'tire' as IconName, color: 'charcoal' as TimelineColor },
  valve_clearance: { label: 'Valve Clearance', icon: 'engine' as IconName, color: 'charcoal' as TimelineColor },
  battery: { label: 'Battery', icon: 'battery' as IconName, color: 'charcoal' as TimelineColor },
  general_service: { label: 'General Service / Inspection', icon: 'wrench' as IconName, color: 'yellow' as TimelineColor },
  fork_oil: { label: 'Fork Oil', icon: 'hydraulic-oil-level' as IconName, color: 'yellow' as TimelineColor },
  clutch: { label: 'Clutch', icon: 'cog-transfer' as IconName, color: 'danger' as TimelineColor },
} as const;

export type ServiceTypeKey = keyof typeof SERVICE_TYPE_META;
export const SERVICE_TYPE_KEYS = Object.keys(SERVICE_TYPE_META) as ServiceTypeKey[];
export const SERVICE_TYPE_LABELS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, SERVICE_TYPE_META[key].label]),
) as Record<ServiceTypeKey, string>;
export const SERVICE_TYPE_ICONS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, SERVICE_TYPE_META[key].icon]),
) as Record<ServiceTypeKey, IconName>;
export const SERVICE_TYPE_COLORS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, SERVICE_TYPE_META[key].color]),
) as Record<ServiceTypeKey, TimelineColor>;

// Filter chip definitions — maps filter label to array of service type keys
// Note: brake_fluid intentionally appears in both Oil & Fluids and Brakes
export const SERVICE_FILTER_GROUPS = {
  All: [],
  'Oil & Fluids': ['oil_change', 'brake_fluid', 'coolant', 'fork_oil'],
  Drivetrain: ['chain_adjustment', 'chain_replacement', 'clutch', 'valve_clearance'],
  Brakes: ['brake_pads', 'brake_fluid'],
  Tires: ['tire_front', 'tire_rear'],
  General: ['general_service', 'air_filter', 'spark_plugs', 'battery'],
} as const satisfies Record<string, readonly ServiceTypeKey[]>;

export type FilterGroupKey = keyof typeof SERVICE_FILTER_GROUPS;
export const FILTER_OPTIONS = Object.keys(SERVICE_FILTER_GROUPS) as FilterGroupKey[];
