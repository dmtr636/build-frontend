export interface NormativeDocument {
    id: string;
    regulation: string;
    name: string;
}

export interface ConstructionViolation {
    id: string;
    category: string;
    kind: string;
    severityType: string;
    name: string;
    remediationDueDays: number | null;
}

export interface ConstructionWork {
    id: string;
    name: string;
    unit: string | null;
    classificationCode: string | null;
}
