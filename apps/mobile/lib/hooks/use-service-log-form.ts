import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateServiceLog, useUpdateServiceLog } from '../api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../constants/service-types';
import type { ServiceTypeKey } from '../constants/service-types';
import {
  serviceLogSchema,
  type ServiceLogFormValues,
} from '../validation/service-log-schema';
import type { ServiceLog } from '../types/service-log';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const MAX_RECEIPTS = 5;

function formatMileage(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function makeDefaults(initialMileage?: number, existingLog?: ServiceLog): ServiceLogFormValues {
  if (existingLog) {
    return {
      serviceTypeKey: existingLog.serviceType as ServiceTypeKey,
      mileage: formatMileage(String(existingLog.mileageAt)),
      date: existingLog.date,
      cost: existingLog.cost,
    };
  }
  return {
    serviceTypeKey: SERVICE_TYPE_KEYS[0],
    mileage: initialMileage != null ? formatMileage(String(initialMileage)) : '',
    date: todayISO(),
    cost: '',
  };
}

function makeInitialParts(existingLog?: ServiceLog): { id: number; value: string }[] {
  if (existingLog?.parts?.length) {
    return existingLog.parts.map((p, i) => ({ id: i, value: p }));
  }
  return [{ id: 0, value: '' }];
}

// NOTE: existingLog is captured at mount time via closure. useForm reads defaultValues once on mount,
// so if the parent re-renders with a refreshed existingLog, the form will NOT re-initialise.
// Callers should ensure this hook is only mounted once per edit session.
export function useServiceLogForm(
  bikeId: string | null,
  initialMileage?: number,
  existingLog?: ServiceLog,
) {
  const createLog = useCreateServiceLog(bikeId);
  const updateLog = useUpdateServiceLog(bikeId);
  const userEditedMileage = useRef(existingLog != null);

  const form = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: makeDefaults(initialMileage, existingLog),
  });

  useEffect(() => {
    if (initialMileage != null && !userEditedMileage.current) {
      form.setValue('mileage', formatMileage(String(initialMileage)));
    }
  }, [form, initialMileage]);

  const nextPartId = useRef(existingLog?.parts?.length ?? 1);
  const [parts, setParts] = useState<{ id: number; value: string }[]>(
    () => makeInitialParts(existingLog),
  );

  const [receiptUrls, setReceiptUrls] = useState<string[]>(
    () => existingLog?.receiptUrls ?? [],
  );

  const addReceiptUrls = useCallback((urls: string[]) => {
    setReceiptUrls((prev) => [...prev, ...urls].slice(0, MAX_RECEIPTS));
  }, []);

  const removeReceiptUrl = useCallback((index: number) => {
    setReceiptUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const [serviceTypeKey, mileage, date] = form.watch([
    'serviceTypeKey',
    'mileage',
    'date',
  ]) as [ServiceTypeKey, string, string];
  const errors = form.formState.errors;

  async function submitHandler(values: ServiceLogFormValues) {
    const mileageNum = parseInt(values.mileage.replace(/,/g, ''), 10);
    const label = SERVICE_TYPE_LABELS[values.serviceTypeKey as ServiceTypeKey] ?? values.serviceTypeKey;
    const filledParts = parts.map((p) => p.value.trim()).filter(Boolean);
    const payload = {
      serviceType: values.serviceTypeKey as ServiceTypeKey,
      mileageAt: mileageNum,
      date: values.date,
      cost: values.cost.trim(),
      description: label,
      parts: filledParts.length > 0 ? filledParts : undefined,
      receiptUrls: receiptUrls.length > 0 ? receiptUrls : undefined,
    };

    if (existingLog) {
      return updateLog.mutateAsync({ logId: existingLog.id, input: payload });
    }
    return createLog.mutateAsync(payload);
  }

  const handleSave = form.handleSubmit(submitHandler);

  const handleReset = () => {
    userEditedMileage.current = existingLog != null;
    form.reset(makeDefaults(initialMileage, existingLog));
    nextPartId.current = existingLog?.parts?.length ?? 1;
    setParts(makeInitialParts(existingLog));
    setReceiptUrls(existingLog?.receiptUrls ?? []);
  };

  return {
    control: form.control,
    errors,
    date,
    serviceTypeKey,
    serviceTypeLabel: SERVICE_TYPE_LABELS[serviceTypeKey],
    mileage,
    receiptUrls,
    addReceiptUrls,
    removeReceiptUrl,
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
    isPending: createLog.isPending || updateLog.isPending,
  };
}
