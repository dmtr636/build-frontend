// src/sw-env.d.ts
/// <reference lib="webworker" />
export {};

declare global {
    interface Window {}

    interface ServiceWorkerGlobalScope {
        __WB_MANIFEST: Array<{ url: string; revision?: string }>;
    }
}
