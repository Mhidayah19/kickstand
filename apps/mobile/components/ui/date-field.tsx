import { useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, TouchableOpacity, View, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Label from '@rn-primitives/label';
import { cn } from '../../lib/cn';
import { colors } from '../../lib/colors';

interface DateFieldProps {
  label: string;
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return 'Not set';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function toDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function DateField({ label, value = '', onChange, error, className }: DateFieldProps) {
  const [show, setShow] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(toDate(value));
  const underlineOpacity = useRef(new Animated.Value(0)).current;

  const animateUnderline = (toValue: number) => {
    Animated.timing(underlineOpacity, {
      toValue,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleOpen = () => {
    setPendingDate(toDate(value));
    setShow(true);
    animateUnderline(1);
  };

  const handleClose = () => {
    setShow(false);
    animateUnderline(0);
  };

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      animateUnderline(0);
      if (selectedDate) onChange?.(toISODate(selectedDate));
    } else {
      if (selectedDate) setPendingDate(selectedDate);
    }
  };

  const handleDone = () => {
    onChange?.(toISODate(pendingDate));
    handleClose();
  };

  return (
    <View className={cn(className)}>
      <TouchableOpacity
        className="bg-bg-2 p-6 rounded-xl overflow-hidden"
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Label.Root onPress={handleOpen}>
          <Label.Text className="font-sans-bold text-xxs text-ink uppercase tracking-wide-1 mb-2">
            {label}
          </Label.Text>
        </Label.Root>
        <Text className={cn('font-sans-bold text-xl', value ? 'text-ink' : 'text-muted')}>
          {formatDisplay(value)}
        </Text>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.yellow,
            opacity: underlineOpacity,
          }}
        />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide" visible={show} onRequestClose={handleClose}>
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="bg-surface rounded-t-3xl px-6 pb-8 pt-4">
            <View className="flex-row justify-between items-center mb-2">
              <Pressable onPress={handleClose} hitSlop={8}>
                <Text className="font-sans-bold text-sm text-ink">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDone} hitSlop={8}>
                <Text className="font-sans-bold text-sm text-yellow">Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={pendingDate}
              mode="date"
              display="spinner"
              onChange={handleChange}
              themeVariant="light"
              style={{ width: '100%' }}
            />
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={toDate(value)}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}

      {error ? (
        <Text className="text-xs text-danger font-sans-medium mt-2">{error}</Text>
      ) : null}
    </View>
  );
}
