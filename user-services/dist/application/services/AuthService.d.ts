import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserSessionRepository } from '../../domain/repositories/UserSessionRepository';
import { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO, RefreshTokenRequestDTO, LogoutRequestDTO } from '../dtos/AuthDTOs';
export declare class AuthService {
    private userRepository;
    private userSessionRepository;
    constructor(userRepository: UserRepository, userSessionRepository: UserSessionRepository);
    register(dto: RegisterRequestDTO): Promise<AuthResponseDTO>;
    login(dto: LoginRequestDTO): Promise<AuthResponseDTO>;
    refresh(dto: RefreshTokenRequestDTO): Promise<{
        accessToken: string;
    }>;
    logout(dto: LogoutRequestDTO): Promise<void>;
    private generateAuthResponse;
    private hashToken;
}
//# sourceMappingURL=AuthService.d.ts.map