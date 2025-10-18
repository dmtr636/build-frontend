import { makeAutoObservable } from "mobx";
import dayjs from "dayjs";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import {
    CheckListInstance,
    ProjectWork,
    ProjectWorkComment,
} from "src/features/journal/types/ProjectWork.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { ConstructionWorkStage } from "src/features/registry/types.ts";
import { Material } from "src/features/journal/pages/MaterialsPage/Material.ts";
import { Visit } from "src/features/journal/pages/VisitsPage/Visit.ts";
import { ProjectViolationCommentDTO } from "src/features/journal/types/Violation.ts";

export class OfflineStore {
    isOnline: boolean = true;
    apiClient = new ApiClient();

    constructor() {
        makeAutoObservable(this);
    }

    init() {
        const lastSyncDate = localStorage.getItem("lastSyncDate");
        if (lastSyncDate) {
            if (dayjs().diff(dayjs(lastSyncDate), "minute") > 30) {
                this.fetchAllData();
            }
        } else {
            this.fetchAllData();
        }
    }

    async fetchAllData() {
        await wait(1000);
        const objectsResponse = await this.apiClient.get<ObjectDTO[]>(endpoints.projects);
        if (!objectsResponse.status) {
            return;
        }
        for (const object of objectsResponse.data) {
            const worksResponse = await this.apiClient.get<ProjectWork[]>(
                endpoints.projectWorks + `/search?projectId=${object.id}`,
            );
            if (!worksResponse.status) {
                continue;
            }
            await this.apiClient.get<Material[]>(
                endpoints.projectMaterials + `/search?projectId=${object.id}`,
            );
            await this.apiClient.get<Visit[]>(
                endpoints.projectVisits + `/search?projectId=${object.id}`,
            );
            await this.apiClient.get<CheckListInstance[]>(
                endpoints.projectChecklists + `/${object.id}?type=DAILY`,
            );
            await this.apiClient.get<CheckListInstance[]>(
                endpoints.projectChecklists + `/${object.id}?type=OPENING`,
            );
            for (const work of worksResponse.data) {
                await this.apiClient.get<ConstructionWorkStage[]>(
                    endpoints.dictionaries.constructionWorkStages + `/search?workId=${work.id}`,
                );
                await this.apiClient.get<ProjectWorkComment[]>(
                    endpoints.projectWorkComments + `/search?workId=${work.id}`,
                );
            }
            const violationsResponse = await this.apiClient.get<Visit[]>(
                endpoints.violations + `/search?projectId=${object.id}`,
            );
            if (!violationsResponse.status) {
                continue;
            }
            for (const violation of violationsResponse.data) {
                await this.apiClient.get<ProjectViolationCommentDTO[]>(
                    endpoints.projectViolationsComments + `/search?violationId=${violation.id}`,
                );
            }
            await wait(100);
        }
        localStorage.setItem("lastSyncDate", dayjs().toISOString());
    }

    handleOnline() {}
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
