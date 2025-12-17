import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import prisma from '../database/prismaClient';
import { UserRole } from '../../domain/enums/UserRole';

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        user_id: user.userId,
        email: user.email,
        phone_number: user.phoneNumber,
        user_role: user.userRole,
        password_hash: user.passwordHash,
        first_name: user.firstName,
        last_name: user.lastName,
        date_of_birth: user.dateOfBirth,
        is_active: user.isActive,
        is_verified: user.isVerified,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        last_login_at: user.lastLoginAt,
        profile_image_url: user.profileImageUrl,
      },
    });
    return this.mapToDomain(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByUserId(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { phone_number: phoneNumber } });
    return user ? this.mapToDomain(user) : null;
  }

  async update(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { user_id: user.userId },
      data: {
        email: user.email,
        phone_number: user.phoneNumber,
        user_role: user.userRole,
        password_hash: user.passwordHash,
        first_name: user.firstName,
        last_name: user.lastName,
        date_of_birth: user.dateOfBirth,
        is_active: user.isActive,
        is_verified: user.isVerified,
        updated_at: new Date(), // Update timestamp
        last_login_at: user.lastLoginAt,
        profile_image_url: user.profileImageUrl,
      },
    });
    return this.mapToDomain(updatedUser);
  }

  async delete(userId: string): Promise<void> {
    await prisma.user.delete({ where: { user_id: userId } });
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map((user) => this.mapToDomain(user));
  }

  private mapToDomain(prismaUser: any): User {
    return {
      userId: prismaUser.user_id,
      email: prismaUser.email,
      phoneNumber: prismaUser.phone_number,
      userRole: prismaUser.user_role as UserRole,
      passwordHash: prismaUser.password_hash,
      firstName: prismaUser.first_name,
      lastName: prismaUser.last_name,
      dateOfBirth: prismaUser.date_of_birth,
      isActive: prismaUser.is_active,
      isVerified: prismaUser.is_verified,
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
      lastLoginAt: prismaUser.last_login_at,
      profileImageUrl: prismaUser.profile_image_url,
    };
  }
}
