import { makeAutoObservable } from "mobx";
import { v4 } from "uuid";

export interface Listener {
    id: string;
    action: (payload: any) => void;
}

export class EventBusStore {
    private listeners: Map<string, Map<string, Listener>> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    on = (event: string, action: Listener["action"]) => {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Map());
        }
        const id = v4();
        this.listeners.get(event)?.set(id, {
            id,
            action,
        });
        return () => {
            this.listeners.get(event)?.delete(id);
        };
    };

    emit = (event: string, payload: any) => {
        [...(this.listeners.get(event)?.values() ?? [])].forEach((listener) => {
            listener.action(payload);
        });
    };
}
