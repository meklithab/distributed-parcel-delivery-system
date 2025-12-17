import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
export declare class PrismaUserRepository implements UserRepository {
    create(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByUserId(userId: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    update(user: User): Promise<User>;
    delete(userId: string): Promise<void>;
    findAll(): Promise<User[]>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map