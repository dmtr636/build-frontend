/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setDefaultHandler, NavigationRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst, NetworkOnly, CacheFirst } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { RangeRequestsPlugin } from "workbox-range-requests";
import { createHandlerBoundToURL } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();
self.registration.navigationPreload?.enable?.();

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

const getBaseDomain = (hostname: string) => {
    const parts = hostname.split(".");
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join(".");
};
const baseDomain = getBaseDomain(self.location.hostname);
const apiOrigin = `${self.location.protocol}//api.${baseDomain}`;
const isApiHost = (url: URL) => url.origin === apiOrigin;

const makeBgSync = (name: string) =>
    new BackgroundSyncPlugin(name, {
        maxRetentionTime: 24 * 60, // minutes
    });

const writeMethods = ["POST", "PUT", "PATCH", "DELETE"] as const;
for (const method of writeMethods) {
    registerRoute(
        ({ request, url }) =>
            request.method === method && isApiHost(url) && url.pathname.startsWith("/api/"),
        new NetworkOnly({ plugins: [makeBgSync(`api-${method.toLowerCase()}-queue`)] }),
        method,
    );
}

registerRoute(
    ({ request, url }) =>
        request.method === "GET" && isApiHost(url) && url.pathname.startsWith("/api/"),
    new NetworkFirst({
        cacheName: "api-get-nf-cache",
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    }),
);

registerRoute(
    ({ request, url }) =>
        request.method === "GET" && isApiHost(url) && url.pathname.startsWith("/actuator/"),
    new NetworkFirst({
        cacheName: "api-get-actuator-nf-cache",
        networkTimeoutSeconds: 5,
    }),
);

registerRoute(
    ({ request, url }) =>
        request.method === "GET" &&
        isApiHost(url) &&
        (url.pathname === "/cdn/files" || url.pathname.startsWith("/cdn/files/")),
    new CacheFirst({
        cacheName: "cdn-files-cache",
        plugins: [
            new RangeRequestsPlugin(),
            new CacheableResponsePlugin({ statuses: [0, 200, 206] }),
            new ExpirationPlugin({
                maxEntries: 1000,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    }),
);

registerRoute(
    ({ request }) =>
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "worker",
    new StaleWhileRevalidate({
        cacheName: "assets-swr",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 1000,
                maxAgeSeconds: 7 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    }),
);

registerRoute(
    ({ request, url }) =>
        request.destination === "image" &&
        !(
            isApiHost(url) &&
            (url.pathname === "/cdn/files" || url.pathname.startsWith("/cdn/files/"))
        ),
    new CacheFirst({
        cacheName: "images-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 1000,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    }),
);

setDefaultHandler(
    new NetworkFirst({
        cacheName: "default-nf",
        networkTimeoutSeconds: 5,
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
);

const navigationHandler = createHandlerBoundToURL("/index.html");

const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//, /^\/cdn\/files(?:\/|$)/, /\/[^/?]+\.[^/]+$/i],
});

registerRoute(navigationRoute);
