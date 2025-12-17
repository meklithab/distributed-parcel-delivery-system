import { CourierProfile } from '../entities/CourierProfile';

export interface CourierProfileRepository {
  create(profile: CourierProfile): Promise<CourierProfile>;
  findByUserId(userId: string): Promise<CourierProfile | null>;
  update(profile: CourierProfile): Promise<CourierProfile>;
}
