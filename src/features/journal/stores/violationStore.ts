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
        const response = await axios.post(endpoints.violations, object);
        this.fetchViolationByObj(id);
        return response;
    }

    async updateObject(object: ProjectViolationDTO, id: string) {
        await axios.put(endpoints.violations, object);
        this.fetchViolationByObj(id);
    }

    async deleteObject(id: string, idOrg: string) {
        await axios.delete(`${endpoints.violations}/${id}`);
        this.fetchViolationByObj(idOrg);
    }

    async changeStatus(id: string, status: ProjectViolationStatus, idOrg: string) {
        await axios.patch(`${endpoints.violations}/${id}/status?status=${status}`);
        this.fetchViolationByObj(idOrg);
    }
}
