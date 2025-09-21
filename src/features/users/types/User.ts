export interface User {
    id: string;
    login: string;
    password?: string;
    role: "ROOT" | "ADMIN" | "USER";
    position?: string | null;
    name?: string;
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
    messenger?: string;
    email?: string;
    workPhone?: string;
    personalPhone?: string;
    imageId?: string;
    organizationId?: string | null;
    createDate?: string; // ISO date-time
    updateDate?: string; // ISO date-time
    info?: Record<string, unknown>;
    company?: string;
}

export interface UserOnline {
    status: "online" | "offline";
    date: string;
}

export type UserOnlineMap = Record<string, UserOnline>;
