export interface IEvent {
    id: string;
    userId: string;
    action: "create" | "update" | "delete";
    actionType: "system" | "work";
    objectName?:
        | "user"
        | "organization"
        | "organization-employees"
        | "normative-document"
        | "construction-violation"
        | "construction-work"
        | "construction-work-stage"
        | "project"
        | "project-violation";
    objectId?: string;
    createdAt: string;
    info: Record<string, string>;
}
