import { useState } from 'react';
import { useCreateServiceLog } from '../api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../constants/service-types';
import type { ServiceTypeKey } from '../constants/service-types';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function validateForm(mileage: string, date: string, cost: string, notes: string): number {
  const mileageNum = parseInt(mileage, 10);
  if (isNaN(mileageNum) || !date || !notes.trim() || !cost.trim()) {
    throw new Error('Please fill in all required fields (type, mileage, date, cost, notes).');
  }
  if (isNaN(new Date(date).getTime())) {
    throw new Error('Please enter a valid date in YYYY-MM-DD format.');
  }
  return mileageNum;
}

export function useServiceLogForm(bikeId: string | null) {
  const createLog = useCreateServiceLog(bikeId);

  const [serviceTypeKey, setServiceTypeKey] = useState<ServiceTypeKey>(SERVICE_TYPE_KEYS[0]);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const mileageNum = validateForm(mileage, date, cost, notes);
    return createLog.mutateAsync({
      serviceType: serviceTypeKey,
      mileageAt: mileageNum,
      date,
      cost: cost.trim(),
      description: notes.trim(),
    });
  };

  const handleReset = () => {
    setServiceTypeKey(SERVICE_TYPE_KEYS[0]);
    setMileage('');
    setDate(todayISO());
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
    setMileage,
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
