import { FileDto } from "src/features/journal/types/Object.ts";

export interface ProjectWork {
    id: string;
    projectId: string;
    name: string;
    status: string;
    workVersion: ProjectWorkVersion;
    workVersions: ProjectWorkVersion[];
    completionPercent: number;
    plannedVolume: number | null;
    actualVolume: number | null;
    volumeUnit: string;
    stages: ProjectWorkStage[];
}

export interface ProjectWorkVersion {
    id?: string;
    workId: string;
    versionNumber: number;
    startDate: string;
    endDate: string;
    active: boolean;
    createdAt: string;
}

export interface ProjectWorkStage {
    id: string;
    name: string;
    orderNumber: number;
    status: string;
    date: string | null;
}

export interface ProjectWorkComment {
    text: string;
    authorId: string;
    workId: string;
    files: FileDto[];
    createdAt: string;
    updatedAt: string;
}
