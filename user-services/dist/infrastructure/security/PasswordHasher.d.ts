export declare class PasswordHasher {
    private static readonly SALT_ROUNDS;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=PasswordHasher.d.ts.map