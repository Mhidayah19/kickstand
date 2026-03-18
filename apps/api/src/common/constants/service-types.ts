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
