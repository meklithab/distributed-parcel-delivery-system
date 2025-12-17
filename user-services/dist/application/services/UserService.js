"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const uuid_1 = require("uuid");
class UserService {
    constructor(userRepository, courierProfileRepository) {
        this.userRepository = userRepository;
        this.courierProfileRepository = courierProfileRepository;
    }
    async getUserProfile(userId) {
        const user = await this.userRepository.findByUserId(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            userId: user.userId,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    async updateUserProfile(userId, updateData) {
        const user = await this.userRepository.findByUserId(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (updateData.firstName !== undefined)
            user.firstName = updateData.firstName;
        if (updateData.lastName !== undefined)
            user.lastName = updateData.lastName;
        if (updateData.dateOfBirth !== undefined)
            user.dateOfBirth = updateData.dateOfBirth;
        if (updateData.profileImageUrl !== undefined)
            user.profileImageUrl = updateData.profileImageUrl;
        user.updatedAt = new Date();
        const updatedUser = await this.userRepository.update(user);
        return {
            userId: updatedUser.userId,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            dateOfBirth: updatedUser.dateOfBirth,
            profileImageUrl: updatedUser.profileImageUrl,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
    }
    async createCourierProfile(userId, profileData) {
        const user = await this.userRepository.findByUserId(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const existingProfile = await this.courierProfileRepository.findByUserId(userId);
        if (existingProfile) {
            throw new Error('Courier profile already exists');
        }
        const newProfile = {
            courierProfileId: (0, uuid_1.v4)(),
            userId: userId,
            idNumber: profileData.idNumber,
            hireDate: profileData.hireDate,
            employmentType: profileData.employmentType,
            status: 'AVAILABLE',
            rating: 0,
            totalDeliveriesCompleted: 0,
            isOnline: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const createdProfile = await this.courierProfileRepository.create(newProfile);
        return this.mapCourierProfileToDTO(createdProfile);
    }
    async updateCourierAvailability(userId, availabilityData) {
        const profile = await this.courierProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Courier profile not found');
        }
        if (availabilityData.isOnline !== undefined)
            profile.isOnline = availabilityData.isOnline;
        if (availabilityData.status !== undefined)
            profile.status = availabilityData.status;
        profile.updatedAt = new Date();
        await this.courierProfileRepository.update(profile);
    }
    async getCourierProfile(userId) {
        const profile = await this.courierProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Courier profile not found');
        }
        return this.mapCourierProfileToDTO(profile);
    }
    mapCourierProfileToDTO(profile) {
        return {
            courierProfileId: profile.courierProfileId,
            userId: profile.userId,
            idNumber: profile.idNumber,
            hireDate: profile.hireDate,
            employmentType: profile.employmentType,
            status: profile.status,
            rating: profile.rating,
            totalDeliveriesCompleted: profile.totalDeliveriesCompleted,
            onTimeDeliveryRate: profile.onTimeDeliveryRate,
            isOnline: profile.isOnline,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map