export const validateUrl = (text: string) => {
    if (!text.trim() || /\s/.test(text)) {
        return false;
    }
    let urlToCheck = text;
    if (!/^https?:\/\//i.test(text)) {
        urlToCheck = `https://${text}`;
    }
    try {
        const url = new URL(urlToCheck);
        const hostname = url.hostname;

        const isValidTld = /\.([a-z]{2,}|[a-z]{2}\.[a-z]{2})$/i.test(hostname);
        const isValidDomain =
            hostname.length > 0 &&
            !hostname.startsWith(".") &&
            !hostname.endsWith(".") &&
            hostname.includes(".");

        return isValidDomain && isValidTld;
    } catch (_) {
        return false;
    }
};

export function ensureHttps(url: string) {
    try {
        const trimmedUrl = url.trim();
        const domainRegex = /^[\w.-]+\.[a-z]{2,}$/i;

        let cleanUrl = trimmedUrl;

        if (cleanUrl.startsWith("http://")) {
            cleanUrl = cleanUrl.slice(7);
        } else if (cleanUrl.startsWith("https://")) {
            cleanUrl = cleanUrl.slice(8);
        }

        const domainPart = cleanUrl.split("/")[0];

        if (!domainRegex.test(domainPart)) {
            throw new Error("Некорректная ссылка");
        }

        if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
            return "https://" + trimmedUrl;
        }

        return trimmedUrl;
    } catch (error) {
        return url;
    }
}

export function removeHttps(url: string) {
    if (url?.startsWith("https://")) return url.replace(/^https:\/\//, "");
    return url;
}
