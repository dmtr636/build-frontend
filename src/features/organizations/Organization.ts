import { User } from "src/features/users/types/User.ts";

export interface Organization {
    id: string;
    name: string;
    employees: User[];
    imageId: string | null;
    createdAt: string;
}
