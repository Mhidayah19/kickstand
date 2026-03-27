import { useState } from 'react';
import { useCreateServiceLog } from '../api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../constants/service-types';
import type { ServiceTypeKey } from '../constants/service-types';

export const SERVICE_CHIP_OPTIONS = SERVICE_TYPE_KEYS.map((key) => SERVICE_TYPE_LABELS[key]);

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function useServiceLogForm(bikeId: string | null) {
  const createLog = useCreateServiceLog(bikeId);

  const [serviceTypeKey, setServiceTypeKey] = useState<ServiceTypeKey>(SERVICE_TYPE_KEYS[0]);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const mileageNum = parseInt(mileage, 10);
    if (isNaN(mileageNum) || !date || !notes.trim() || !cost.trim()) {
      throw new Error('Please fill in all required fields (type, mileage, date, cost, notes).');
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Please enter a valid date in YYYY-MM-DD format.');
    }

    return createLog.mutateAsync({
      serviceType: serviceTypeKey,
      mileageAt: mileageNum,
      date,
      cost: cost.trim(),
      description: notes.trim(),
    });
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
    isPending: createLog.isPending,
  };
}
