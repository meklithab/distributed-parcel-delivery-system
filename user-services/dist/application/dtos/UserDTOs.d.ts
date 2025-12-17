export interface UserProfileResponseDTO {
    userId: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    profileImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateUserProfileRequestDTO {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    profileImageUrl?: string;
}
export interface CourierProfileRequestDTO {
    idNumber?: string;
    hireDate: Date;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';
}
export interface CourierProfileResponseDTO {
    courierProfileId: string;
    userId: string;
    idNumber?: string;
    hireDate: Date;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';
    status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';
    rating: number;
    totalDeliveriesCompleted: number;
    onTimeDeliveryRate?: number;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateCourierAvailabilityRequestDTO {
    isOnline: boolean;
    status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';
}
//# sourceMappingURL=UserDTOs.d.ts.map