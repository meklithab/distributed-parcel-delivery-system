export interface RegisterRequestDTO {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
}
export interface LoginRequestDTO {
    email: string;
    password: string;
}
export interface AuthResponseDTO {
    accessToken: string;
    refreshToken: string;
    user: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        userRole: string;
    };
}
export interface RefreshTokenRequestDTO {
    refreshToken: string;
}
export interface LogoutRequestDTO {
    refreshToken: string;
}
//# sourceMappingURL=AuthDTOs.d.ts.map