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
    overlaySearch = "";
    currentOrganizationId: string | null = null;
    editingOrganization: Organization | null = null;
    showAddOverlay = false;
    showDeleteOverlay = false;
    deletingOrganization: Organization | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get organizationsMap() {
        return new Map<string, Organization>(this.organizations.map((org) => [org.id, org]));
    }

    organizationById(id: string) {
        return this.organizations.find((org) => org.id === id);
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
                    ? b.employees.length - a.employees.length
                    : a.employees.length - b.employees.length;
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
        return this.currentOrg?.employees ?? [];
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
            if (!organization.employees.some((e) => e.id === userId)) {
                organization.employees.push(user);
            }
        }
        await this.apiClient.post(endpoints.organizations + "/" + organization.id + "/employees", [
            userId,
        ]);
    };

    addUsersToOrganization = async (
        organization: Organization,
        userIds: string[],
    ): Promise<void> => {
        userIds.forEach((userId) => {
            const user = userStore.usersMap.get(userId);
            if (user) {
                if (user.organizationId === organization.id) {
                    return;
                }
                user.organizationId = organization.id;
                if (!organization.employees.some((e) => e.id === userId)) {
                    organization.employees.push(user);
                }
            }
        });
        await this.apiClient.post(
            endpoints.organizations + "/" + organization.id + "/employees",
            userIds,
        );
    };

    createOrganization = async (organization: Partial<Organization>): Promise<boolean> => {
        this.loading = true;
        const response = await this.apiClient.post<Organization>(
            endpoints.organizations,
            organization,
        );
        this.loading = false;
        if (response.status) {
            if (organization.employees?.length) {
                await this.addUsersToOrganization(
                    response.data,
                    organization.employees?.map((e) => e.id),
                );
            }
            this.organizations.push(response.data);
            return true;
        } else {
            this.loading = false;
            return false;
        }
    };

    removeUsersFromOrganization = async (
        organization: Organization,
        userIds: string[],
    ): Promise<void> => {
        organization.employees = organization.employees.filter((e) => !userIds.includes(e.id));
        userIds.forEach((userId) => {
            const u = userStore.usersMap.get(userId);
            if (u) {
                u.organizationId = undefined;
            }
        });
        await this.apiClient.deleteWithBody(
            endpoints.organizations + "/" + organization.id + "/employees",
            userIds,
        );
    };

    deleteOrganization = async (organization: Organization): Promise<void> => {
        this.loading = true;
        await this.removeUsersFromOrganization(
            organization,
            organization.employees.map((e) => e.id),
        );
        const response = await this.apiClient.delete(endpoints.organizations, organization.id);
        if (response.status) {
            this.organizations = this.organizations.filter((o) => o.id !== organization.id);
        }
        this.loading = false;
    };

    updateOrganization = async (
        organization: Organization,
        oldOrganization: Organization,
    ): Promise<void> => {
        this.loading = true;
        const newUsers = organization.employees.filter(
            (e) => !oldOrganization.employees.find((_e) => e.id === _e.id),
        );
        const deletedUsers = oldOrganization.employees.filter(
            (e) => !organization.employees.find((_e) => e.id === _e.id),
        );
        await this.addUsersToOrganization(
            organization,
            newUsers.map((u) => u.id),
        );
        await this.removeUsersFromOrganization(
            organization,
            deletedUsers.map((u) => u.id),
        );
        await this.apiClient.put(endpoints.organizations, organization);
        this.organizations = this.organizations.map((o) =>
            o.id === organization.id ? organization : o,
        );
        this.loading = false;
    };
}
