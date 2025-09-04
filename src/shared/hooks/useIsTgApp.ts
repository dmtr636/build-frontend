export const tgAppConfig = {
    errorInit: false,
};

export const useIsTgApp = () => {
    return isTgAppLocation() && !tgAppConfig.errorInit;
};

export const isTgAppLocation = () => {
    return window.location.hostname.includes("tg-app.expfolio");
};
