import { transformUrl } from "src/shared/utils/transformUrl.ts";

export const LOGIN_ENDPOINT = transformUrl("/api/auth/login");
export const DEMO_LOGIN_ENDPOINT = transformUrl("/api/auth/demoLogin");
export const LOGOUT_ENDPOINT = transformUrl("/api/auth/logout");
export const PROJECTS_ENDPOINT = transformUrl("/api/projects");
export const REVIEWS_ENDPOINT = transformUrl("/api/reviews");
export const GET_FILES_ENDPOINT = transformUrl("/cdn/files");
export const REGISTER_SEND_EMAIL_ENDPOINT = transformUrl("/api/auth/signup/sendCode");
export const REGISTER_CHECK_CODE_ENDPOINT = transformUrl("/api/auth/signup/checkCode");
export const REGISTER_SET_PASSWORD_ENDPOINT = transformUrl("/api/auth/signup/setPassword");

export const CHECK_DOMAIN_EXIST = transformUrl("/api/account/checkDomain");
export const CHECK_EXTERNAL_DOMAIN_EXIST = transformUrl("/api/account/checkExternalDomain");

export const endpoints = {
    account: transformUrl("/api/account"),
    resumes: transformUrl("/api/resumes"),
    projects: transformUrl("/api/projects"),
    products: transformUrl("/api/products"),
    users: transformUrl("/api/admin/users"),
    files: transformUrl("/api/files"),
    payments: transformUrl("/api/payments"),
    stats: transformUrl("/api/stats"),
    reviews: transformUrl("/api/reviews"),
    status: transformUrl("/api/admin/users/status"),
};

export const internalEndpoints = {
    users: {
        all: transformUrl("/api/admin/users"),
        reviews: transformUrl("/api/admin/users/{id}/reviews"),
        resumes: transformUrl("/api/admin/users/{id}/resumes"),
        projects: transformUrl("/api/admin/users/{id}/projects"),
        products: transformUrl("/api/admin/users/{id}/products"),
        files: transformUrl("/api/admin/users/{id}/files"),
        file: transformUrl("/api/admin/users/{userId}/files/{fileId}"),
        feedbacks: transformUrl("/api/admin/users/{id}/feedbacks"),
    },
};
