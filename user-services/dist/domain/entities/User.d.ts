import { UserRole } from '../enums/UserRole';
export interface User {
    userId: string;
    email: string;
    phoneNumber: string;
    userRole: UserRole;
    passwordHash: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    profileImageUrl?: string;
}
//# sourceMappingURL=User.d.ts.map