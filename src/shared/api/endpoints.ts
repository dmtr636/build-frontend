import { transformUrl } from "src/shared/utils/transformUrl.ts";

export const LOGIN_ENDPOINT = transformUrl("/api/auth/login");
export const LOGOUT_ENDPOINT = transformUrl("/api/auth/logout");
export const GET_FILES_ENDPOINT = transformUrl("/cdn/files");
export const FILES_ENDPOINT = transformUrl("/api/files");

export const endpoints = {
    account: transformUrl("/api/account"),
    users: transformUrl("/api/admin/users"),
    events: transformUrl("/api/admin/events"),
    organizations: transformUrl("/api/admin/organizations"),
    files: transformUrl("/api/files"),
    status: transformUrl("/api/admin/users/status"),
    projects: transformUrl("/api/projects"),
    projectWorks: transformUrl("/api/projects/works"),
    projectWorkComments: transformUrl("/api/projects/works/comments"),
    projectViolationsComments: transformUrl("/api/projects/violations/comments"),
    projectWorkVersions: transformUrl("/api/projects/works/versions"),
    projectVisits: transformUrl("/api/projects/visits"),
    projectChecklists: transformUrl("/api/projects/checklists"),
    projectMaterials: transformUrl("/api/projects/materials"),
    violations: transformUrl("/api/projects/violations"),
    notifications: transformUrl("/api/notifications"),
    ocr: transformUrl("/api/ocr/waybills"),
    dictionaries: {
        constructionViolations: transformUrl("/api/dictionaries/construction-violations"),
        constructionWorks: transformUrl("/api/dictionaries/construction-works"),
        constructionWorkStages: transformUrl("/api/dictionaries/construction-works/stages"),
        normativeDocuments: transformUrl("/api/dictionaries/normative-documents"),
    },
};
