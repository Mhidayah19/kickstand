export interface BikeForLabel {
  make?: string | null;
  model: string;
  plateNumber?: string;
}

export function formatBikeLabel(bike: BikeForLabel | undefined | null): string {
  if (!bike) return 'Loading...';
  const name = `${bike.make ?? ''} ${bike.model}`.trim();
  const plate = bike.plateNumber ? ` • ${bike.plateNumber}` : '';
  return name + plate;
}
