import { Text, View } from 'react-native';

type DisplaySize = 'sm' | 'md' | 'lg' | 'xl';

interface CountdownDisplayProps {
  /** The headline number, e.g. "340" or "340–420" or "~3". */
  value: string;
  /** The unit label, e.g. "KM", "MONTHS", "DAYS". */
  unit: string;
  /** Secondary line below, e.g. "or 18 days — whichever comes first". */
  supporting?: string;
  /** Size of the display number. Default 'xl' for home hero. */
  size?: DisplaySize;
  /** Color token for primary text. Default 'surface' (for dark pedestals). */
  tone?: 'surface' | 'ink';
}

const sizeClasses: Record<DisplaySize, string> = {
  sm: 'text-display-sm',
  md: 'text-display-md',
  lg: 'text-display-lg',
  xl: 'text-display-xl',
};

const unitPaddingClasses: Record<DisplaySize, string> = {
  sm: 'pb-1',
  md: 'pb-2',
  lg: 'pb-3',
  xl: 'pb-4',
};

// React Native clips the last glyph when letterSpacing is negative.
// These values match the tailwind config display-* tokens so padding stays in sync.
const letterSpacing: Record<DisplaySize, number> = {
  sm: -1.92,
  md: -3.2,
  lg: -4.4,
  xl: -5.28,
};

// For xl size, downscale when the value is wide to prevent layout overflow
const resolveSize = (requested: DisplaySize, value: string): DisplaySize => {
  if (requested !== 'xl') return requested;
  const len = value.replace(/,/g, '').length;
  if (len >= 5) return 'md';
  if (len >= 3) return 'lg';
  return 'xl';
};

export function CountdownDisplay({
  value,
  unit,
  supporting,
  size = 'xl',
  tone = 'surface',
}: CountdownDisplayProps) {
  const effectiveSize = resolveSize(size, value);
  const primaryText = tone === 'surface' ? 'text-surface' : 'text-ink';
  const secondaryText = tone === 'surface' ? 'text-muted' : 'text-ink/55';
  const tertiaryText = tone === 'surface' ? 'text-surface/70' : 'text-ink/55';

  return (
    <View>
      <View className="flex-row items-end">
        <Text
          className={`${sizeClasses[effectiveSize]} ${primaryText} font-sans-xbold`}
          style={{ fontVariant: ['tabular-nums'], paddingRight: Math.ceil(Math.abs(letterSpacing[effectiveSize])) }}
        >
          {value}
        </Text>
        <Text className={`${unitPaddingClasses[effectiveSize]} text-xl font-sans-bold ${secondaryText} ml-2`}>
          {unit}
        </Text>
      </View>
      {supporting && (
        <Text className={`text-[13px] font-sans-medium ${tertiaryText} mt-2`}>
          {supporting}
        </Text>
      )}
    </View>
  );
}
