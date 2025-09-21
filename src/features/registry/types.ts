export interface NormativeDocument {
    id: string;
    regulation: string;
    name: string;
}

export interface ConstructionViolation {
    id: string;
    category: string | null;
    kind: string;
    severityType: string;
    name: string;
    remediationDueDays: number;
}

export interface ConstructionWork {
    id: string;
    name: string;
    unit: string | null;
    classificationCode: string | null;
}
