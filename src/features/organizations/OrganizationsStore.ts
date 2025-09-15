import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { Organization } from "src/features/organizations/Organization.ts";
import { User } from "src/features/users/types/User.ts";
import { userStore } from "src/app/AppStore.ts";
import { getNameInitials } from "src/shared/utils/getFullName.ts";

export class OrganizationsStore {
    organizations: Organization[] = [];
    loading = false;
    apiClient = new ApiClient();
    sort = {
        field: "name",
        direction: "asc",
    };
    search = "";
    cardSearch = "";
    currentOrganizationId: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get organizationsMap() {
        return new Map<string, Organization>(this.organizations.map((org) => [org.id, org]));
    }

    get filteredOrganizations() {
        let organizations = this.organizations.slice();
        organizations = this.filterOrganizations(organizations);
        if (this.sort.field === "name") {
            organizations.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.name.localeCompare(a.name)
                    : a.name.localeCompare(b.name);
            });
        } else if (this.sort.field === "date") {
            organizations.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.date.localeCompare(a.date)
                    : a.date.localeCompare(b.date);
            });
        } else if (this.sort.field === "count") {
            organizations.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.employeeIds.length - a.employeeIds.length
                    : a.employeeIds.length - b.employeeIds.length;
            });
        }
        return organizations;
    }

    get currentOrg() {
        return this.organizationsMap.get(this.currentOrganizationId ?? "");
    }

    get currentOrgAvailableUsers() {
        return userStore.users.filter(
            (user) => !user.organizationId && user.organizationId !== this.currentOrg?.id,
        );
    }

    get currentOrgUsers() {
        return (this.currentOrg?.employeeIds
            .map((id) => userStore.usersMap.get(id))
            .filter(Boolean) ?? []) as User[];
    }

    get filteredCurrentOrgUsers() {
        if (!this.cardSearch) {
            return this.currentOrgUsers;
        }
        return this.currentOrgUsers.filter((u) =>
            getNameInitials(u).toLowerCase().includes(this.cardSearch.toLowerCase()),
        );
    }

    filterOrganizations(organizations: Organization[]) {
        if (this.search) {
            organizations = organizations.filter((organization) => {
                const searchLowerCase = this.search.toLowerCase();
                return organization.name.toLowerCase().includes(searchLowerCase);
            });
        }
        return organizations;
    }

    fetchOrganizations = async () => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const response = await this.apiClient.post<Organization[]>(
            endpoints.organizations + "/filter",
            {
                order: this.sort,
                limit: "1000",
                offset: 0,
                filter: {},
            },
        );
        if (response.status) {
            this.organizations = response.data;
        }
        this.loading = false;
    };

    addUserToOrganization = async (organization: Organization, userId: string): Promise<void> => {
        const user = userStore.usersMap.get(userId);
        if (user) {
            if (user.organizationId === organization.id) {
                return;
            }
            user.organizationId = organization.id;
        }
        organization.employeeIds.push(userId);
        await this.apiClient.post(endpoints.organizations + "/" + organization.id + "/employees", [
            userId,
        ]);
    };
}
