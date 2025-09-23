import { makeAutoObservable, reaction, toJS } from "mobx";
import axios from "axios";
import { endpoints } from "src/shared/api/endpoints.ts";

import { User, UserOnlineMap } from "src/features/users/types/User.ts";
import { SortOption } from "src/features/users";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";

/** --- LocalStorage helpers --- */
const LS_KEYS = {
    sortOption: "userStore.sortOption",
    roles: "userStore.roles",
    company: "userStore.company",
    position: "userStore.position",
} as const;

const canUseLS = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readLS<T>(key: string, fallback: T): T {
    try {
        if (!canUseLS()) return fallback;
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function writeLS<T>(key: string, value: T) {
    try {
        if (!canUseLS()) return;
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // no-op
    }
}

function removeLS(key: string) {
    try {
        if (!canUseLS()) return;
        window.localStorage.removeItem(key);
    } catch {
        // no-op
    }
}

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
    position: string[] = [];

    constructor() {
        makeAutoObservable(this);

        this.sortOption = readLS<SortOption>(LS_KEYS.sortOption, this.sortOption);
        this.roles = readLS<string[]>(LS_KEYS.roles, []);
        this.company = readLS<SelectOption<string>[]>(LS_KEYS.company, []);
        this.position = readLS<string[]>(LS_KEYS.position, []);

        reaction(
            () => toJS(this.sortOption),
            (v) => writeLS(LS_KEYS.sortOption, v),
        );

        reaction(
            () => toJS(this.roles),
            (v) => writeLS(LS_KEYS.roles, v),
        );

        reaction(
            () => toJS(this.company),
            (v) => writeLS(LS_KEYS.company, v),
        );

        reaction(
            () => toJS(this.position),
            (v) => writeLS(LS_KEYS.position, v),
        );
    }

    async fetchUsers() {
        const response = await axios.get(endpoints.users);
        this.users = response.data;
    }

    get usersMap() {
        return new Map<string, User>(this.users.map((user) => [user.id, user]) as any);
    }

    setSortOption(sort: SortOption) {
        this.sortOption = { ...sort };
    }

    setRoles(role: string[]) {
        this.roles = [...role];
    }

    setCompany(company: SelectOption<string>[]) {
        this.company = [...company];
    }

    setOrganizations(orgs: string[]) {
        this.position = [...orgs];
    }

    clearPersistedFilters() {
        /* this.sortOption = {
            field: "name",
            order: "asc",
            label: "По алфавиту, от А - Я",
        };*/
        this.roles = [];
        this.company = [];
        this.position = [];

        removeLS(LS_KEYS.sortOption);
        removeLS(LS_KEYS.roles);
        removeLS(LS_KEYS.company);
        removeLS(LS_KEYS.position);
    }

    async createUser(user: User) {
        const response = await axios.post(endpoints.users, user);
        this.fetchUsers();
        return response;
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
