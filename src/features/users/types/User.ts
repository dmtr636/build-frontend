export interface User {
    id: string;
    login: string;
    password?: string;
    role: string;
    enabled?: boolean;
    position?: string;
    name?: string;
    imageId?: string;
    createDate?: string;
    updateDate?: string;
    info?: Record<string, unknown>;
}
