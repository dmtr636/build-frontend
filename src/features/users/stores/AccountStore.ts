import { makeAutoObservable } from "mobx";
import axios from "axios";
import { endpoints, LOGOUT_ENDPOINT } from "src/shared/api/endpoints.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";

import { User } from "src/features/users/types/User.ts";

export class AccountStore {
    currentUser: User | null = null;
    initialized = false;
    updating = false;
    private apiClient = new ApiClient();
    updateAbortController = new AbortController();
    users: User[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async authenticate() {
        try {
            const response = await axios.get(endpoints.account);
            this.setUser(response.data);
            return true;
        } catch (error) {
            return false;
        } finally {
            this.setInitialized(true);
        }
    }

    async fetchUsers() {
        const response = await axios.get(endpoints.users);
        this.setUser(response.data);
    }

    async logout() {
        await axios.post(LOGOUT_ENDPOINT);
        this.setUser(null);
    }

    async update(user: User) {
        this.updateAbortController = new AbortController();
        this.setUpdating(true);
        const response = await this.apiClient.put<User>(endpoints.account, user, {
            signal: this.updateAbortController.signal,
        });
        if (response.status) {
            this.setUser(response.data);
        }
        this.setUpdating(false);
        return response;
    }

    setUpdating(updating: boolean) {
        this.updating = updating;
    }

    setUser(user: User | null) {
        this.currentUser = user;
    }

    setInitialized(initialized: boolean) {
        this.initialized = initialized;
    }
}
