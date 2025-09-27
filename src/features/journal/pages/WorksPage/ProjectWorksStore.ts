import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";

interface WorkVersion {
    versionNumber: number;
    createdAt: string;
}

export class WorksStore {
    private apiClient = new ApiClient();
    works: ProjectWork[] = [];
    worksForm: ProjectWork[] = [];
    loading = false;
    currentWorkVersion = 1;

    constructor() {
        makeAutoObservable(this);
    }

    get workVersions() {
        const versions: WorkVersion[] = [];
        this.works.forEach((work) => {
            work.workVersions.forEach((workVersion) => {
                if (
                    !versions.some((version) => version.versionNumber === workVersion.versionNumber)
                ) {
                    versions.push({
                        versionNumber: workVersion.versionNumber,
                        createdAt: workVersion.createdAt,
                    });
                }
            });
        });
        return versions;
    }

    get worksFormOnCheck() {
        return this.worksForm
            .filter(
                (work) =>
                    work.status === "ON_CHECK" ||
                    work.stages.some((stage) => stage.status === "ON_CHECK"),
            )
            .slice()
            .sort((a, b) =>
                a.workVersions[
                    Math.min(a.workVersions.length, this.currentWorkVersion) - 1
                ].startDate.localeCompare(
                    b.workVersions[Math.min(b.workVersions.length, this.currentWorkVersion) - 1]
                        .startDate,
                ),
            );
    }

    get worksFormInProgress() {
        return this.worksForm
            .filter(
                (work) =>
                    work.status === "IN_PROGRESS" &&
                    !work.stages.some((stage) => stage.status === "ON_CHECK"),
            )
            .slice()
            .sort((a, b) =>
                a.workVersions[
                    Math.min(a.workVersions.length, this.currentWorkVersion) - 1
                ].startDate.localeCompare(
                    b.workVersions[Math.min(b.workVersions.length, this.currentWorkVersion) - 1]
                        .startDate,
                ),
            );
    }

    get finishedWorksForm() {
        return this.worksForm
            .filter((work) => work.status === "FINISHED")
            .slice()
            .sort((a, b) =>
                a.workVersions[
                    Math.min(a.workVersions.length, this.currentWorkVersion) - 1
                ].startDate.localeCompare(
                    b.workVersions[Math.min(b.workVersions.length, this.currentWorkVersion) - 1]
                        .startDate,
                ),
            );
    }

    get worksMap() {
        return new Map(this.works.map((work) => [work.id, work]));
    }

    get worksFormMap() {
        return new Map(this.worksForm.map((work) => [work.id, work]));
    }

    async fetchWorks(projectId: string) {
        this.loading = true;
        const response = await this.apiClient.get<ProjectWork[]>(
            endpoints.projectWorks + `/search?projectId=${projectId}`,
        );
        if (response.status) {
            this.works = response.data;
            this.worksForm = deepCopy(response.data);
        }
        this.loading = false;
    }

    async createWork(work: Partial<ProjectWork>) {
        this.loading = true;
        const response = await this.apiClient.post<ProjectWork>(endpoints.projectWorks, {
            ...work,
            workVersion: {
                ...work.workVersion,
                workId: undefined,
                versionNumber: undefined,
            },
            stages: work.stages?.map((stage) => ({
                ...stage,
                id: null,
            })),
            status: "IN_PROGRESS",
        });
        if (response.status) {
            this.works.push(response.data);
            this.worksForm.push(deepCopy(response.data));
            this.loading = false;
            return true;
        }
        this.loading = false;
    }
}
