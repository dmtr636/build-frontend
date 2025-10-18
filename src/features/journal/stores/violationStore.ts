import { makeAutoObservable, reaction, toJS } from "mobx";
import axios from "axios";
import { endpoints } from "src/shared/api/endpoints.ts";
import {
    CreateProjectDTO,
    ObjectDTO,
    UpdateProjectDTO,
} from "src/features/journal/types/Object.ts";
import { SortOption } from "src/features/users";
import {
    ProjectViolationDTO,
    ProjectViolationStatus,
} from "src/features/journal/types/Violation.ts";
import { offlineStore, visitsStore } from "src/app/AppStore.ts";
import { enqueueApi } from "src/features/offline/OfflineQueueStore.tsx";
import { v4 } from "uuid";

export class ViolationStore {
    sortOption: SortOption = {
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    };
    allViolations: ProjectViolationDTO[] = [];
    violations: ProjectViolationDTO[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchViolationByObj(id: string) {
        const response = await axios.get(`${endpoints.violations}/search?projectId=${id}`);
        this.violations = response.data;
    }

    async fetchAllViolations() {
        const response = await axios.get(endpoints.violations);
        this.allViolations = response.data;
    }

    async createObject(object: ProjectViolationDTO, id: string) {
        if (!offlineStore.isOnline) {
            enqueueApi.post(endpoints.violations, object);
            this.violations.push({
                ...object,
                id: v4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: "TODO",
            });
        } else {
            const response = await axios.post(endpoints.violations, object);
            this.fetchViolationByObj(id);
            return response;
        }
    }

    async updateObject(object: ProjectViolationDTO, id: string) {
        if (!offlineStore.isOnline) {
            enqueueApi.put(endpoints.violations, object);
            const violation = this.violations.find((v) => v.id === object.id);
            if (violation) {
                Object.assign(violation, object);
            }
            this.violations = [...this.violations];
        } else {
            await axios.put(endpoints.violations, object);
            this.fetchViolationByObj(id);
        }
    }

    async deleteObject(id: string, idOrg: string) {
        await axios.delete(`${endpoints.violations}/${id}`);
        this.fetchViolationByObj(idOrg);
    }

    async changeStatus(id: string, status: ProjectViolationStatus, idOrg: string) {
        if (visitsStore.currentVisitId) {
            if (!offlineStore.isOnline) {
                enqueueApi.patch(
                    `${endpoints.violations}/${id}/status?status=${status}&visitId=${visitsStore.currentVisitId}`,
                );
            } else {
                await axios.patch(
                    `${endpoints.violations}/${id}/status?status=${status}&visitId=${visitsStore.currentVisitId}`,
                );
            }
        } else {
            if (!offlineStore.isOnline) {
                enqueueApi.patch(`${endpoints.violations}/${id}/status?status=${status}`);
            } else {
                await axios.patch(`${endpoints.violations}/${id}/status?status=${status}`);
            }
        }
        if (!offlineStore.isOnline) {
            const violation = this.violations.find((v) => v.id === id);
            if (violation) {
                violation.status = status;
            }
            this.violations = [...this.violations];
        } else {
            this.fetchViolationByObj(idOrg);
        }
    }
}
