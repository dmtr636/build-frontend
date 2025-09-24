import { makeAutoObservable, reaction, toJS } from "mobx";
import axios from "axios";
import { endpoints } from "src/shared/api/endpoints.ts";
import {
    CreateProjectDTO,
    ObjectDTO,
    UpdateProjectDTO,
} from "src/features/journal/types/Object.ts";
import { SortOption } from "src/features/users";

export class ObjectStore {
    sortOption: SortOption = {
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    };

    objects: ObjectDTO[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchObjects() {
        const response = await axios.get(endpoints.projects);
        this.objects = response.data;
    }

    get ObjectMap() {
        return new Map<string, ObjectDTO>(this.objects.map((obj) => [obj.id, obj]) as any);
    }

    setSortOption(sort: SortOption) {
        this.sortOption = sort;
    }

    async createObject(object: CreateProjectDTO) {
        const response = await axios.post(endpoints.projects, object);
        this.fetchObjects();
        return response;
    }

    async updateObject(object: UpdateProjectDTO) {
        await axios.put(endpoints.projects, object);
        this.fetchObjects();
    }

    getObjectsByUserId(userId: string): ObjectDTO[] {
        return this.objects.filter((obj) => obj.projectUsers.some((user) => user.id === userId));
    }

    async deleteObject(id: string) {
        await axios.delete(`${endpoints.projects}/${id}`);
        this.fetchObjects();
    }
}
