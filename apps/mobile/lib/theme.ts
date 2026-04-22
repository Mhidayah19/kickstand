import { useFonts } from 'expo-font';
import {
  InstrumentSerif_400Regular,
} from '@expo-google-fonts/instrument-serif';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

export function useAppFonts() {
  return useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    InstrumentSerif_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
}

export function getComplianceVariant(daysLeft: number | null): 'expired' | 'danger' | 'warning' | 'neutral' {
  if (daysLeft === null || daysLeft > 30) return 'neutral';
  if (daysLeft > 7) return 'warning';
  if (daysLeft > 0) return 'danger';
  return 'expired';
}

export function getComplianceStatus(dateStr: string | null): { status: string; variant: 'danger' | 'surface' } {
  const days = daysUntil(dateStr);
  const variant = getComplianceVariant(days);
  if (variant === 'expired' || variant === 'danger') return { status: 'Warning', variant: 'danger' };
  return { status: 'Good', variant: 'surface' };
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
