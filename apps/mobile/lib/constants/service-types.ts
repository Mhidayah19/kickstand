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

// Grouped chip categories for the service log form
export const SERVICE_TYPE_GROUPS: { label: string; keys: ServiceTypeKey[] }[] = [
  { label: 'Engine', keys: ['oil_change', 'coolant', 'spark_plugs', 'air_filter', 'valve_clearance'] },
  { label: 'Drivetrain', keys: ['chain_adjustment', 'chain_replacement', 'clutch'] },
  { label: 'Brakes & Wheels', keys: ['brake_pads', 'brake_fluid', 'tire_front', 'tire_rear', 'fork_oil'] },
  { label: 'Other', keys: ['battery', 'general_service'] },
];

// Smart placeholder hints for the "Parts Used" field per service type
export const PARTS_PLACEHOLDERS: Record<ServiceTypeKey, string> = {
  oil_change:        'e.g. Motul 7100 10W-40, 3.5L',
  coolant:           'e.g. Motul Motocool Expert, 1L',
  spark_plugs:       'e.g. NGK CR9EIA-9, x2',
  air_filter:        'e.g. K&N HA-4099',
  valve_clearance:   'e.g. OEM shim set, 3.0mm intake',
  chain_adjustment:  'e.g. Motul C2 chain lube, slack 30mm',
  chain_replacement: 'e.g. DID 520VX3 120L, JT 15/45T',
  clutch:            'e.g. EBC CK series, x7 friction plates',
  brake_pads:        'e.g. Vesrah RJL ZZ, sintered',
  brake_fluid:       'e.g. Motul RBF 600, DOT 4, 500ml',
  tire_front:        'e.g. Michelin Road 6, 120/70 ZR17',
  tire_rear:         'e.g. Michelin Road 6, 160/60 ZR17',
  fork_oil:          'e.g. Motul Fork Oil 10W, 500ml x2',
  battery:           'e.g. Yuasa YTZ10S, 12V 8.6Ah',
  general_service:   'Item, brand, specs, qty',
};
