// apps/mobile/lib/constants/service-types.ts

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { serviceTypeToMeta } from '../service-type-meta';
import type { TimelineColor } from '../service-type-meta';

export type { TimelineColor };
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const SERVICE_TYPE_KEYS = [
  'oil_change',
  'chain_adjustment',
  'chain_replacement',
  'brake_pads',
  'brake_fluid',
  'coolant',
  'air_filter',
  'spark_plugs',
  'tire_front',
  'tire_rear',
  'valve_clearance',
  'battery',
  'general_service',
  'fork_oil',
  'clutch',
] as const;

export type ServiceTypeKey = (typeof SERVICE_TYPE_KEYS)[number];

export const SERVICE_TYPE_LABELS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, serviceTypeToMeta(key).label]),
) as Record<ServiceTypeKey, string>;
export const SERVICE_TYPE_ICONS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, serviceTypeToMeta(key).icon as IconName]),
) as Record<ServiceTypeKey, IconName>;
export const SERVICE_TYPE_COLORS = Object.fromEntries(
  SERVICE_TYPE_KEYS.map((key) => [key, serviceTypeToMeta(key).color]),
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

export const SERVICE_CHIP_OPTIONS = SERVICE_TYPE_KEYS.map((key) => SERVICE_TYPE_LABELS[key]);
