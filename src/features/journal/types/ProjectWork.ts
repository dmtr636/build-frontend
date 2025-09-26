export interface ProjectWork {
    id: string;
    projectId: string;
    name: string;
    status: string;
    workVersion: ProjectWorkVersion;
    workVersions: ProjectWorkVersion[];
    completionPercent: number;
    plannedVolume: number;
    actualVolume: string;
    volumeUnit: string;
    stages: ProjectWorkStage[];
}

export interface ProjectWorkVersion {
    workId: string;
    versionNumber: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

export interface ProjectWorkStage {
    id: string;
    name: string;
    orderNumber: number;
    status: string;
    date: string;
}
