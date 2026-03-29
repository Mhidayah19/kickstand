import { useEffect, useRef, useState } from 'react';
import { useCreateServiceLog } from '../api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../constants/service-types';
import type { ServiceTypeKey } from '../constants/service-types';

function todayDisplay(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function displayToISO(display: string): string {
  // Parse "DD Mon YYYY" format produced by todayDisplay()
  const match = display.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (match) {
    const [, day, mon, year] = match;
    const monthIdx = SHORT_MONTHS.indexOf(mon);
    if (monthIdx !== -1) {
      const dd = day.padStart(2, '0');
      const mm = String(monthIdx + 1).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  }
  return display;
}

function validateForm(mileage: string, date: string, cost: string, notes: string): number {
  const mileageNum = parseInt(mileage.replace(/,/g, ''), 10);
  if (isNaN(mileageNum) || !date || !notes.trim() || !cost.trim()) {
    throw new Error('Please fill in all required fields (type, mileage, date, cost, notes).');
  }
  if (isNaN(new Date(date).getTime())) {
    throw new Error('Please enter a valid date in YYYY-MM-DD format.');
  }
  return mileageNum;
}

function formatMileage(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function useServiceLogForm(bikeId: string | null, initialMileage?: number) {
  const createLog = useCreateServiceLog(bikeId);
  const userEditedMileage = useRef(false);

  const [serviceTypeKey, setServiceTypeKey] = useState<ServiceTypeKey>(SERVICE_TYPE_KEYS[0]);
  const [mileage, setMileage] = useState(initialMileage != null ? formatMileage(String(initialMileage)) : '');
  const [date, setDate] = useState(todayDisplay());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialMileage != null && !userEditedMileage.current) {
      setMileage(formatMileage(String(initialMileage)));
    }
  }, [initialMileage]);

  const handleSave = async () => {
    const isoDate = displayToISO(date);
    const mileageNum = validateForm(mileage, isoDate, cost, notes);
    return createLog.mutateAsync({
      serviceType: serviceTypeKey,
      mileageAt: mileageNum,
      date: isoDate,
      cost: cost.trim(),
      description: notes.trim(),
    });
  };

  const handleReset = () => {
    setServiceTypeKey(SERVICE_TYPE_KEYS[0]);
    userEditedMileage.current = false;
    setMileage(initialMileage != null ? formatMileage(String(initialMileage)) : '');
    setDate(todayDisplay());
    setCost('');
    setNotes('');
  };

  return {
    serviceTypeLabel: SERVICE_TYPE_LABELS[serviceTypeKey],
    setServiceTypeLabel: (label: string) => {
      const nextKey = SERVICE_TYPE_KEYS.find((key) => SERVICE_TYPE_LABELS[key] === label);
      if (nextKey) setServiceTypeKey(nextKey);
    },
    mileage,
    setMileage: (value: string) => {
      userEditedMileage.current = true;
      setMileage(formatMileage(value));
    },
    date,
    setDate,
    cost,
    setCost,
    notes,
    setNotes,
    handleSave,
    handleReset,
    isPending: createLog.isPending,
  };
}
