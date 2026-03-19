import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
}

export function getComplianceVariant(daysLeft: number | null): 'expired' | 'danger' | 'warning' | 'neutral' {
  if (daysLeft === null || daysLeft > 30) return 'neutral';
  if (daysLeft > 7) return 'warning';
  if (daysLeft > 0) return 'danger';
  return 'expired';
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
