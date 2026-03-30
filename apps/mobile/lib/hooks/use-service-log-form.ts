import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateServiceLog } from '../api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../constants/service-types';
import type { ServiceTypeKey } from '../constants/service-types';
import {
  serviceLogSchema,
  type ServiceLogFormValues,
} from '../validation/service-log-schema';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatMileage(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function makeDefaults(initialMileage?: number): ServiceLogFormValues {
  return {
    serviceTypeKey: SERVICE_TYPE_KEYS[0],
    mileage: initialMileage != null ? formatMileage(String(initialMileage)) : '',
    date: todayISO(),
    cost: '',
  };
}

export function useServiceLogForm(bikeId: string | null, initialMileage?: number) {
  const createLog = useCreateServiceLog(bikeId);
  const userEditedMileage = useRef(false);

  const form = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: makeDefaults(initialMileage),
  });

  useEffect(() => {
    if (initialMileage != null && !userEditedMileage.current) {
      form.setValue('mileage', formatMileage(String(initialMileage)));
    }
  }, [initialMileage]);

  const nextPartId = useRef(1);
  const [parts, setParts] = useState<{ id: number; value: string }[]>([{ id: 0, value: '' }]);

  const [serviceTypeKey, mileage, date] = form.watch(['serviceTypeKey', 'mileage', 'date']) as [ServiceTypeKey, string, string];
  const errors = form.formState.errors;

  const submitHandler = async (values: ServiceLogFormValues) => {
    const mileageNum = parseInt(values.mileage.replace(/,/g, ''), 10);
    const label = SERVICE_TYPE_LABELS[values.serviceTypeKey as ServiceTypeKey] ?? values.serviceTypeKey;
    const filledParts = parts.map((p) => p.value.trim()).filter(Boolean);
    return createLog.mutateAsync({
      serviceType: values.serviceTypeKey as ServiceTypeKey,
      mileageAt: mileageNum,
      date: values.date,
      cost: values.cost.trim(),
      description: label,
      parts: filledParts.length > 0 ? filledParts : undefined,
    });
  };

  const handleSave = form.handleSubmit(submitHandler);

  const handleReset = () => {
    userEditedMileage.current = false;
    form.reset(makeDefaults(initialMileage));
    nextPartId.current = 1;
    setParts([{ id: 0, value: '' }]);
  };

  return {
    control: form.control,
    errors,
    date,
    serviceTypeKey,
    serviceTypeLabel: SERVICE_TYPE_LABELS[serviceTypeKey],
    mileage,
    setServiceTypeKey: (key: ServiceTypeKey) => form.setValue('serviceTypeKey', key),
    parts,
    addPart: () => setParts((prev) => [...prev, { id: nextPartId.current++, value: '' }]),
    removePart: (id: number) =>
      setParts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev)),
    updatePart: (id: number, value: string) =>
      setParts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p))),
    setMileage: (value: string) => {
      userEditedMileage.current = true;
      form.setValue('mileage', formatMileage(value), { shouldValidate: true });
    },
    setDate: (value: string) => form.setValue('date', value, { shouldValidate: true }),
    setCost: (value: string) => form.setValue('cost', value, { shouldValidate: true }),
    handleSave,
    handleReset,
    isPending: createLog.isPending,
  };
}
