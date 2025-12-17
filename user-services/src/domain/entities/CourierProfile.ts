export interface CourierProfile {
    courierProfileId: string;
    userId: string;
    idNumber?: string;
    hireDate: Date;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';
    status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';
    rating: number;
    totalDeliveriesCompleted: number;
    onTimeDeliveryRate?: number;
    currentLatitude?: number;
    currentLongitude?: number;
    lastLocationUpdate?: Date;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
}