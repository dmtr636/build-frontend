export const isUrlValid = (url: string) => {
    if (!url) {
        return false;
    }
    if (!url.startsWith("https://")) {
        url += "https://";
    }
    return url.split(".").length > 1 && url.split(".").every((part) => part.length > 0);
};
