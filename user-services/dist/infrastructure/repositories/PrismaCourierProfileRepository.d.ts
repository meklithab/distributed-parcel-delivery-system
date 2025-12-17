import { CourierProfile } from '../../domain/entities/CourierProfile';
import { CourierProfileRepository } from '../../domain/repositories/CourierProfileRepository';
export declare class PrismaCourierProfileRepository implements CourierProfileRepository {
    create(profile: CourierProfile): Promise<CourierProfile>;
    findByUserId(userId: string): Promise<CourierProfile | null>;
    update(profile: CourierProfile): Promise<CourierProfile>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaCourierProfileRepository.d.ts.map