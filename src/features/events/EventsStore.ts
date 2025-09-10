import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { IEvent } from "src/features/events/Event.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";

interface Filter {
    date: string | null;
    userIds: string[];
    objectIds: string[];
    actions: string[];
}

const initialFilter: Filter = {
    date: null,
    userIds: [],
    objectIds: [],
    actions: [],
};

export class EventsStore {
    events: IEvent[] = [];
    loading = false;
    apiClient = new ApiClient();
    sort = {
        field: "date",
        direction: "desc",
    };
    filters = initialFilter;
    search = "";
    tab = "system";
    tableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["userId", "date", "objectId", "action"],
        columnWidths: {},
    };

    constructor() {
        makeAutoObservable(this);
    }

    get filteredEvents() {
        let events = this.events.slice();
        events = events.filter((event) => event.actionType === this.tab);
        return events;
    }

    fetchEvents = async () => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const response = await this.apiClient.post<IEvent[]>(endpoints.events + "/filter", {
            order: this.sort,
            limit: "100",
            offset: 0,
            filter: {},
        });
        if (response.status) {
            this.events = response.data;
        }
        this.loading = false;
    };

    resetFilters = () => {
        this.filters = initialFilter;
    };
}
