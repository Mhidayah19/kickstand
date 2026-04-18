export interface ServiceLog {
  id: string;
  bikeId: string;
  workshopId: string | null;
  workshop: { id: string; name: string; address: string } | null;
  serviceType: string;
  description: string;
  parts: string[] | null;
  cost: string;
  mileageAt: number;
  date: string;
  receiptUrls: string[];
  createdAt: string;
  updatedAt: string;
}
