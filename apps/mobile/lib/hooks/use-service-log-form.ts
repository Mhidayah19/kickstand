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

function labelToKey(label: string): ServiceTypeKey | undefined {
  return SERVICE_TYPE_KEYS.find((k) => SERVICE_TYPE_LABELS[k] === label);
}

export function useServiceLogForm(bikeId: string | null) {
  const createLog = useCreateServiceLog(bikeId);

  const [serviceTypeLabel, setServiceTypeLabel] = useState(SERVICE_CHIP_OPTIONS[0]);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const selectedKey = labelToKey(serviceTypeLabel);

  const handleSave = async () => {
    const mileageNum = parseInt(mileage, 10);
    if (!selectedKey || isNaN(mileageNum) || !date || !notes.trim() || !cost.trim()) {
      throw new Error('Please fill in all required fields (type, mileage, date, cost, notes).');
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Please enter a valid date in YYYY-MM-DD format.');
    }

    return createLog.mutateAsync({
      serviceType: selectedKey,
      mileageAt: mileageNum,
      date,
      cost: cost.trim(),
      description: notes.trim(),
    });
  };

  return {
    serviceTypeLabel,
    setServiceTypeLabel,
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
