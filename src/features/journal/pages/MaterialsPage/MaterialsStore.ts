import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints } from "src/shared/api/endpoints.ts";
import { Material } from "src/features/journal/pages/MaterialsPage/Material.ts";

interface Filter {
    date: string | null;
    names: string[];
    userIds: string[];
}

const initialFilter: Filter = {
    date: null,
    names: [],
    userIds: [],
};

export class MaterialsStore {
    materials: Material[] = [];
    addForm: Partial<Material> = {};
    editForm: Material | null = null;
    loading = false;
    apiClient = new ApiClient();
    sort = {
        field: "name",
        direction: "asc",
    };
    filters = initialFilter;
    search = "";
    cardSearch = "";
    overlaySearch = "";
    currentMaterialId: string | null = null;
    editingMaterial: Material | null = null;
    showAddOverlay = false;
    showDeleteOverlay = false;
    deletingMaterial: Material | null = null;
    tab: "waybill" | "quality" = "waybill";

    constructor() {
        makeAutoObservable(this);
    }

    get materialsMap() {
        return new Map<string, Material>(this.materials.map((material) => [material.id, material]));
    }

    materialById(id?: string | null) {
        return this.materials.find((material) => material.id === id);
    }

    get hasActiveFilters() {
        return !!this.filters.date || !!this.filters.names.length;
    }

    get filteredMaterials() {
        let materials = this.materials.slice();
        materials = this.filterMaterials(materials);
        if (this.sort.field === "createdAt") {
            materials.sort((a, b) => {
                return this.sort.direction === "desc"
                    ? b.createdAt.localeCompare(a.createdAt)
                    : a.createdAt.localeCompare(b.createdAt);
            });
        }
        return materials;
    }

    get currentMaterial() {
        return this.materialsMap.get(this.currentMaterialId ?? "");
    }

    filterMaterials(materials: Material[]) {
        if (this.search) {
            materials = materials.filter((material) => {
                const searchLowerCase = this.search.toLowerCase().trim();
                return (
                    material.waybill?.materialName?.toLowerCase().includes(searchLowerCase) ||
                    material.waybill.invoiceNumber?.toLowerCase().includes(searchLowerCase)
                );
            });
        }
        return materials;
    }

    fetchMaterials = async (projectId: string) => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const response = await this.apiClient.get<Material[]>(
            endpoints.projectMaterials + `/search?projectId=${projectId}`,
        );
        if (response.status) {
            this.materials = response.data;
        }
        this.loading = false;
    };

    createMaterial = async (material: Partial<Material>): Promise<boolean> => {
        this.loading = true;
        const response = await this.apiClient.post<Material>(endpoints.projectMaterials, material);
        this.loading = false;
        if (response.status) {
            this.materials.push(response.data);
            return true;
        } else {
            this.loading = false;
            return false;
        }
    };

    deleteMaterial = async (material: Material): Promise<void> => {
        this.loading = true;
        const response = await this.apiClient.delete(endpoints.projectMaterials, material.id);
        if (response.status) {
            this.materials = this.materials.filter((o) => o.id !== material.id);
        }
        this.loading = false;
    };

    updateMaterial = async (material: Material): Promise<void> => {
        this.loading = true;
        await this.apiClient.put(endpoints.projectMaterials, material);
        this.materials = this.materials.map((o) => (o.id === material.id ? material : o));
        this.loading = false;
    };

    resetFilters = () => {
        this.filters = initialFilter;
    };
}
