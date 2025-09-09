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

    async fetchOnlineUser() {
        const response = await axios.get(endpoints.status);
        this.usersOnline = response.data;
    }
}
