import { makeAutoObservable } from "mobx";
import axios from "axios";
import { endpoints, LOGOUT_ENDPOINT } from "src/shared/api/endpoints.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";

import { User } from "src/features/users/types/User.ts";

export class UserStore {
    users: User[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchUsers() {
        const response = await axios.get(endpoints.users);
        this.users = response.data;
    }
}
