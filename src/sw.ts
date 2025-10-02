/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst, NetworkOnly, CacheFirst } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

const postBgSync = new BackgroundSyncPlugin("postQueue", {
    maxRetentionTime: 24 * 60,
});

registerRoute(
    ({ request, url }) =>
        request.method === "POST" &&
        url.origin === self.location.origin &&
        url.pathname.startsWith("/api/"),
    new NetworkOnly({ plugins: [postBgSync] }),
    "POST",
);

registerRoute(
    ({ request, url }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        url.pathname.startsWith("/api/"),
    new StaleWhileRevalidate({
        cacheName: "api-get-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 60 * 60,
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
    }),
);

registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    }),
);

setDefaultHandler(new NetworkFirst());
