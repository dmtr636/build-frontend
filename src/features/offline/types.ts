export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type EnqueueOptions = {
    id?: string;
    url: string;
    method: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
    dedupeKey?: string;
    maxRetries?: number;
    retryBaseDelayMs?: number;
    timeoutMs?: number;
    rawBody?: boolean;
};

export type QueueItem = Required<
    Pick<EnqueueOptions, "id" | "url" | "method" | "maxRetries" | "retryBaseDelayMs" | "timeoutMs">
> & {
    createdAt: number;
    attempt: number;
    headers?: Record<string, string>;
    body?: any;
    rawBody?: boolean;
    dedupeKey?: string;
};

export type FlushResult =
    | { ok: true; id: string; response: Response }
    | { ok: false; id: string; error: Error; willRetry: boolean };
