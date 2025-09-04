export const DEBUG = false;

const env = import.meta.env;

const hostname = window.location.hostname;

const PRODUCTION_DOMAIN = env.VITE_CI_PRODUCTION_DOMAIN ?? env.VITE_PRODUCTION_DOMAIN;

const DEVELOPMENT_DOMAIN = DEBUG ? "http://localhost:8080" : PRODUCTION_DOMAIN;

export const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const isDevBranch = () => {
    return window.location.hostname.includes("dev.expfolio");
};

let domain: string;
if (isDevelopment) {
    domain = DEVELOPMENT_DOMAIN;
} else {
    domain = `https://api.${hostname}`;
}

export { domain };

export const getEmailDomain = () => {
    if (PRODUCTION_DOMAIN.includes(".")) {
        return PRODUCTION_DOMAIN.split(".")[1] + "." + PRODUCTION_DOMAIN.split(".")[2];
    } else {
        return PRODUCTION_DOMAIN.split("http://")[1];
    }
};
