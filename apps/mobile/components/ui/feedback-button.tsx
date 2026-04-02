import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { colors } from '../../lib/colors';

export function FeedbackButton() {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => Sentry.showFeedbackWidget()}
      hitSlop={8}
      className="absolute z-50 w-11 h-11 rounded-full bg-charcoal/80 items-center justify-center active:opacity-70"
      // Offset above the floating tab bar (bottom-6 + bar height + spacing)
      style={{ right: 20, bottom: insets.bottom + 100 }}
    >
      <MaterialCommunityIcons name="bug-outline" size={20} color={colors.surface} />
    </Pressable>
  );
}
