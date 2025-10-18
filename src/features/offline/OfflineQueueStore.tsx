import { makeAutoObservable, runInAction } from "mobx";
import { EnqueueOptions, FlushResult, QueueItem } from "./types";
import { LocalStorageJSON, SimpleStorage } from "./SimpleStorage.ts";
import { transformUrl } from "src/shared/utils/transformUrl.ts";
import { offlineStore } from "src/app/AppStore.ts";

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type ConstructorOptions = {
    storage?: SimpleStorage;
    storageKey?: string;
    concurrency?: number; // default 3
    getOnline?: () => boolean; // default: navigator.onLine
    requestInitTransform?: (item: QueueItem, init: RequestInit) => RequestInit;
    urlTransform?: (url: string) => string;
};

export class OfflineQueueStore {
    queue: QueueItem[] = [];
    inFlight = new Set<string>();
    online = typeof navigator !== "undefined" ? navigator.onLine : true;

    private storage: SimpleStorage;
    private storageKey: string;
    private getOnline: () => boolean;
    private concurrency: number;
    private requestInitTransform?: ConstructorOptions["requestInitTransform"];
    private urlTransform?: ConstructorOptions["urlTransform"];
    private flushTimer?: number;

    constructor(opts: ConstructorOptions = {}) {
        this.storage = opts.storage ?? new LocalStorageJSON();
        this.storageKey = opts.storageKey ?? "queue";
        this.getOnline =
            opts.getOnline ?? (() => (typeof navigator !== "undefined" ? navigator.onLine : true));
        this.concurrency = Math.max(1, opts.concurrency ?? 3);
        this.requestInitTransform = opts.requestInitTransform;
        this.urlTransform = opts.urlTransform;

        makeAutoObservable(this, {}, { autoBind: true });
        void this.hydrate();
        if (typeof window !== "undefined") {
            window.addEventListener("online", this.handleOnline);
            window.addEventListener("offline", this.handleOffline);
        }
    }

    async hydrate() {
        const data = await this.storage.get<QueueItem[]>(this.storageKey);
        runInAction(() => {
            this.queue = Array.isArray(data) ? data : [];
        });
    }

    private async persist() {
        await this.storage.set(this.storageKey, this.queue);
    }

    setOnline(state: boolean) {
        this.online = state;
        if (state) this.scheduleFlush(0);
    }

    private handleOnline = () => this.setOnline(true);
    private handleOffline = () => this.setOnline(false);

    async enqueue(opts: EnqueueOptions) {
        const item: QueueItem = {
            id: opts.id ?? genId(),
            url: opts.url,
            method: opts.method,
            body: opts.body,
            headers: opts.headers,
            createdAt: Date.now(),
            attempt: 0,
            maxRetries: opts.maxRetries ?? 3,
            retryBaseDelayMs: Math.max(100, opts.retryBaseDelayMs ?? 1000),
            timeoutMs: Math.max(1000, opts.timeoutMs ?? 15000),
            rawBody: !!opts.rawBody,
            dedupeKey: opts.dedupeKey,
        };

        if (item.dedupeKey) {
            this.queue = this.queue.filter((q) => q.dedupeKey !== item.dedupeKey);
        }

        this.queue.push(item);
        await this.persist();

        if (this.getOnline()) {
            this.scheduleFlush(0);
        }
        return item.id;
    }

    private async remove(id: string) {
        this.queue = this.queue.filter((q) => q.id !== id);
        await this.persist();
    }

    get activeSlots() {
        return this.inFlight.size;
    }
    get hasCapacity() {
        return this.activeSlots < this.concurrency;
    }

    private scheduleFlush(delayMs: number) {
        if (this.flushTimer) window.clearTimeout(this.flushTimer);
        this.flushTimer = window.setTimeout(() => {
            void this.flush();
        }, delayMs);
    }

    async flush(): Promise<FlushResult[]> {
        if (!this.getOnline()) return [];

        const results: FlushResult[] = [];
        const toRun = this.queue
            .filter((q) => !this.inFlight.has(q.id))
            .slice(0, Math.max(0, this.concurrency - this.activeSlots));

        await Promise.all(
            toRun.map(async (item) => {
                this.inFlight.add(item.id);
                try {
                    const res = await this.perform(item);
                    results.push({ ok: true, id: item.id, response: res });
                    await this.remove(item.id);
                } catch (e: any) {
                    const willRetry = item.attempt <= item.maxRetries;
                    results.push({ ok: false, id: item.id, error: e, willRetry });
                    if (willRetry) {
                        const delay =
                            item.retryBaseDelayMs * Math.pow(2, Math.max(0, item.attempt - 1));
                        setTimeout(() => this.scheduleFlush(0), delay);
                    }
                } finally {
                    this.inFlight.delete(item.id);
                }
            }),
        );

        if (this.queue.length && this.getOnline() && this.hasCapacity) {
            this.scheduleFlush(0);
        }
        return results;
    }

    private async perform(item: QueueItem): Promise<Response> {
        item.attempt += 1;
        await this.persist();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), item.timeoutMs);

        const init: RequestInit = {
            method: item.method,
            headers: {
                "Content-Type": item.rawBody ? "application/octet-stream" : "application/json",
                ...item.headers,
            },
            body:
                item.method === "GET" || item.method === "HEAD"
                    ? undefined
                    : item.rawBody
                      ? (item.body as BodyInit)
                      : item.body != null
                        ? JSON.stringify(item.body)
                        : undefined,
            signal: controller.signal,
            cache: "no-store",
            keepalive: true,
            credentials: "include",
        };

        const url = this.urlTransform ? this.urlTransform(item.url) : item.url;

        const finalInit = this.requestInitTransform ? this.requestInitTransform(item, init) : init;

        try {
            const res = await fetch(url, finalInit);
            if (!res.ok) {
                if (res.status >= 500 || res.status === 429) {
                    if (item.attempt <= item.maxRetries) {
                        throw new Error(`Retryable HTTP ${res.status}`);
                    }
                }
                await this.remove(item.id);
                return res;
            }
            return res;
        } catch (err: any) {
            if (item.attempt <= item.maxRetries) {
                throw err instanceof Error ? err : new Error(String(err));
            }
            await this.remove(item.id);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            clearTimeout(timeout);
        }
    }

    async reset() {
        this.queue = [];
        this.inFlight.clear();
        await this.persist();
    }

    dispose() {
        if (typeof window !== "undefined") {
            window.removeEventListener("online", this.handleOnline);
            window.removeEventListener("offline", this.handleOffline);
        }
        if (this.flushTimer) window.clearTimeout(this.flushTimer);
    }
}

export const offlineQueue = new OfflineQueueStore({
    concurrency: 3,
    urlTransform: (url) => url,
    getOnline: () => offlineStore.isOnline,
});

export const enqueueApi = {
    post: (url: string, body?: any, headers?: Record<string, string>) =>
        offlineQueue.enqueue({ url, method: "POST", body, headers }),
    put: (url: string, body?: any, headers?: Record<string, string>) =>
        offlineQueue.enqueue({ url, method: "PUT", body, headers }),
    patch: (url: string, body?: any, headers?: Record<string, string>) =>
        offlineQueue.enqueue({ url, method: "PATCH", body, headers }),
    delete: (url: string, body?: any, headers?: Record<string, string>) =>
        offlineQueue.enqueue({ url, method: "DELETE", body, headers }),
};
