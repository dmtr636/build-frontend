import { useEffect, useRef, useState } from "react";

export type LatLng = { latitude: number; longitude: number };

type GeoState = {
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    ts: number;
} | null;

type GeoOptions = PositionOptions & { throttleMs?: number };

export function useGeolocation(opts: GeoOptions = {}) {
    const { throttleMs = 0, ...geoOpts } = opts;
    const [pos, setPos] = useState<GeoState>(null);
    const [error, setError] = useState<string | null>(null);
    const lastEmit = useRef<number>(0);
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Геолокация не поддерживается");
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (p) => {
                const now = Date.now();
                if (throttleMs && now - lastEmit.current < throttleMs) return;
                lastEmit.current = now;

                setPos({
                    lat: p.coords.latitude,
                    lng: p.coords.longitude,
                    accuracy: p.coords.accuracy,
                    speed: p.coords.speed,
                    heading: p.coords.heading,
                    ts: p.timestamp,
                });
            },
            (err) => setError(err.message),
            geoOpts,
        );

        return () => {
            if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [throttleMs, geoOpts.enableHighAccuracy, geoOpts.maximumAge, geoOpts.timeout]);

    return { pos, error };
}
