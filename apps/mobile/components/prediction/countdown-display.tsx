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
  tone?: 'surface' | 'charcoal';
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

export function CountdownDisplay({
  value,
  unit,
  supporting,
  size = 'xl',
  tone = 'surface',
}: CountdownDisplayProps) {
  const primaryText = tone === 'surface' ? 'text-surface' : 'text-charcoal';
  const secondaryText = tone === 'surface' ? 'text-sand' : 'text-charcoal/55';
  const tertiaryText = tone === 'surface' ? 'text-surface/70' : 'text-charcoal/55';

  return (
    <View>
      <View className="flex-row items-end flex-1">
        <Text
          className={`${sizeClasses[size]} ${primaryText} font-sans-xbold flex-shrink`}
          style={{ fontVariant: ['tabular-nums'] }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </Text>
        <Text className={`${unitPaddingClasses[size]} text-xl font-sans-bold ${secondaryText} ml-2 flex-shrink-0`}>
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
