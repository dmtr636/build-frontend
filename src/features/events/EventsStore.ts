import { makeAutoObservable, runInAction } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { IEvent } from "src/features/events/Event.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { userStore } from "src/app/AppStore.ts";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { formatDateShort, formatTime } from "src/shared/utils/date.ts";
import { eventActionLocale } from "src/features/events/eventsLocale.ts";

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
        if (this.search) {
            events = this.filterEvents(events);
        }
        if (
            this.search &&
            this.events.length &&
            !events.some((event) => event.actionType === this.tab)
        ) {
            runInAction(() => {
                this.tab = this.tab === "system" ? "work" : "system";
            });
        }
        events = events.filter((event) => event.actionType === this.tab);
        if (this.sort.field === "userId") {
            events.sort((a, b) => {
                const aUser = userStore.usersMap.get(a.userId);
                const aNameInitials = getNameInitials(aUser);
                const bUser = userStore.usersMap.get(b.userId);
                const bNameInitials = getNameInitials(bUser);
                return this.sort.direction === "desc"
                    ? bNameInitials.localeCompare(aNameInitials)
                    : aNameInitials.localeCompare(bNameInitials);
            });
        } else {
            events.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.date.localeCompare(a.date)
                    : a.date.localeCompare(b.date);
            });
        }
        return events;
    }

    filterEvents(events: IEvent[]) {
        if (this.search) {
            events = events.filter((event) => {
                const user = userStore.usersMap.get(event.userId);
                const userInitials = getNameInitials(user);
                const date = formatDateShort(event.date);
                const time = formatTime(event.date);
                const localizedAction = event.objectName
                    ? eventActionLocale[event.objectName][event.action]
                    : "";
                const searchLowerCase = this.search.toLowerCase();
                return (
                    userInitials.toLowerCase().includes(searchLowerCase) ||
                    date.includes(searchLowerCase) ||
                    time.includes(searchLowerCase) ||
                    localizedAction.toLowerCase().includes(searchLowerCase)
                );
            });
        }
        return events;
    }

    fetchEvents = async () => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const response = await this.apiClient.post<IEvent[]>(endpoints.events + "/filter", {
            order: this.sort,
            limit: "1000",
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
