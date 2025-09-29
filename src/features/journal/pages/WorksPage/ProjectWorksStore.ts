import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import {
    CheckListInstance,
    ProjectWork,
    ProjectWorkComment,
} from "src/features/journal/types/ProjectWork.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import axios from "axios";
import dayjs from "dayjs";

interface WorkVersion {
    versionNumber: number;
    createdAt: string;
}

const CHECKLISTS = {
    SAFE: "1. Соблюдение требований безлпастности труда. Культура производства",
    CURB: "2. Производство работ по устройству бордюрных камней",
    CONCRETE_ROAD: "3. Бетонные работы. Устройство бетонных дорог",
    ASPHALT: "4. Асфальтобетонные дороги, тротуары из асфальтобетонного покрытия",
    PAVER: "5. Устройство тротуара из тротуарной плитки",
} as const;

function getChecklistTitles(works: string[]): string[] {
    // Нормализуем к массиву названий
    const names = works.filter(Boolean).map((s) => s.toLowerCase());

    // Флаги по найденным типам работ
    let hasCurb = false;
    let hasAsphalt = false;
    let hasConcreteRoad = false;
    let hasPaver = false;

    for (const name of names) {
        const isCurb =
            /бордюр|бортов(ой|ого|ый|ые|ых)|бортов\w* камн/.test(name) ||
            /садов(ый|ого)\s+бортов(ой|ого)\s+камн/.test(name);
        const isAsphalt = /асфальтобетон/.test(name);
        const isPaver = /тротуарн\w*\s+плитк/.test(name) || /брусчатк/.test(name);

        // бетонная дорога/покрытие, но не асфальтобетон
        const hasWordConcrete = /бетон/.test(name) && !/асфальто?бетон/.test(name);
        const mentionsRoadOrCover = /дорог|покрыт/.test(name);
        const isConcreteRoad = hasWordConcrete && mentionsRoadOrCover;

        hasCurb ||= isCurb;
        hasAsphalt ||= isAsphalt;
        hasPaver ||= isPaver;
        hasConcreteRoad ||= isConcreteRoad;
    }

    // Собираем список чек-листов в нужном порядке
    const result: string[] = [CHECKLISTS.SAFE];
    if (hasCurb) result.push(CHECKLISTS.CURB);
    if (hasConcreteRoad) result.push(CHECKLISTS.CONCRETE_ROAD);
    if (hasAsphalt) result.push(CHECKLISTS.ASPHALT);
    if (hasPaver) result.push(CHECKLISTS.PAVER);

    // Если ничего специфического не найдено — вернётся только безопасность
    return result;
}

export class WorksStore {
    apiClient = new ApiClient();
    works: ProjectWork[] = [];
    worksForm: ProjectWork[] = [];
    workComments: ProjectWorkComment[] = [];
    loading = false;
    currentWorkVersion = 1;
    allWorks = [];
    changeType = "";
    dailyChecklists: CheckListInstance[] = [];
    dailyChecklistsForm: CheckListInstance[] = [];
    openingChecklists: CheckListInstance[] = [];
    openingChecklistsForm: CheckListInstance[] = [];
    checkListsDay = dayjs().startOf("day");

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

    get checkListTitles() {
        return getChecklistTitles(this.worksForm.map((w) => w.name));
    }

    get worksMap() {
        return new Map(this.works.map((work) => [work.id, work]));
    }

    get worksFormMap() {
        return new Map(this.worksForm.map((work) => [work.id, work]));
    }

    get todayChecklist() {
        return this.dailyChecklists.find((c) =>
            dayjs(c.checkDate).isSame(this.checkListsDay, "day"),
        );
    }

    get todayChecklistForm() {
        return this.dailyChecklistsForm.find((c) =>
            dayjs(c.checkDate).isSame(this.checkListsDay, "day"),
        );
    }

    get todayCheckListSectionsInProgress() {
        return (
            this.todayChecklist?.sections.filter((section) =>
                section.items.some((item) => !item.answer),
            ) ?? []
        );
    }

    get todayCheckListSectionsDone() {
        return (
            this.todayChecklist?.sections.filter((section) =>
                section.items.every((item) => !!item.answer),
            ) ?? []
        );
    }

    get todayCheckListSectionsInProgressForm() {
        return (
            this.todayChecklistForm?.sections.filter((section) =>
                section.items.some(
                    (item) =>
                        !item.answer ||
                        this.todayChecklist?.sections
                            .find((s) => s.title === section.title)
                            ?.items?.find((i) => i.itemNumber === item.itemNumber && !i.answer),
                ),
            ) ?? []
        );
    }

    get todayCheckListSectionsDoneForm() {
        return (
            this.todayChecklistForm?.sections.filter((section) =>
                section.items.every((item) => !!item.answer),
            ) ?? []
        );
    }

    async fetchChecklists(projectId: string) {
        const dailyChecklistsResponse = await this.apiClient.get<CheckListInstance[]>(
            endpoints.projectChecklists + `/${projectId}?type=DAILY`,
        );
        if (dailyChecklistsResponse.status) {
            this.dailyChecklists = dailyChecklistsResponse.data;
        }
        const openingChecklistsResponse = await this.apiClient.get<CheckListInstance[]>(
            endpoints.projectChecklists + `/${projectId}?type=OPENING`,
        );
        if (openingChecklistsResponse.status) {
            this.openingChecklists = openingChecklistsResponse.data;
        }

        if (!this.openingChecklists.length) {
            const newOpeningChecklistsResponse = await this.apiClient.post<CheckListInstance>(
                endpoints.projectChecklists + `/${projectId}/submit?type=OPENING`,
                [],
            );
            if (newOpeningChecklistsResponse.status) {
                this.openingChecklists.push(newOpeningChecklistsResponse.data);
            }
        } else {
            if (
                !this.dailyChecklists.length ||
                !this.dailyChecklists.some((c) => dayjs(c.checkDate).isSame(dayjs(), "day"))
            ) {
                const newDailyChecklistResponse = await this.apiClient.post<CheckListInstance>(
                    endpoints.projectChecklists + `/${projectId}/submit?type=DAILY`,
                    [],
                );
                if (newDailyChecklistResponse.status) {
                    this.dailyChecklists.push(newDailyChecklistResponse.data);
                }
            }
        }
        this.dailyChecklistsForm = deepCopy(this.dailyChecklists);
        this.openingChecklistsForm = deepCopy(this.openingChecklists);
    }

    async fetchWorks(projectId: string, setVersion = false) {
        this.loading = true;
        const response = await this.apiClient.get<ProjectWork[]>(
            endpoints.projectWorks + `/search?projectId=${projectId}`,
        );
        let activeVersion = 1;
        if (response.status) {
            response.data.forEach((item) => {
                item.workVersions.sort((a, b) => a.versionNumber - b.versionNumber);
                item.workVersions.forEach((workVersion) => {
                    if (workVersion.active && workVersion.versionNumber >= activeVersion) {
                        activeVersion = workVersion.versionNumber;
                    }
                });
            });
            if (setVersion) {
                this.currentWorkVersion = activeVersion;
            }
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

        if (hasScheduleChanges) {
            for (const workForm of this.worksForm) {
                const workFormVersion = workForm.workVersions[this.currentWorkVersion - 1];
                await this.apiClient.post(endpoints.projectWorkVersions, {
                    workId: workForm.id,
                    startDate: workFormVersion.startDate,
                    endDate: workFormVersion.endDate,
                    active: false,
                });
            }
            await this.fetchWorks(this.worksForm[0]?.projectId || this.works[0]?.projectId);
            for (const workForm of this.worksForm) {
                const work = this.works.find((w) => w.id === workForm.id);
                if (!work || !workForm) {
                    continue;
                }
                workForm.workVersion = deepCopy(work.workVersion);
                workForm.workVersions = deepCopy(work.workVersions);
            }
        }

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

    async deleteDisabledWorkVersions() {
        for (const workForm of this.worksForm) {
            const workFormVersion = workForm.workVersions[this.currentWorkVersion - 1];
            if (!workFormVersion.active && workFormVersion.id) {
                await this.apiClient.delete(endpoints.projectWorkVersions, workFormVersion.id);
            }
        }
        await this.fetchWorks(this.worksForm[0]?.projectId ?? "", true);
    }

    async acceptNewWorkVersion() {
        for (const workForm of this.worksForm) {
            const workFormVersion = workForm.workVersions[this.currentWorkVersion - 1];
            if (!workFormVersion.active && workFormVersion.id) {
                await this.apiClient.put(endpoints.projectWorkVersions, {
                    ...workFormVersion,
                    active: true,
                });
            }
        }
        await this.fetchWorks(this.worksForm[0]?.projectId ?? "", true);
    }
}
