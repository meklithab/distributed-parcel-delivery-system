export interface CustomerProfile {
    customerProfileId: string;
    userId: string;
    preferredNotificationMethod: 'EMAIL' | 'SMS' | 'CALL';
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}