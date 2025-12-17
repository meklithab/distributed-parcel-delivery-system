export interface Vehicle {
  vehicleId: string;
  courierProfileId: string;
  vehicleType: 'BIKE' | 'MOTORCYCLE' | 'CAR' | 'VAN';
  make?: string;
  model?: string;
  licensePlate: string;
  capacityWeightKg?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}