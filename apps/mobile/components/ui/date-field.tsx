import React, { useState } from 'react';
import { Calendar } from 'lucide-react-native';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
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

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_: unknown, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(toISODate(selectedDate));
    }
  };

  return (
    <View className="mb-md">
      <Text className="text-xs font-sans-medium text-text-secondary mb-xs">{label}</Text>
      <TouchableOpacity
        className={`flex-row items-center bg-surface border rounded-lg px-md h-12 ${error ? 'border-danger' : 'border-border'}`}
        onPress={() => setShow(true)}
      >
        <Text className={`flex-1 text-sm font-sans ${value ? 'text-text-primary' : 'text-text-muted'}`}>
          {formatDisplay(value)}
        </Text>
        <Calendar size={16} color="#a8a29e" accessibilityLabel="Open date picker" />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
      {error ? <Text className="text-xs text-danger font-sans mt-xs">{error}</Text> : null}
    </View>
  );
}
