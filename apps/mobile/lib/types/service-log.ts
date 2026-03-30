export interface ServiceLog {
  id: string;
  bikeId: string;
  workshopId: string | null;
  serviceType: string;
  description: string;
  parts: string[] | null;
  cost: string;
  mileageAt: number;
  date: string;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
