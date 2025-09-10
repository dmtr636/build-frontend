import { transformUrl } from "src/shared/utils/transformUrl.ts";

export const LOGIN_ENDPOINT = transformUrl("/api/auth/login");
export const DEMO_LOGIN_ENDPOINT = transformUrl("/api/auth/demoLogin");
export const LOGOUT_ENDPOINT = transformUrl("/api/auth/logout");
export const FILES_ENDPOINT = transformUrl("/api/files");
export const REGISTER_SEND_EMAIL_ENDPOINT = transformUrl("/api/auth/signup/sendCode");
export const REGISTER_CHECK_CODE_ENDPOINT = transformUrl("/api/auth/signup/checkCode");
export const REGISTER_SET_PASSWORD_ENDPOINT = transformUrl("/api/auth/signup/setPassword");

export const endpoints = {
    account: transformUrl("/api/account"),
    users: transformUrl("/api/admin/users"),
    events: transformUrl("/api/admin/events"),
    files: transformUrl("/api/files"),
};
