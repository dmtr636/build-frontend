import { makeAutoObservable } from "mobx";
import axios from "axios";
import { endpoints, LOGOUT_ENDPOINT } from "src/shared/api/endpoints.ts";

import { User, UserOnlineMap } from "src/features/users/types/User.ts";
import { SortOption } from "src/features/users";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";

export class UserStore {
    users: User[] = [];
    usersOnline: UserOnlineMap = {};
    sortOption: SortOption = {
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    };
    roles: string[] = [];
    company: SelectOption<string>[] = [];
    organizationFilter: string[] = [];
    position: string[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchUsers() {
        const response = await axios.get(endpoints.users);
        this.users = response.data;
    }

    get usersMap() {
        return new Map<string, User>(this.users.map((user) => [user.id, user]) as any);
    }

    setSortOption(sort: SortOption) {
        this.sortOption = sort;
    }

    setRoles(role: string[]) {
        this.roles = role;
    }

    setCompany(company: SelectOption<string>[]) {
        this.company = company;
    }

    setOrganizations(orgs: string[]) {
        this.position = orgs;
    }

    async createUser(user: User) {
        await axios.post(endpoints.users, user);
        this.fetchUsers();
    }

    async updateUser(user: User) {
        await axios.put(endpoints.users, user);
        this.fetchUsers();
    }

    async deleteUser(id: string) {
        await axios.delete(`${endpoints.users}/${id}`);
        this.fetchUsers();
    }

    async fetchOnlineUser() {
        const response = await axios.get(endpoints.status);
        this.usersOnline = response.data;
    }
}
