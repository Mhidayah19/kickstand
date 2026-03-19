import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
}

export type ComplianceVariant = 'expired' | 'danger' | 'warning' | 'neutral';

export function getComplianceVariant(daysLeft: number | null): ComplianceVariant {
  if (daysLeft === null || daysLeft > 30) return 'neutral';
  if (daysLeft > 7) return 'warning';
  if (daysLeft > 0) return 'danger';
  return 'expired';
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
