
export enum UserRoles {
    NO_ROLE = 0,
    ADMIN = 3
}

export enum UserStatus {
    PROCESSING = 0,
    VERIFIED = 1,
    REQUEST = 2,
    BANNED = 3,
}

export interface UserSession {
    name: string;
    email: string;
    rol: number;
    userStatus: number;
    isTwoFactorEnabled: boolean;
    accessToken: string;
}
