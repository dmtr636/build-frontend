import { FileDto } from "src/features/journal/types/Object.ts";
import { User } from "src/features/users/types/User.ts";

export type ProjectViolationCommentDTO = {
    id: string;
    text: string;
    authorId: string;
    createdAt: string; // date-time
    updatedAt: string; // date-time
    violationId: string;
    files: FileDto[];
};

export type ProjectViolationStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type ProjectViolationDTO = {
    id: string;
    projectId: string;
    name: string;
    dueDate: string | null; // date
    violationTime: string; // date-time
    status: ProjectViolationStatus;
    category: string;
    kind: string;
    severityType: string;
    isNote: boolean;
    latitude: number;
    longitude: number;
    files: FileDto[];
    photos: FileDto[];
    comments: ProjectViolationCommentDTO[];
    author: User;
    assignee: User;
    createdAt: string; // date-time
    updatedAt: string; // date-time
    normativeDocuments: { id: string; regulation?: string; name?: string }[];
};
