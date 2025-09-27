import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";
import { endpoints } from "src/shared/api/endpoints.ts";

export class WorksStore {
    private apiClient = new ApiClient();
    works: ProjectWork[] = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get worksOnCheck() {
        return this.works.filter(
            (work) =>
                work.status === "ON_CHECK" ||
                work.stages.some((stage) => stage.status === "ON_CHECK"),
        );
    }

    get worksInProgress() {
        return this.works.filter(
            (work) =>
                work.status === "IN_PROGRESS" &&
                !work.stages.some((stage) => stage.status === "ON_CHECK"),
        );
    }

    get finishedWorks() {
        return this.works.filter((work) => work.status === "FINISHED");
    }

    async fetchWorks(projectId: string) {
        this.loading = true;
        const response = await this.apiClient.get<ProjectWork[]>(
            endpoints.projectWorks + `/search?projectId=${projectId}`,
        );
        if (response.status) {
            this.works = response.data;
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
            this.loading = false;
            return true;
        }
        this.loading = false;
    }
}
