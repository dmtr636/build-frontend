import { makeAutoObservable } from "mobx";
import { ApiClient } from "src/shared/api/ApiClient.ts";
import { endpoints, FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Material } from "src/features/journal/pages/MaterialsPage/Material.ts";
import { formatDate } from "src/shared/utils/date.ts";
import axios from "axios";
import { offlineStore } from "src/app/AppStore.ts";
import { enqueueApi } from "src/features/offline/OfflineQueueStore.tsx";
import { v4 } from "uuid";
import dayjs from "dayjs";

interface Filter {
    date: string | null;
    names: string[];
    userIds: string[];
    workIds: string[];
}

const initialFilter: Filter = {
    date: null,
    names: [],
    userIds: [],
    workIds: [],
};

export class MaterialsStore {
    materials: Material[] = [];
    addForm: Partial<Material> = {};
    editForm: Partial<Material> = {};
    loading = false;
    apiClient = new ApiClient();
    sort = {
        field: "createdAt",
        direction: "desc",
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
    ocrLoading = false;

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
        if (this.filters.date) {
            const dateLocaleString = formatDate(this.filters.date);
            materials = materials.filter(
                (visit) => formatDate(visit.waybill.deliveryDateTime ?? "") === dateLocaleString,
            );
        }
        if (this.filters.userIds?.length) {
            materials = materials.filter(
                (visit) =>
                    visit.waybill.receiver &&
                    this.filters.userIds.includes(visit.waybill.receiver ?? ""),
            );
        }
        if (this.filters.names?.length) {
            materials = materials.filter(
                (visit) =>
                    visit.waybill.materialName &&
                    this.filters.names.includes(visit.waybill.materialName),
            );
        }
        if (this.filters.workIds?.length) {
            materials = materials.filter(
                (visit) =>
                    visit.waybill.projectWorkId &&
                    this.filters.workIds.includes(visit.waybill.projectWorkId),
            );
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
        if (!offlineStore.isOnline) {
            enqueueApi.post(endpoints.projectMaterials, material);
            const newMaterial: Material = {
                ...material,
                id: v4(),
                createdAt: dayjs().toISOString(),
                updatedAt: dayjs().toISOString(),
                projectId: material.projectId ?? "",
                waybill: material.waybill!,
                passportQuality: material.passportQuality ?? null,
            };
            this.materials.push(newMaterial);
            this.addForm = {};
            return true;
        }

        this.loading = true;
        const response = await this.apiClient.post<Material>(endpoints.projectMaterials, material);
        this.loading = false;
        if (response.status) {
            this.materials.push(response.data);
            this.addForm = {};
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

    updateMaterial = async (material: Partial<Material>, oldMaterial: Material): Promise<void> => {
        this.loading = true;
        if (oldMaterial.waybill && material.waybill) {
            await this.apiClient.put(endpoints.projectMaterials + `/waybills`, material.waybill);
        }
        if (oldMaterial.passportQuality && material.passportQuality) {
            await this.apiClient.put(endpoints.projectMaterials + `/passport-qualities`, {
                ...material.passportQuality,
                manufacturer: material.passportQuality.manufacturer || "",
                consumerNameAndAddress: material.passportQuality.consumerNameAndAddress || "",
                productNameAndGrade: material.passportQuality.productNameAndGrade || "",
            });
        }
        if (!oldMaterial.passportQuality && material.passportQuality) {
            await this.apiClient.post(endpoints.projectMaterials + `/passport-qualities`, {
                ...material.passportQuality,
                materialId: material.id,
            });
        }
        this.loading = false;
        await this.fetchMaterials(material.projectId ?? "");
    };

    resetFilters = () => {
        this.filters = initialFilter;
    };

    doOcr = async (file: Blob) => {
        if (!offlineStore.isOnline) {
            return;
        }

        this.ocrLoading = true;
        const formData = new FormData();
        formData.set("file", file);

        const MIN_DURATION = 3000;
        const start = Date.now();

        try {
            const response = await axios.post<any>(endpoints.ocr, formData);

            const elapsed = Date.now() - start;
            if (elapsed < MIN_DURATION) {
                await new Promise((resolve) => setTimeout(resolve, MIN_DURATION - elapsed));
            }

            if (response?.data) {
                if (!this.addForm.waybill) {
                    this.addForm.waybill = {} as any;
                }
                if (this.addForm.waybill) {
                    this.addForm.waybill.grossWeight = response.data.grossWeight;
                    this.addForm.waybill.invoiceNumber = response.data.invoiceNumber;
                    this.addForm.waybill.materialName = response.data.materialName;
                    this.addForm.waybill.volume = response.data.volume;
                    this.addForm.waybill.netWeight = response.data.netWeight;
                    this.addForm.waybill.packageCount = response.data.packageCount;
                }
            }
        } catch (e) {
            if (!axios.isCancel(e)) {
                console.error("Не удалось загрузить файл");
            }
            return "";
        } finally {
            this.ocrLoading = false;
        }
    };
}
