import { transformUrl } from "src/shared/utils/transformUrl.ts";

export const LOGIN_ENDPOINT = transformUrl("/api/auth/login");
export const DEMO_LOGIN_ENDPOINT = transformUrl("/api/auth/demoLogin");
export const LOGOUT_ENDPOINT = transformUrl("/api/auth/logout");
export const GET_FILES_ENDPOINT = transformUrl("/cdn/files");
export const REGISTER_SEND_EMAIL_ENDPOINT = transformUrl("/api/auth/signup/sendCode");
export const REGISTER_CHECK_CODE_ENDPOINT = transformUrl("/api/auth/signup/checkCode");
export const REGISTER_SET_PASSWORD_ENDPOINT = transformUrl("/api/auth/signup/setPassword");
export const FILES_ENDPOINT = transformUrl("/api/files");
export const endpoints = {
    account: transformUrl("/api/account"),
    users: transformUrl("/api/admin/users"),
    events: transformUrl("/api/admin/events"),
    organizations: transformUrl("/api/admin/organizations"),
    files: transformUrl("/api/files"),
    status: transformUrl("/api/admin/users/status"),
    projects: transformUrl("/api/projects"),
    dictionaries: {
        constructionViolations: transformUrl("/api/dictionaries/construction-violations"),
        constructionWorks: transformUrl("/api/dictionaries/construction-works"),
        normativeDocuments: transformUrl("/api/dictionaries/normative-documents"),
    },
};
