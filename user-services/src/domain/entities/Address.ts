export interface Address {
    addressId: string;
    userId: string;
    addressType: 'HOME' | 'WORK' | 'OTHER' | 'BILLING';
    streetAddress: string;
    subcity: string;
    kebele: string;
    woreda?: string;
    houseNumber?: string;
    landmark?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}