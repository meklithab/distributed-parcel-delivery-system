"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prismaClient_1 = __importDefault(require("../database/prismaClient"));
class PrismaUserRepository {
    async create(user) {
        const createdUser = await prismaClient_1.default.user.create({
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
    async findByEmail(email) {
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        return user ? this.mapToDomain(user) : null;
    }
    async findByUserId(userId) {
        const user = await prismaClient_1.default.user.findUnique({ where: { user_id: userId } });
        return user ? this.mapToDomain(user) : null;
    }
    async findByPhoneNumber(phoneNumber) {
        const user = await prismaClient_1.default.user.findUnique({ where: { phone_number: phoneNumber } });
        return user ? this.mapToDomain(user) : null;
    }
    async update(user) {
        const updatedUser = await prismaClient_1.default.user.update({
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
                updated_at: new Date(),
                last_login_at: user.lastLoginAt,
                profile_image_url: user.profileImageUrl,
            },
        });
        return this.mapToDomain(updatedUser);
    }
    async delete(userId) {
        await prismaClient_1.default.user.delete({ where: { user_id: userId } });
    }
    async findAll() {
        const users = await prismaClient_1.default.user.findMany();
        return users.map((user) => this.mapToDomain(user));
    }
    mapToDomain(prismaUser) {
        return {
            userId: prismaUser.user_id,
            email: prismaUser.email,
            phoneNumber: prismaUser.phone_number,
            userRole: prismaUser.user_role,
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
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=PrismaUserRepository.js.map