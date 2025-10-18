import { useEffect, useMemo, useRef, useState } from "react";
import { transformUrl } from "src/shared/utils/transformUrl.ts";

type Options = {
    testUrl?: string;
    intervalMs?: number;
    timeoutMs?: number;
    method?: "HEAD" | "GET";
};

export function useOnlineStatus(opts: Options = {}) {
    const {
        testUrl = transformUrl("/actuator/health"),
        intervalMs = 5000,
        timeoutMs = 3000,
        method = "GET",
    } = opts;

    const [online, setOnline] = useState<boolean>(
        typeof navigator !== "undefined" ? navigator.onLine : true,
    );
    const controllerRef = useRef<AbortController | null>(null);

    const check = useMemo(
        () => async () => {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                setOnline(false);
                return;
            }
            controllerRef.current?.abort();
            const ac = new AbortController();
            controllerRef.current = ac;
            const to = setTimeout(() => ac.abort(), timeoutMs);

            try {
                const res = await fetch(testUrl, {
                    method,
                    cache: "no-store",
                    signal: ac.signal,
                    credentials: "include",
                });
                setOnline(res.ok);
            } catch {
                setOnline(false);
            } finally {
                clearTimeout(to);
            }
        },
        [method, testUrl, timeoutMs],
    );

    useEffect(() => {
        const onOnline = () => void check();
        const onOffline = () => setOnline(false);
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        void check();
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
            controllerRef.current?.abort();
        };
    }, [check]);

    useEffect(() => {
        if (!intervalMs) return;
        const id = setInterval(() => void check(), intervalMs);
        return () => clearInterval(id);
    }, [check, intervalMs]);

    return online;
}
