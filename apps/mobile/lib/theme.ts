import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

export function useAppFonts() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
}

export const FONTS = {
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

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
