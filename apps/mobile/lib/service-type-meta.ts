import { colors } from './colors';

export type TimelineColor = 'yellow' | 'charcoal' | 'danger';

export interface ServiceTypeMeta {
  icon: string;
  iconBg: string;
  iconColor: string;
  color: TimelineColor;
  label: string;
}

const FALLBACK: ServiceTypeMeta = {
  icon: 'wrench',
  iconBg: 'bg-ink/10',
  iconColor: colors.ink,
  color: 'charcoal',
  label: 'Service',
};

const META: Record<string, ServiceTypeMeta> = {
  oil_change:        { icon: 'oil',            iconBg: 'bg-yellow/20', iconColor: colors.yellow, color: 'yellow',   label: 'Oil Change' },
  chain_adjustment:  { icon: 'link-variant',   iconBg: 'bg-bg-2',      iconColor: colors.muted,  color: 'charcoal', label: 'Chain Adjustment' },
  chain_replacement: { icon: 'link-variant',   iconBg: 'bg-bg-2',      iconColor: colors.muted,  color: 'charcoal', label: 'Chain Replacement' },
  brake_pads:        { icon: 'alert-circle',   iconBg: 'bg-red-100',   iconColor: colors.danger, color: 'danger',   label: 'Brake Pads' },
  brake_fluid:       { icon: 'alert-circle',   iconBg: 'bg-red-100',   iconColor: colors.danger, color: 'danger',   label: 'Brake Fluid' },
  coolant:           { icon: 'thermometer',    iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Coolant' },
  air_filter:        { icon: 'air-filter',     iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Air Filter' },
  spark_plugs:       { icon: 'lightning-bolt', iconBg: 'bg-yellow/20', iconColor: colors.yellow, color: 'yellow',   label: 'Spark Plugs' },
  tire_front:        { icon: 'circle-outline', iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Front Tyre' },
  tire_rear:         { icon: 'circle-outline', iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Rear Tyre' },
  valve_clearance:   { icon: 'wrench',         iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Valve Clearance' },
  battery:           { icon: 'battery',        iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Battery' },
  general_service:   { icon: 'wrench',         iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'General Service' },
  fork_oil:          { icon: 'oil',            iconBg: 'bg-bg-2',      iconColor: colors.muted,  color: 'charcoal', label: 'Fork Oil' },
  clutch:            { icon: 'cog',            iconBg: 'bg-ink/10',    iconColor: colors.ink,    color: 'charcoal', label: 'Clutch' },
};

export function serviceTypeToMeta(type: string): ServiceTypeMeta {
  return META[type] ?? FALLBACK;
}
