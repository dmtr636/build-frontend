import { makeAutoObservable } from "mobx";
import { IRegistryDocument } from "src/features/registry/types.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";

export class RegistryStore {
    documentsSearch = "";
    documents: IRegistryDocument[] = [];
    documentsTableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["index", "statement", "name"],
        columnWidths: {},
    };
    loading = false;

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
                    document.statement
                        .toLowerCase()
                        .includes(this.documentsSearch.trim().toLowerCase())
                );
            });
        }
        return documents;
    }

    async fetchAllDocuments() {
        this.loading = true;
        this.documents = [
            {
                id: "1",
                statement: "П. 6.25. СП82.13330.2016",
                name: "«Благоустройство территорий»",
            },
            {
                id: "2",
                statement: "П. 5.5.2. ГОСТ 13015-2012",
                name: "«Изделия бетонные и железобетонные для строительства. Общие технические требования. Правила приёмки, маркировки, транспортирования и хранения»",
            },
            {
                id: "3",
                statement: "П. 4.1.3.8. Постановление Правительства Москвы от 10.09.2002 №743-ПП",
                name: "«Правила создания, содержания и охраны зеленых насаждений и природных сообществ г. Москвы»",
            },
        ];
        this.loading = false;
    }
}
