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
}
