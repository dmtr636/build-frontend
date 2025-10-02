import { useEffect, useMemo, useRef, useState } from "react";
import { LatLng, useGeolocation } from "./useGeolocation";

function makeBBox(polygon: LatLng[]) {
    let minLat = Infinity,
        maxLat = -Infinity,
        minLng = Infinity,
        maxLng = -Infinity;
    for (const p of polygon) {
        if (p.latitude < minLat) minLat = p.latitude;
        if (p.latitude > maxLat) maxLat = p.latitude;
        if (p.longitude < minLng) minLng = p.longitude;
        if (p.longitude > maxLng) maxLng = p.longitude;
    }
    return { minLat, maxLat, minLng, maxLng };
}

function inBBox(
    point: LatLng,
    box: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
    const { latitude: y, longitude: x } = point;
    return y >= box.minLat && y <= box.maxLat && x >= box.minLng && x <= box.maxLng;
}

export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
    const x = point.longitude; // как X
    const y = point.latitude; // как Y
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].longitude,
            yi = polygon[i].latitude;
        const xj = polygon[j].longitude,
            yj = polygon[j].latitude;

        // Проверка попадания на ребро (включительно)
        const onSegment =
            Math.min(xi, xj) <= x &&
            x <= Math.max(xi, xj) &&
            Math.min(yi, yj) <= y &&
            y <= Math.max(yi, yj) &&
            // Коллинеарность с допуском
            Math.abs((xj - xi) * (y - yi) - (yj - yi) * (x - xi)) < 1e-12;
        if (onSegment) return true;

        // Стандартный ray casting
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;

        if (intersect) inside = !inside;
    }
    return inside;
}

export type UseGeofenceOptions = {
    polygon: LatLng[];
    throttleMs?: number; // троттлинг геолокации
    enableHighAccuracy?: boolean;
    maximumAge?: number;
    timeout?: number;
    minAccuracyMeters?: number; // игнорировать обновления хуже порога
    onEnter?: (pos: { lat: number; lng: number; ts: number }) => void;
    onExit?: (pos: { lat: number; lng: number; ts: number }) => void;
};

export function useGeofence({
    polygon,
    throttleMs = 1000,
    enableHighAccuracy = true,
    maximumAge = 5000,
    timeout = 10000,
    minAccuracyMeters = 100,
    onEnter,
    onExit,
}: UseGeofenceOptions) {
    const { pos, error } = useGeolocation({
        throttleMs,
        enableHighAccuracy,
        maximumAge,
        timeout,
    });

    const bbox = useMemo(() => makeBBox(polygon), [polygon]);
    const [inside, setInside] = useState<boolean | null>(null);
    const lastInside = useRef<boolean | null>(null);
    const [lastChangeTs, setLastChangeTs] = useState<number | null>(null);

    useEffect(() => {
        if (!polygon?.length) {
            return;
        }
        if (!pos) return;
        if (pos.accuracy && pos.accuracy > minAccuracyMeters) return; // слишком шумно — игнор

        const point: LatLng = { latitude: pos.lat, longitude: pos.lng };
        let isInside = false;

        // Сначала быстрая проверка по bbox, затем точная
        if (inBBox(point, bbox)) {
            isInside = isPointInPolygon(point, polygon);
        } else {
            isInside = false;
        }

        setInside(isInside);

        // События входа/выхода
        if (lastInside.current === null) {
            lastInside.current = isInside;
            setLastChangeTs(pos.ts);
            return;
        }

        if (isInside !== lastInside.current) {
            lastInside.current = isInside;
            setLastChangeTs(pos.ts);
            if (isInside && onEnter) onEnter({ lat: pos.lat, lng: pos.lng, ts: pos.ts });
            if (!isInside && onExit) onExit({ lat: pos.lat, lng: pos.lng, ts: pos.ts });
        }
    }, [pos, bbox, polygon, minAccuracyMeters, onEnter, onExit]);

    return {
        pos,
        error,
        inside, // true/false/null(еще нет позиции)
        lastChangeTs, // когда изменилось состояние inside
    };
}
