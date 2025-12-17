import { CourierProfile } from '../../domain/entities/CourierProfile';
import { CourierProfileRepository } from '../../domain/repositories/CourierProfileRepository';
import prisma from '../database/prismaClient';
import { EmploymentType, CourierStatus } from '@prisma/client'; // Assuming these are generated

export class PrismaCourierProfileRepository implements CourierProfileRepository {
  async create(profile: CourierProfile): Promise<CourierProfile> {
    const created = await prisma.courierProfile.create({
      data: {
        courier_profile_id: profile.courierProfileId,
        user_id: profile.userId,
        id_number: profile.idNumber,
        hire_date: profile.hireDate,
        employment_type: profile.employmentType as EmploymentType,
        status: profile.status as CourierStatus,
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

  async findByUserId(userId: string): Promise<CourierProfile | null> {
    const profile = await prisma.courierProfile.findUnique({
      where: { user_id: userId },
    });
    return profile ? this.mapToDomain(profile) : null;
  }

  async update(profile: CourierProfile): Promise<CourierProfile> {
    const updated = await prisma.courierProfile.update({
      where: { courier_profile_id: profile.courierProfileId },
      data: {
        id_number: profile.idNumber,
        hire_date: profile.hireDate,
        employment_type: profile.employmentType as EmploymentType,
        status: profile.status as CourierStatus,
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

  private mapToDomain(prismaProfile: any): CourierProfile {
    return {
      courierProfileId: prismaProfile.courier_profile_id,
      userId: prismaProfile.user_id,
      idNumber: prismaProfile.id_number,
      hireDate: prismaProfile.hire_date,
      employmentType: prismaProfile.employment_type as any,
      status: prismaProfile.status as any,
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
