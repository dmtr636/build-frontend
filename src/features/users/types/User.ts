export interface User {
    id: string;
    login: string;
    password?: string;
    role: string;
    enabled?: boolean;
    position?: string;
    name?: string;
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
    imageId?: string;
    createDate?: string;
    updateDate?: string;
    info?: Record<string, unknown>;
}
