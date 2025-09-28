import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { ProjectWork, ProjectWorkComment } from "src/features/journal/types/ProjectWork.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import axios from "axios";

interface WorkVersion {
    versionNumber: number;
    createdAt: string;
}

export class WorksStore {
    private apiClient = new ApiClient();
    works: ProjectWork[] = [];
    worksForm: ProjectWork[] = [];
    workComments: ProjectWorkComment[] = [];
    loading = false;
    currentWorkVersion = 1;
    allWorks = [];

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
                    (work.status === "IN_PROGRESS" || work.status === "READY_TO_CHECK") &&
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
            .filter((work) => work.status === "DONE")
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

    async fetchWorkComments(workId: string) {
        this.loading = true;
        const response = await this.apiClient.get<ProjectWorkComment[]>(
            endpoints.projectWorkComments + `/search?workId=${workId}`,
        );
        if (response.status) {
            this.workComments = response.data;
        }
        this.loading = false;
    }

    async fetchWorkCommentsCount(workId: string) {
        const response = await this.apiClient.get<ProjectWorkComment[]>(
            endpoints.projectWorkComments + `/search?workId=${workId}`,
        );
        if (response.status) {
            return response.data.length;
        }
        return 0;
    }

    async createComment(comment: Partial<ProjectWorkComment>) {
        this.loading = true;
        await this.apiClient.post<ProjectWorkComment>(endpoints.projectWorkComments, comment);
        await this.fetchWorkComments(comment?.workId ?? "");
        this.loading = false;
    }

    async fetchAllWorks() {
        const response = await axios.get(endpoints.projectWorks);
        this.allWorks = response.data;
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

    async updateWork(work: ProjectWork) {
        this.loading = true;
        const response = await this.apiClient.put<ProjectWork>(endpoints.projectWorks, work);
        if (response.status) {
            await this.fetchWorks(work.projectId);
            this.loading = false;
            return true;
        }
        this.loading = false;
    }

    async changeStatus(work: ProjectWork) {
        this.loading = true;
        const response = await this.apiClient.patch<ProjectWork>(
            endpoints.projectWorks + `/${work.id}/status?status=${work.status}`,
        );
        if (response.status) {
            await this.fetchWorks(work.projectId);
            this.loading = false;
            snackbarStore.showNeutralPositiveSnackbar("Изменения сохранены");
            return true;
        }
        this.loading = false;
    }

    async saveWorksForm() {
        this.loading = true;
        this.worksForm.forEach((work) => {
            if (work.status === "READY_TO_CHECK") {
                work.status = "ON_CHECK";
            }
            work.stages.forEach((stage) => {
                if (stage.status === "READY_TO_CHECK") {
                    stage.status = "ON_CHECK";

                    stage.date = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                }
            });
        });

        let hasScheduleChanges = false;
        for (const workForm of this.worksForm) {
            const work = this.works.find((w) => w.id === workForm.id);
            if (!work || !workForm) {
                continue;
            }
            const workVersion = work.workVersions[this.currentWorkVersion - 1];
            const workFormVersion = workForm.workVersions[this.currentWorkVersion - 1];
            if (
                workVersion.startDate !== workFormVersion.startDate ||
                workVersion.endDate !== workFormVersion.endDate
            ) {
                hasScheduleChanges = true;
            }
        }
        console.log(hasScheduleChanges);

        for (const work of this.worksForm) {
            if (
                deepEquals(
                    work,
                    this.works.find((w) => w.id === work.id),
                )
            ) {
                continue;
            }
            const clonedWork = deepCopy(work);
            clonedWork.stages.forEach((stage) => {
                (stage as any).id = null;
            });
            await this.apiClient.put(endpoints.projectWorks, clonedWork);
        }
        await this.fetchWorks(this.worksForm[0]?.projectId || this.works[0]?.projectId);
        this.loading = false;
    }
}
