import { makeAutoObservable } from "mobx";
import {
    ConstructionViolation,
    ConstructionWork,
    ConstructionWorkStage,
    NormativeDocument,
} from "src/features/registry/types.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";

export class RegistryStore {
    documentsSearch = "";
    documents: NormativeDocument[] = [];
    documentsTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "statement", "name"],
        columnWidths: {},
    };
    documentsForm: Partial<NormativeDocument> = {};
    editingDocument: NormativeDocument | null = null;
    deletingDocument: NormativeDocument | null = null;
    showAddOverlay = false;

    violationsSearch = "";
    violations: ConstructionViolation[] = [];
    violationsTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "category", "kind", "severityType", "name", "remediationDueDays"],
        columnWidths: {},
    };
    violationsForm: Partial<ConstructionViolation> = {};
    editingViolation: ConstructionViolation | null = null;
    deletingViolation: ConstructionViolation | null = null;
    addedViolationCategory = "";
    violationFilter: Record<string, string[]> = {
        category: [],
        kind: [],
        severityType: [],
    };

    worksSearch = "";
    works: ConstructionWork[] = [];
    workStages: ConstructionWorkStage[] = [];
    worksTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "name", "unit", "classificationCode"],
        columnWidths: {},
    };
    worksForm: Partial<ConstructionWork> = {};
    worksStagesForm: ConstructionWorkStage[] = [];
    editingWork: ConstructionWork | null = null;
    deletingWork: ConstructionWork | null = null;
    addedWorkCode = "";

    loading = false;
    apiClient = new ApiClient();

    constructor() {
        makeAutoObservable(this);
    }

    get violationCategories() {
        const set = new Set(this.violations.map((v) => v.category).filter(Boolean) as string[]);
        if (this.addedViolationCategory) {
            set.add(this.addedViolationCategory);
        }
        return [...set];
    }

    get violationKinds() {
        const set = new Set(this.violations.map((v) => v.kind).filter(Boolean) as string[]);
        return [...set];
    }

    get violationTypes() {
        const set = new Set(this.violations.map((v) => v.severityType).filter(Boolean) as string[]);
        return [...set];
    }

    get worksCodes() {
        const set = new Set(
            this.works.map((v) => v.classificationCode).filter(Boolean) as string[],
        );
        if (this.addedWorkCode) {
            set.add(this.addedWorkCode);
        }
        return [...set];
    }

    get worksUnits() {
        const set = new Set(this.works.map((v) => v.unit).filter(Boolean) as string[]);
        return [...set];
    }

    get filteredDocuments() {
        let documents = this.documents.slice();
        if (this.documentsSearch) {
            documents = documents.filter((document) => {
                return (
                    document.name
                        .toLowerCase()
                        .includes(this.documentsSearch.trim().toLowerCase()) ||
                    document.regulation
                        .toLowerCase()
                        .includes(this.documentsSearch.trim().toLowerCase())
                );
            });
        }
        return documents;
    }

    get hasActiveViolationsFilters() {
        return !!(
            this.violationFilter.category?.length ||
            this.violationFilter.kind?.length ||
            this.violationFilter.severityType?.length
        );
    }

    get filteredViolations() {
        let violations = this.violations.slice();
        if (this.violationsSearch) {
            violations = violations.filter((violation) => {
                return (
                    violation.name
                        .toLowerCase()
                        .includes(this.violationsSearch.trim().toLowerCase()) ||
                    violation.kind
                        .toLowerCase()
                        .includes(this.violationsSearch.trim().toLowerCase()) ||
                    violation.category
                        ?.toLowerCase()
                        .includes(this.violationsSearch.trim().toLowerCase()) ||
                    violation.severityType
                        .toLowerCase()
                        .includes(this.violationsSearch.trim().toLowerCase())
                );
            });
        }
        if (this.violationFilter.category?.length) {
            violations = violations.filter((violation) =>
                this.violationFilter.category.includes(violation.category),
            );
        }
        if (this.violationFilter.kind?.length) {
            violations = violations.filter((violation) =>
                this.violationFilter.kind.includes(violation.kind),
            );
        }
        if (this.violationFilter.severityType?.length) {
            violations = violations.filter((violation) =>
                this.violationFilter.severityType.includes(violation.severityType),
            );
        }
        return violations;
    }

    get filteredWorks() {
        let works = this.works.slice();
        if (this.worksSearch) {
            works = works.filter((work) => {
                return (
                    work.name.toLowerCase().includes(this.worksSearch.trim().toLowerCase()) ||
                    work.classificationCode
                        ?.toLowerCase()
                        .includes(this.worksSearch.trim().toLowerCase())
                );
            });
        }
        return works;
    }

    get documentsMap() {
        return new Map(this.documents.map((document) => [document.id, document]));
    }

    get violationsMap() {
        return new Map(this.violations.map((violation) => [violation.id, violation]));
    }

    get worksMap() {
        return new Map(this.works.map((work) => [work.id, work]));
    }

    get worksNameMap() {
        return new Map(this.works.map((work) => [work.name, work]));
    }

    async fetchAllDocuments() {
        this.loading = true;
        const response = await this.apiClient.get<NormativeDocument[]>(
            endpoints.dictionaries.normativeDocuments,
        );
        if (response.status) {
            this.documents = response.data;
        }
        this.loading = false;
    }

    async fetchAllViolations() {
        this.loading = true;
        const response = await this.apiClient.get<ConstructionViolation[]>(
            endpoints.dictionaries.constructionViolations,
        );
        if (response.status) {
            this.violations = response.data;
        }
        this.loading = false;
    }

    async fetchAllWorks() {
        this.loading = true;
        const response = await this.apiClient.get<ConstructionWork[]>(
            endpoints.dictionaries.constructionWorks,
        );
        if (response.status) {
            this.works = response.data;
        }
        this.loading = false;
    }

    async fetchStages(workId: string) {
        this.loading = true;
        const response = await this.apiClient.get<ConstructionWorkStage[]>(
            endpoints.dictionaries.constructionWorkStages + `/search?workId=${workId}`,
        );
        if (response.status) {
            this.workStages = response.data;
            this.worksStagesForm = deepCopy(response.data);
        }
        this.loading = false;
    }

    async addDocument(document: Partial<NormativeDocument>) {
        this.loading = true;
        await this.apiClient.post<NormativeDocument>(
            endpoints.dictionaries.normativeDocuments,
            document,
        );
        this.loading = false;
    }

    async updateDocument(document: Partial<NormativeDocument>) {
        this.loading = true;
        await this.apiClient.put<NormativeDocument>(
            endpoints.dictionaries.normativeDocuments,
            document,
        );
        this.loading = false;
    }

    async deleteDocument(document: NormativeDocument) {
        this.loading = true;
        await this.apiClient.delete(endpoints.dictionaries.normativeDocuments, document.id ?? "");
        this.loading = false;
    }

    async addViolation(document: Partial<ConstructionViolation>) {
        this.loading = true;
        await this.apiClient.post<ConstructionViolation>(
            endpoints.dictionaries.constructionViolations,
            document,
        );
        this.loading = false;
    }

    async updateViolation(document: Partial<ConstructionViolation>) {
        this.loading = true;
        await this.apiClient.put<ConstructionViolation>(
            endpoints.dictionaries.constructionViolations,
            document,
        );
        this.loading = false;
    }

    async deleteViolation(document: ConstructionViolation) {
        this.loading = true;
        await this.apiClient.delete(
            endpoints.dictionaries.constructionViolations,
            document.id ?? "",
        );
        this.loading = false;
    }

    async addWork(document: Partial<ConstructionWork>) {
        this.loading = true;
        const response = await this.apiClient.post<ConstructionWork>(
            endpoints.dictionaries.constructionWorks,
            document,
        );
        if (response.status) {
            for (const stage of this.worksStagesForm) {
                await this.apiClient.post<ConstructionWorkStage>(
                    endpoints.dictionaries.constructionWorkStages,
                    {
                        ...stage,
                        stageName: stage.stageName || `Этап ${stage.stageNumber}`,
                        workId: response.data.id,
                    },
                );
            }
        }
        this.loading = false;
    }

    async updateWork(document: Partial<ConstructionWork>) {
        this.loading = true;
        await this.apiClient.put<ConstructionWork>(
            endpoints.dictionaries.constructionWorks,
            document,
        );
        for (const stage of this.worksStagesForm) {
            const found = this.workStages.find((_s) => _s.id === stage.id);
            if (!found) {
                await this.apiClient.post<ConstructionWorkStage>(
                    endpoints.dictionaries.constructionWorkStages,
                    {
                        ...stage,
                        stageName: stage.stageName || `Этап ${stage.stageNumber}`,
                    },
                );
            }
            if (
                found &&
                (found.stageName !== stage.stageName || found.stageNumber !== stage.stageNumber)
            ) {
                await this.apiClient.put<ConstructionWorkStage>(
                    endpoints.dictionaries.constructionWorkStages,
                    {
                        ...stage,
                        stageName: stage.stageName || `Этап ${stage.stageNumber}`,
                    },
                );
            }
        }
        for (const stage of this.workStages) {
            if (!this.worksStagesForm.some((_s) => _s.id === stage.id)) {
                await this.apiClient.delete(
                    endpoints.dictionaries.constructionWorkStages,
                    stage.id,
                );
            }
        }
        this.loading = false;
    }

    async deleteWork(document: ConstructionWork) {
        this.loading = true;
        for (const stage of this.workStages) {
            await this.apiClient.delete(endpoints.dictionaries.constructionWorkStages, stage.id);
        }
        await this.apiClient.delete(endpoints.dictionaries.constructionWorks, document.id ?? "");
        this.loading = false;
    }
}
