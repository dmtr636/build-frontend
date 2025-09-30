export type NotificationDTO = {
    id: string;
    projectId: string;
    projectName: string;
    type:
        | "ADMONITION"
        | "VIOLATION"
        | "VIOLATION_COMMENT"
        | "WORK_COMMENT"
        | "WORK_STATUS_UPDATE"
        | "VIOLATION_STATUS_UPDATE";
    objectId: string;
    content: string;
    authorId: string;
    read: boolean;
    createdAt: string;
};
