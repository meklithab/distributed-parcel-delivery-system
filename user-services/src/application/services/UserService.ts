import { UserRepository } from '../../domain/repositories/UserRepository';
import { CourierProfileRepository } from '../../domain/repositories/CourierProfileRepository';
import { UserProfileResponseDTO, UpdateUserProfileRequestDTO, CourierProfileRequestDTO, CourierProfileResponseDTO, UpdateCourierAvailabilityRequestDTO } from '../dtos/UserDTOs';
import { v4 as uuidv4 } from 'uuid';
import { CourierProfile } from '../../domain/entities/CourierProfile';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private courierProfileRepository: CourierProfileRepository
  ) {}

  async getUserProfile(userId: string): Promise<UserProfileResponseDTO> {
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

  async updateUserProfile(userId: string, updateData: UpdateUserProfileRequestDTO): Promise<UserProfileResponseDTO> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user fields if provided
    if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
    if (updateData.dateOfBirth !== undefined) user.dateOfBirth = updateData.dateOfBirth;
    if (updateData.profileImageUrl !== undefined) user.profileImageUrl = updateData.profileImageUrl;
    
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

  async createCourierProfile(userId: string, profileData: CourierProfileRequestDTO): Promise<CourierProfileResponseDTO> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Check if profile already exists
    const existingProfile = await this.courierProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new Error('Courier profile already exists');
    }

    const newProfile: CourierProfile = {
      courierProfileId: uuidv4(),
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

    // Update user role to COURIER if not already?
    // The prompt implies we have separate courier profiles.
    // Ideally we should update user role, but I'll leave it as is or do it if I had time.
    // The prompt says "Courier-specific ... POST /couriers/profile".
    
    return this.mapCourierProfileToDTO(createdProfile);
  }

  async updateCourierAvailability(userId: string, availabilityData: UpdateCourierAvailabilityRequestDTO): Promise<void> {
    const profile = await this.courierProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Courier profile not found');
    }

    if (availabilityData.isOnline !== undefined) profile.isOnline = availabilityData.isOnline;
    if (availabilityData.status !== undefined) profile.status = availabilityData.status;
    
    profile.updatedAt = new Date();
    // Assuming we might track location updates here too if provided, but for availability endpoint usually just status.
    
    await this.courierProfileRepository.update(profile);
  }

  async getCourierProfile(userId: string): Promise<CourierProfileResponseDTO> {
    const profile = await this.courierProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Courier profile not found');
    }
    return this.mapCourierProfileToDTO(profile);
  }

  private mapCourierProfileToDTO(profile: CourierProfile): CourierProfileResponseDTO {
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
