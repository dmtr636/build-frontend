export interface User {
    id: string;
    login: string;
    password?: string;
    role: "ROOT" | "ADMIN" | "USER";
    enabled: boolean;
    position?: string;
    name?: string;
    lastName?: string;
    firstName?: string;
    patronymic?: string;
    messenger?: string;
    email?: string;
    workPhone?: string;
    personalPhone?: string;
    imageId?: string;
    createDate: string; // ISO date-time
    updateDate: string; // ISO date-time
    info?: Record<string, unknown>;
}

export interface UserOnline {
    status: "online" | "offline";
    date: string;
}

export type UserOnlineMap = Record<string, UserOnline>;
