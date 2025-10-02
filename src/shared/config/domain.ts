const env = import.meta.env;
const hostname = window.location.hostname;

export const DEBUG = false; // Use backend on localhost:8080
const USE_PRODUCTION_DOMAIN_IN_DEVELOPMENT = false;

const PRODUCTION_DOMAIN = env.VITE_CI_PRODUCTION_DOMAIN ?? env.VITE_PRODUCTION_DOMAIN;
const DEVELOPMENT_DOMAIN = env.VITE_CI_DEVELOPMENT_DOMAIN ?? env.VITE_DEVELOPMENT_DOMAIN;

export const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

let domain: string;
if (isDevelopment) {
    if (DEBUG) {
        domain = "http://localhost:8080";
    } else if (USE_PRODUCTION_DOMAIN_IN_DEVELOPMENT) {
        domain = PRODUCTION_DOMAIN;
    } else {
        domain = DEVELOPMENT_DOMAIN;
    }
} else {
    domain = `https://api.${hostname}`.replace("api.m.", "api.");
}

export { domain };
