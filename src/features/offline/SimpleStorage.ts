export interface SimpleStorage {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
}

export class LocalStorageJSON implements SimpleStorage {
    constructor(private prefix = "oq:") {}
    async get<T>(key: string): Promise<T | undefined> {
        try {
            const raw = localStorage.getItem(this.prefix + key);
            return raw ? (JSON.parse(raw) as T) : undefined;
        } catch {
            return undefined;
        }
    }
    async set<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
}
