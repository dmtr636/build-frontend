export interface IEvent {
    id: string;
    userId: string;
    action: "create" | "update" | "delete";
    actionType: "system" | "work";
    objectName?: "user";
    objectId?: string;
    date: string;
    info: object;
}
