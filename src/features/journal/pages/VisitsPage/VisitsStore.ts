import { makeAutoObservable, runInAction } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { userStore } from "src/app/AppStore.ts";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";
import { formatDate, formatDateShort, formatTime } from "src/shared/utils/date.ts";
import { Visit } from "src/features/journal/pages/VisitsPage/Visit.ts";

interface Filter {
    date: string | null;
    userIds: string[];
    positions: string[];
}

const initialFilter: Filter = {
    date: null,
    userIds: [],
    positions: [],
};

export class VisitsStore {
    visits: Visit[] = [];
    loading = false;
    apiClient = new ApiClient();
    sort = {
        field: "visitDate",
        direction: "desc",
    };
    filters = initialFilter;
    search = "";
    tableSettings: ITableSettings = {
        compactMode: true,
        quickView: false,
        openPageInNewTab: true,
        columns: ["userId", "visitDate", "position", "violations", "works"],
        columnWidths: {},
    };
    currentVisitId = "";

    constructor() {
        makeAutoObservable(this);
    }

    get filteredVisits() {
        let visits = this.visits.slice();
        visits = this.filterVisits(visits);

        visits.filter((visit) => !!visit.visitDate);

        if (this.sort.field === "userId") {
            visits.sort((a, b) => {
                const aUser = userStore.usersMap.get(a.user.id);
                const aNameInitials = getNameInitials(aUser);
                const bUser = userStore.usersMap.get(b.user.id);
                const bNameInitials = getNameInitials(bUser);
                return this.sort.direction === "desc"
                    ? bNameInitials.localeCompare(aNameInitials)
                    : aNameInitials.localeCompare(bNameInitials);
            });
        }
        if (this.sort.field === "visitDate") {
            visits.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.visitDate?.localeCompare(a.visitDate)
                    : a.visitDate?.localeCompare(b.visitDate);
            });
        }
        if (this.sort.field === "violations") {
            visits.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.violations.length - a.violations.length
                    : a.violations.length - b.violations.length;
            });
        }
        if (this.sort.field === "works") {
            visits.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.works.length - a.works.length
                    : a.works.length - b.works.length;
            });
        }
        return visits;
    }

    get hasActiveFilters() {
        return (
            !!this.filters.date || !!this.filters.positions.length || !!this.filters.userIds.length
        );
    }

    filterVisits(visits: Visit[]) {
        if (this.search) {
            visits = visits.filter((visit) => {
                const user = userStore.usersMap.get(visit.user.id);
                const userInitials = getNameInitials(user);
                const userFullName = getFullName(user);
                const date = formatDateShort(visit.visitDate);
                const time = formatTime(visit.visitDate);
                const position = visit.user.position;
                const searchLowerCase = this.search.toLowerCase();
                return (
                    userInitials.toLowerCase().includes(searchLowerCase) ||
                    userFullName.toLowerCase().includes(searchLowerCase) ||
                    date.includes(searchLowerCase) ||
                    time.includes(searchLowerCase) ||
                    position?.toLowerCase()?.includes(searchLowerCase)
                );
            });
        }
        if (this.filters.date) {
            const dateLocaleString = formatDate(this.filters.date);
            visits = visits.filter((visit) => formatDate(visit.visitDate) === dateLocaleString);
        }
        if (this.filters.userIds?.length) {
            visits = visits.filter((visit) => this.filters.userIds.includes(visit.user.id));
        }
        if (this.filters.positions?.length) {
            visits = visits.filter(
                (visit) =>
                    visit.user.position && this.filters.positions.includes(visit.user.position),
            );
        }
        return visits;
    }

    fetchVisits = async (projectId: string) => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const response = await this.apiClient.get<Visit[]>(
            endpoints.projectVisits + `/search?projectId=${projectId}`,
        );
        if (response.status) {
            this.visits = response.data;
        }
        this.loading = false;
    };

    resetFilters = () => {
        this.filters = initialFilter;
    };

    createVisit = async (projectId: string, userId: string) => {
        const response = await this.apiClient.get<Visit>(
            endpoints.projectVisits +
                `/lookup?projectId=${projectId}&userId=${userId}&date=${new Date().toJSON().slice(0, 10)}`,
        );
        if (response.status) {
            this.currentVisitId = response.data.id;
            return response.data.id;
        }
        const createResponse = await this.apiClient.post<Visit>(endpoints.projectVisits, {
            projectId: projectId,
            userId: userId,
        });
        if (createResponse.status) {
            this.currentVisitId = createResponse.data.id;
            return createResponse.data.id;
        }
        this.currentVisitId = "";
        return "";
    };
}
