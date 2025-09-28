import { User } from "src/features/users/types/User.ts";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";

export interface Visit {
    id: string;
    projectId: string;
    user: User;
    visitDate: string;
    violations: ProjectViolationDTO[];
    works: ProjectWork[];
    createdAt: string;
    updatedAt: string;
}
