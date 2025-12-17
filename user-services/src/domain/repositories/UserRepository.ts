import { User } from '../entities/User';

export interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByUserId(userId: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(userId: string): Promise<void>;
  findAll(): Promise<User[]>;
}