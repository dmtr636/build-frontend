import { FileDto } from "src/features/journal/types/Object.ts";

export interface Material {
    id: string;
    projectId: string;
    waybill: Waybill;
    passportQuality: PassportQuality | null;
    createdAt: string;
    updatedAt: string;
}

export interface Waybill {
    id: string;
    materialId: string;
    materialName: string | null;
    receiver: string | null;
    deliveryDateTime: string | null;
    projectWorkId: string | null;
    projectWorkName: string | null;
    invoiceNumber: string | null;
    volume: string | null;
    netWeight: string | null;
    grossWeight: string | null;
    packageCount: number | null;
    files: FileDto[];
    laboratoryAnalysisRequired?: boolean | null;
}

export interface PassportQuality {
    id: string;
    materialId: string;
    manufacturer: string | null;
    consumerNameAndAddress: string | null;
    contractNumber: string | null;
    productNameAndGrade: string | null;
    batchNumber: string | null;
    batchCount: number | null;
    manufactureDate: string | null;
    shippedQuantity: number | null;
    labChief: string | null;
    files: FileDto[];
}
