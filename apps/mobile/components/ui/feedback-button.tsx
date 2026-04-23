import { ActionSheetIOS, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { colors } from '../../lib/colors';
import { captureAndPush, getCurrentRoute } from '../../lib/sentry/screen-tracker';
import { setPendingFeedbackType } from '../../lib/sentry/feedback-state';

const FEEDBACK_TYPES = [
  { label: 'Report a Bug', tag: 'bug' },
  { label: 'Feature Request', tag: 'feature' },
  { label: 'General Feedback', tag: 'feedback' },
] as const;

const OPTIONS = [...FEEDBACK_TYPES.map((t) => t.label), 'Cancel'];

export function FeedbackButton() {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: OPTIONS,
        cancelButtonIndex: FEEDBACK_TYPES.length,
      },
      (index) => {
        if (index === FEEDBACK_TYPES.length) return;
        void captureAndPush(getCurrentRoute());
        setPendingFeedbackType(FEEDBACK_TYPES[index].tag);
        Sentry.showFeedbackWidget();
      },
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      className="absolute z-50 w-11 h-11 rounded-full bg-ink/80 items-center justify-center active:opacity-70"
      style={{ right: 20, bottom: insets.bottom + 100 }}
    >
      <MaterialCommunityIcons name="bug-outline" size={20} color={colors.surface} />
    </Pressable>
  );
}
