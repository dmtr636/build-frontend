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

    violationsSearch = "";
    violations: ConstructionViolation[] = [];
    violationsTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "category", "kind", "severityType", "name", "remediationDueDays"],
        columnWidths: {},
    };

    worksSearch = "";
    works: ConstructionWork[] = [];
    worksTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "name", "unit", "classificationCode"],
        columnWidths: {},
    };

    loading = false;
    apiClient = new ApiClient();

    constructor() {
        makeAutoObservable(this);
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
}
