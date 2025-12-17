import { UserRepository } from '../../domain/repositories/UserRepository';
import { CourierProfileRepository } from '../../domain/repositories/CourierProfileRepository';
import { UserProfileResponseDTO, UpdateUserProfileRequestDTO, CourierProfileRequestDTO, CourierProfileResponseDTO, UpdateCourierAvailabilityRequestDTO } from '../dtos/UserDTOs';
export declare class UserService {
    private userRepository;
    private courierProfileRepository;
    constructor(userRepository: UserRepository, courierProfileRepository: CourierProfileRepository);
    getUserProfile(userId: string): Promise<UserProfileResponseDTO>;
    updateUserProfile(userId: string, updateData: UpdateUserProfileRequestDTO): Promise<UserProfileResponseDTO>;
    createCourierProfile(userId: string, profileData: CourierProfileRequestDTO): Promise<CourierProfileResponseDTO>;
    updateCourierAvailability(userId: string, availabilityData: UpdateCourierAvailabilityRequestDTO): Promise<void>;
    getCourierProfile(userId: string): Promise<CourierProfileResponseDTO>;
    private mapCourierProfileToDTO;
}
//# sourceMappingURL=UserService.d.ts.map