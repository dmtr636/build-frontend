import { makeAutoObservable } from "mobx";
import axios from "axios";
import { endpoints, LOGOUT_ENDPOINT } from "src/shared/api/endpoints.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";

import { User, UserOnlineMap } from "src/features/users/types/User.ts";

export class UserStore {
    users: User[] = [];
    usersOnline: UserOnlineMap = {};

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
