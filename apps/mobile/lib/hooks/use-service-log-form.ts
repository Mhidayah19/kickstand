import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { OcrResponse } from '../ocr/types';
import { useWorkshopPickerStore } from '../store/workshop-picker-store';
import type { WorkshopSelection } from '../types/workshop';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const MAX_RECEIPTS = 5;

function formatMileage(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function makeDefaults(initialMileage?: number, existingLog?: ServiceLog, initialServiceType?: ServiceTypeKey): ServiceLogFormValues {
  if (existingLog) {
    return {
      serviceTypeKey: existingLog.serviceType as ServiceTypeKey,
      mileage: formatMileage(String(existingLog.mileageAt)),
      date: existingLog.date,
      cost: existingLog.cost,
    };
  }
  return {
    serviceTypeKey: initialServiceType ?? SERVICE_TYPE_KEYS[0],
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
  initialServiceType?: ServiceTypeKey,
) {
  const createLog = useCreateServiceLog(bikeId);
  const updateLog = useUpdateServiceLog(bikeId);
  const userEditedMileage = useRef(existingLog != null);

  const form = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: makeDefaults(initialMileage, existingLog, initialServiceType),
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

  const initialReceiptUrls = useRef(existingLog?.receiptUrls ?? []);
  const [receiptUrls, setReceiptUrls] = useState<string[]>(
    () => existingLog?.receiptUrls ?? [],
  );

  const initialWorkshop = existingLog?.workshop ?? null;
  const [workshopId, setWorkshopId] = useState<string | null>(
    initialWorkshop?.id ?? existingLog?.workshopId ?? null,
  );
  const [workshopName, setWorkshopName] = useState<string | null>(
    initialWorkshop?.name ?? null,
  );
  const [workshopAddress, setWorkshopAddress] = useState<string | null>(
    initialWorkshop?.address ?? null,
  );

  const setWorkshop = useCallback((selection: WorkshopSelection) => {
    setWorkshopId(selection.id);
    setWorkshopName(selection.name);
    setWorkshopAddress(selection.address);
  }, []);

  const clearWorkshop = useCallback(() => {
    setWorkshopId(null);
    setWorkshopName(null);
    setWorkshopAddress(null);
  }, []);

  const pendingSelection = useWorkshopPickerStore((s) => s.pending);
  const consumePickerSelection = useWorkshopPickerStore((s) => s.consume);
  useEffect(() => {
    if (pendingSelection) {
      const selection = consumePickerSelection();
      if (selection) setWorkshop(selection);
    }
  }, [pendingSelection, consumePickerSelection, setWorkshop]);

  const addReceiptUrls = useCallback((urls: string[]) => {
    setReceiptUrls((prev) => [...prev, ...urls].slice(0, MAX_RECEIPTS));
  }, []);

  const removeReceiptUrl = useCallback((index: number) => {
    setReceiptUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const prefillFromOcr = useCallback((payload: OcrResponse) => {
    const { fields, workshopId: wid, receiptUrl } = payload;
    if (fields.date) form.setValue('date', fields.date, { shouldDirty: true, shouldValidate: true });
    if (fields.cost) form.setValue('cost', fields.cost, { shouldDirty: true, shouldValidate: true });
    if (fields.serviceType) form.setValue('serviceTypeKey', fields.serviceType, { shouldDirty: true });
    if (fields.parts?.length > 0) {
      setParts(fields.parts.map((value, id) => ({ id, value })));
      nextPartId.current = fields.parts.length;
    }
    if (receiptUrl) addReceiptUrls([receiptUrl]);
    setWorkshopId(wid);
    setWorkshopName(fields.workshopName);
  }, [form, addReceiptUrls]);

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
      workshopId: workshopId ?? undefined,
    };

    if (existingLog) {
      return updateLog.mutateAsync({ logId: existingLog.id, input: payload });
    }
    return createLog.mutateAsync(payload);
  }

  const handleSave = form.handleSubmit(submitHandler);

  const initialParts = useRef(existingLog?.parts ?? []);
  const initialWorkshopId = useRef(initialWorkshop?.id ?? existingLog?.workshopId ?? null);

  const isDirty = useMemo(
    () =>
      form.formState.isDirty ||
      JSON.stringify(receiptUrls) !== JSON.stringify(initialReceiptUrls.current) ||
      JSON.stringify(parts.map((p) => p.value.trim()).filter(Boolean)) !==
        JSON.stringify(initialParts.current) ||
      workshopId !== initialWorkshopId.current,
    [form.formState.isDirty, receiptUrls, parts, workshopId],
  );

  const handleReset = () => {
    userEditedMileage.current = existingLog != null;
    form.reset(makeDefaults(initialMileage, existingLog, initialServiceType));
    nextPartId.current = existingLog?.parts?.length ?? 1;
    setParts(makeInitialParts(existingLog));
    setReceiptUrls(existingLog?.receiptUrls ?? []);
    setWorkshopId(initialWorkshop?.id ?? existingLog?.workshopId ?? null);
    setWorkshopName(initialWorkshop?.name ?? null);
    setWorkshopAddress(initialWorkshop?.address ?? null);
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
    setServiceTypeKey: (key: ServiceTypeKey) => form.setValue('serviceTypeKey', key, { shouldDirty: true }),
    parts,
    addPart: () => setParts((prev) => [...prev, { id: nextPartId.current++, value: '' }]),
    removePart: (id: number) =>
      setParts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev)),
    updatePart: (id: number, value: string) =>
      setParts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p))),
    setMileage: (value: string) => {
      userEditedMileage.current = true;
      form.setValue('mileage', formatMileage(value), { shouldValidate: true, shouldDirty: true });
    },
    setDate: (value: string) => form.setValue('date', value, { shouldValidate: true, shouldDirty: true }),
    setCost: (value: string) => form.setValue('cost', value, { shouldValidate: true, shouldDirty: true }),
    handleSave,
    handleReset,
    isDirty,
    isPending: createLog.isPending || updateLog.isPending,
    prefillFromOcr,
    workshopId,
    workshopName,
    workshopAddress,
    setWorkshop,
    clearWorkshop,
  };
}
