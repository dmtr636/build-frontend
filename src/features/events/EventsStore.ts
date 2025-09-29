import { makeAutoObservable, runInAction } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { IEvent } from "src/features/events/Event.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { eventsStore, userStore } from "src/app/AppStore.ts";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";
import { formatDate, formatDateShort, formatTime } from "src/shared/utils/date.ts";
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
        field: "createdAt",
        direction: "desc",
    };
    filters = initialFilter;
    search = "";
    tab = "work";
    tableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["userId", "createdAt", "objectId", "action"],
        columnWidths: {},
    };

    constructor() {
        makeAutoObservable(this);
    }

    get filteredEvents() {
        let events = this.events.slice();
        events = this.filterEvents(events);
        if (
            (this.search || this.hasActiveFilters) &&
            events.length &&
            !events.some((event) => event.actionType === this.tab)
        ) {
            runInAction(() => {
                this.tab = this.tab === "system" ? "work" : "system";
            });
        }
        events = events.filter((event) => event.actionType === this.tab);

        events = events.filter((event) => event.objectName !== "construction-work-stage");

        events.filter((event) => !!event.createdAt);

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
                    ? b.createdAt?.localeCompare(a.createdAt)
                    : a.createdAt?.localeCompare(b.createdAt);
            });
        }
        return events;
    }

    get filteredEventsWithoutTab() {
        let events = this.events.slice();
        events = this.filterEvents(events);
        if (
            (this.search || this.hasActiveFilters) &&
            events.length &&
            !events.some((event) => event.actionType === this.tab)
        ) {
            runInAction(() => {
                this.tab = this.tab === "system" ? "work" : "system";
            });
        }
        events = events.filter((event) => event.objectName !== "construction-work-stage");

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
                    ? b.createdAt?.localeCompare(a.createdAt)
                    : a.createdAt?.localeCompare(b.createdAt);
            });
        }
        return events;
    }

    get hasActiveFilters() {
        return (
            !!this.filters.date ||
            !!this.filters.actions.length ||
            !!this.filters.objectIds.length ||
            !!this.filters.userIds.length
        );
    }

    filterEvents(events: IEvent[]) {
        if (this.search) {
            events = events.filter((event) => {
                const user = userStore.usersMap.get(event.userId);
                const userInitials = getNameInitials(user);
                const userFullName = getFullName(user);
                const date = formatDateShort(event.createdAt);
                const time = formatTime(event.createdAt);
                const localizedAction = event.objectName
                    ? (eventActionLocale[event.objectName]?.[event.action] ?? "")
                    : "";
                const searchLowerCase = this.search.toLowerCase();
                return (
                    userInitials.toLowerCase().includes(searchLowerCase) ||
                    userFullName.toLowerCase().includes(searchLowerCase) ||
                    date.includes(searchLowerCase) ||
                    time.includes(searchLowerCase) ||
                    localizedAction.toLowerCase().includes(searchLowerCase)
                );
            });
        }
        if (this.filters.date) {
            const dateLocaleString = formatDate(this.filters.date);
            events = events.filter((event) => formatDate(event.createdAt) === dateLocaleString);
        }
        if (this.filters.userIds?.length) {
            events = events.filter((event) => this.filters.userIds.includes(event.userId));
        }
        if (this.filters.actions?.length) {
            events = events.filter((event) =>
                this.filters.actions.includes(`${event.objectName}.${event.action}`),
            );
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
