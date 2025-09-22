import { makeAutoObservable } from "mobx";
import {
    ConstructionViolation,
    ConstructionWork,
    NormativeDocument,
} from "src/features/registry/types.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";

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

    worksSearch = "";
    works: ConstructionWork[] = [];
    worksTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "name", "unit", "classificationCode"],
        columnWidths: {},
    };
    worksForm: Partial<ConstructionWork> = {};
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
        await this.apiClient.post<ConstructionWork>(
            endpoints.dictionaries.constructionWorks,
            document,
        );
        this.loading = false;
    }

    async updateWork(document: Partial<ConstructionWork>) {
        this.loading = true;
        await this.apiClient.put<ConstructionWork>(
            endpoints.dictionaries.constructionWorks,
            document,
        );
        this.loading = false;
    }

    async deleteWork(document: ConstructionWork) {
        this.loading = true;
        await this.apiClient.delete(endpoints.dictionaries.constructionWorks, document.id ?? "");
        this.loading = false;
    }
}
