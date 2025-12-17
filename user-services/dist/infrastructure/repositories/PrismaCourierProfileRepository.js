"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCourierProfileRepository = void 0;
const prismaClient_1 = __importDefault(require("../database/prismaClient"));
class PrismaCourierProfileRepository {
    async create(profile) {
        const created = await prismaClient_1.default.courierProfile.create({
            data: {
                courier_profile_id: profile.courierProfileId,
                user_id: profile.userId,
                id_number: profile.idNumber,
                hire_date: profile.hireDate,
                employment_type: profile.employmentType,
                status: profile.status,
                rating: profile.rating,
                total_deliveries_completed: profile.totalDeliveriesCompleted,
                on_time_delivery_rate: profile.onTimeDeliveryRate,
                current_latitude: profile.currentLatitude,
                current_longitude: profile.currentLongitude,
                last_location_update: profile.lastLocationUpdate,
                is_online: profile.isOnline,
                created_at: profile.createdAt,
                updated_at: profile.updatedAt,
            },
        });
        return this.mapToDomain(created);
    }
    async findByUserId(userId) {
        const profile = await prismaClient_1.default.courierProfile.findUnique({
            where: { user_id: userId },
        });
        return profile ? this.mapToDomain(profile) : null;
    }
    async update(profile) {
        const updated = await prismaClient_1.default.courierProfile.update({
            where: { courier_profile_id: profile.courierProfileId },
            data: {
                id_number: profile.idNumber,
                hire_date: profile.hireDate,
                employment_type: profile.employmentType,
                status: profile.status,
                rating: profile.rating,
                total_deliveries_completed: profile.totalDeliveriesCompleted,
                on_time_delivery_rate: profile.onTimeDeliveryRate,
                current_latitude: profile.currentLatitude,
                current_longitude: profile.currentLongitude,
                last_location_update: profile.lastLocationUpdate,
                is_online: profile.isOnline,
                updated_at: new Date(),
            },
        });
        return this.mapToDomain(updated);
    }
    mapToDomain(prismaProfile) {
        return {
            courierProfileId: prismaProfile.courier_profile_id,
            userId: prismaProfile.user_id,
            idNumber: prismaProfile.id_number,
            hireDate: prismaProfile.hire_date,
            employmentType: prismaProfile.employment_type,
            status: prismaProfile.status,
            rating: prismaProfile.rating ? Number(prismaProfile.rating) : 0,
            totalDeliveriesCompleted: prismaProfile.total_deliveries_completed || 0,
            onTimeDeliveryRate: prismaProfile.on_time_delivery_rate ? Number(prismaProfile.on_time_delivery_rate) : undefined,
            currentLatitude: prismaProfile.current_latitude ? Number(prismaProfile.current_latitude) : undefined,
            currentLongitude: prismaProfile.current_longitude ? Number(prismaProfile.current_longitude) : undefined,
            lastLocationUpdate: prismaProfile.last_location_update,
            isOnline: prismaProfile.is_online || false,
            createdAt: prismaProfile.created_at,
            updatedAt: prismaProfile.updated_at,
        };
    }
}
exports.PrismaCourierProfileRepository = PrismaCourierProfileRepository;
//# sourceMappingURL=PrismaCourierProfileRepository.js.map