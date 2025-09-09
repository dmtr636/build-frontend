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
            this.fetchUserIsOnline(this.currentUser?.id as string);
            console.log(this.currentUser);
            return true;
        } catch (error) {
            return false;
        } finally {
            this.setInitialized(true);
        }
    }

    async logout() {
        this.fetchUserIsOffline();
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

    async fetchUserIsOnline(id: string) {
        axios.put(`${endpoints.users}/${id}/status/online`, {});
    }

    async fetchUserIsOffline(useBeacon = false) {
        const url = `${endpoints.users}/${this.currentUser?.id as string}/status/offline`;

        if (useBeacon && navigator.sendBeacon) {
            try {
                const blob = new Blob([JSON.stringify({})], { type: "application/json" });
                navigator.sendBeacon(url, blob);
                return;
            } catch (e) {
                console.error("sendBeacon error", e);
            }
        }

        try {
            await axios.put(url, {});
        } catch (e) {
            console.error("axios error", e);
        }
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
