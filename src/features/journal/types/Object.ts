export interface ObjectDTO {
    id: string; // uuid
    name: string;
    objectNumber: string;
    address: AddressDTO;
    centroid: CoordinateDTO;
    polygon: CoordinateDTO[];
    customerOrganization: string; // uuid
    contractorOrganization: string; // uuid
    projectUsers: ProjectUserDTO[];
    lastInspection: string; // date-time
    plannedPeriod: ConstructionPeriodDTO;
    actualPeriod: ConstructionPeriodDTO;
    type: string;
    imageId: string;
    status: string;
    hasViolations: boolean;
    gallery: ProjectImageDTO[];
    documents: ProjectDocumentDTO[];
    createdAt: string; // date-time
    readonly updatedAt: string; // date-time
}

export interface AddressDTO {
    city: string;
    street: string;
    house?: string;
}

export interface CoordinateDTO {
    latitude: number;
    longitude: number;
}

export interface ProjectUserDTO {
    id: string; // uuid
    firstName: string;
    lastName: string;
    patronymic: string;
    position: string;
    side: "CONTRUCTOR" | "CUSTOMER";
    isResponsible: boolean;
}

export interface ConstructionPeriodDTO {
    start: string; // date
    end: string; // date
}

export interface ProjectImageDTO {
    id: string; // uuid
    fileId: string; // uuid
    caption: string;
    takenAt: string; // date
}

export interface FileDto {
    id?: string;
    userId?: string;
    originalFileName?: string;
    size?: number;
    type?: string;
    createdAt?: string; // ISO date
    updatedAt?: string; // ISO date
}

export interface ProjectDocumentDTO {
    id: string;
    name: string;
    file: FileDto;
    documentGroup?: string;
}

export type CreateProjectDTO = Partial<ObjectDTO>;
export type UpdateProjectDTO = Partial<Omit<ObjectDTO, "id" | "createdAt" | "updatedAt">>;
