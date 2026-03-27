// apps/mobile/lib/constants/service-types.ts

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

export const SERVICE_TYPE_LABELS: Record<ServiceTypeKey, string> = {
  oil_change: 'Oil Change',
  chain_adjustment: 'Chain Adjustment',
  chain_replacement: 'Chain Replacement',
  brake_pads: 'Brake Pads',
  brake_fluid: 'Brake Fluid',
  coolant: 'Coolant',
  air_filter: 'Air Filter',
  spark_plugs: 'Spark Plugs',
  tire_front: 'Front Tire',
  tire_rear: 'Rear Tire',
  valve_clearance: 'Valve Clearance',
  battery: 'Battery',
  general_service: 'General Service',
  fork_oil: 'Fork Oil',
  clutch: 'Clutch',
};

// Maps service type to TimelineEntry icon name (MaterialCommunityIcons)
export const SERVICE_TYPE_ICONS: Record<ServiceTypeKey, string> = {
  oil_change: 'oil',
  chain_adjustment: 'cog',
  chain_replacement: 'cog',
  brake_pads: 'car-brake-alert',
  brake_fluid: 'car-brake-fluid-level',
  coolant: 'coolant-temperature',
  air_filter: 'air-filter',
  spark_plugs: 'flash',
  tire_front: 'tire',
  tire_rear: 'tire',
  valve_clearance: 'engine',
  battery: 'battery',
  general_service: 'wrench',
  fork_oil: 'hydraulic-oil-level',
  clutch: 'cog-transfer',
};

// Maps service type to TimelineEntry color
type TimelineColor = 'yellow' | 'charcoal' | 'danger';

export const SERVICE_TYPE_COLORS: Record<ServiceTypeKey, TimelineColor> = {
  oil_change: 'yellow',
  chain_adjustment: 'charcoal',
  chain_replacement: 'charcoal',
  brake_pads: 'danger',
  brake_fluid: 'yellow',
  coolant: 'yellow',
  air_filter: 'charcoal',
  spark_plugs: 'charcoal',
  tire_front: 'charcoal',
  tire_rear: 'charcoal',
  valve_clearance: 'charcoal',
  battery: 'charcoal',
  general_service: 'yellow',
  fork_oil: 'yellow',
  clutch: 'danger',
};

// Filter chip definitions — maps filter label to array of service type keys
// Note: brake_fluid intentionally appears in both Oil & Fluids and Brakes
export const SERVICE_FILTER_GROUPS: Record<string, ServiceTypeKey[]> = {
  'All': [],
  'Oil & Fluids': ['oil_change', 'brake_fluid', 'coolant', 'fork_oil'],
  'Drivetrain': ['chain_adjustment', 'chain_replacement', 'clutch', 'valve_clearance'],
  'Brakes': ['brake_pads', 'brake_fluid'],
  'Tires': ['tire_front', 'tire_rear'],
  'General': ['general_service', 'air_filter', 'spark_plugs', 'battery'],
};

export const FILTER_OPTIONS = Object.keys(SERVICE_FILTER_GROUPS);
