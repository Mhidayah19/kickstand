export type BikeClass = '2B' | '2A' | '2';

export interface Bike {
  id: string;
  userId: string;
  model: string;
  year: number;
  plateNumber: string;
  class: BikeClass;
  currentMileage: number;
  coeExpiry: string | null;
  roadTaxExpiry: string | null;
  insuranceExpiry: string | null;
  inspectionDue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBikeInput {
  model: string;
  year: number;
  plateNumber: string;
  class: BikeClass;
  currentMileage: number;
  coeExpiry?: string;
  roadTaxExpiry?: string;
  insuranceExpiry?: string;
  inspectionDue?: string;
}

export type UpdateBikeInput = Partial<CreateBikeInput>;

export interface UpdateMileageInput {
  mileage: number;
}
