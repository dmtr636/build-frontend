// OlObjectsEditor.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Point, Polygon } from "ol/geom";

import { fromLonLat, toLonLat } from "ol/proj";
import { Draw, Modify, Select, Snap } from "ol/interaction";
import { click } from "ol/events/condition";

import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

type LatLng = { lat: number; lng: number };

export type MapObject = {
    id: string;
    name: string;
    marker: LatLng;
    polygon: LatLng[];
    color?: string;
};

type Props = {
    objects: MapObject[];
    center?: LatLng;
    zoom?: number;
    height?: string | number;
    onObjectsChange?: (next: MapObject[]) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const centroid = (coords: LatLng[]): LatLng => {
    let sx = 0,
        sy = 0;
    for (const p of coords) {
        sx += p.lat;
        sy += p.lng;
    }
    const n = Math.max(coords.length, 1);
    return { lat: sx / n, lng: sy / n };
};

const llToXY = (p: LatLng) => fromLonLat([p.lng, p.lat]);
const xyToLL = (xy: [number, number]) => {
    const [lng, lat] = toLonLat(xy);
    return { lat, lng };
};

// OpenLayers Polygon coords: [ [ [x,y], ... ] ]
const llRingToXY = (ring: LatLng[]) => [ring.map(llToXY)];

// --- Стили
const makePolygonStyle = (color?: string) =>
    new Style({
        fill: new Fill({ color: color ? `${color}22` : "rgba(25,113,194,0.15)" }),
        stroke: new Stroke({ color: color ?? "#1971c2", width: 2 }),
    });

const markerStyle = new Style({
    image: new CircleStyle({
        radius: 6,
        stroke: new Stroke({ color: "#222", width: 1 }),
        fill: new Fill({ color: "#fff" }),
    }),
});

// --- Идентификаторы фич
const polyId = (id: string) => `poly-${id}`;
const markId = (id: string) => `mark-${id}`;

export default function OlObjectsEditor({
    objects,
    center = { lat: 55.75, lng: 37.61 },
    zoom = 12,
    height = "70vh",
    onObjectsChange,
}: Props) {
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const vectorSrcRef = useRef<VectorSource | null>(null);
    const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
    const esriLayerRef = useRef<TileLayer<XYZ> | null>(null);

    const objectsRef = useRef<MapObject[]>(objects);
    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    const initialCenterXY = useMemo(() => llToXY(center), [center]);

    // локальный стейт для UI-переключателя
    const [base, setBase] = useState<"osm" | "esri">("osm");

    // --- Инициализация карты (один раз)
    useEffect(() => {
        if (!mapDivRef.current) return;

        // Базовые слои: OSM и Esri World Imagery (спутник)
        const osm = new TileLayer({ visible: true, source: new OSM() });
        const esri = new TileLayer({
            visible: false,
            source: new XYZ({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attributions:
                    "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
                maxZoom: 19,
            }),
        });

        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({ source: vectorSource });

        const map = new Map({
            target: mapDivRef.current,
            layers: [osm, esri, vectorLayer],
            view: new View({ center: initialCenterXY, zoom }),
        });

        // Интеракции
        const select = new Select({ condition: click });
        const modify = new Modify({ source: vectorSource });
        const draw = new Draw({ source: vectorSource, type: "Polygon" });
        const snap = new Snap({ source: vectorSource });

        map.addInteraction(select);
        map.addInteraction(modify);
        map.addInteraction(draw);
        map.addInteraction(snap);

        // Рисование
        draw.on("drawend", (e) => {
            const geom = e.feature.getGeometry() as Polygon;
            const coordsXY = geom.getCoordinates()[0] as [number, number][];
            const coordsLL = coordsXY.map(xyToLL);

            const newObj: MapObject = {
                id: uid(),
                name: "Новый объект",
                polygon: coordsLL,
                marker: centroid(coordsLL),
            };

            vectorSource.removeFeature(e.feature);
            addObjectFeatures(vectorSource, newObj);

            onObjectsChange?.([...objectsRef.current, newObj]);
        });

        // Редактирование
        modify.on("modifyend", (e) => {
            const next = objectsRef.current.map((o) => ({ ...o }));
            e.features.forEach((f) => {
                const id = f.getId?.();
                if (typeof id !== "string" || !id.startsWith("poly-")) return;
                const objId = id.replace("poly-", "");
                const idx = next.findIndex((x) => x.id === objId);
                if (idx === -1) return;

                const geom = f.getGeometry() as Polygon;
                const coordsXY = geom.getCoordinates()[0] as [number, number][];
                const coordsLL = coordsXY.map(xyToLL);

                next[idx].polygon = coordsLL;
                next[idx].marker = centroid(coordsLL);

                const mf = vectorSource.getFeatureById(markId(objId)) as Feature<Point> | null;
                if (mf) mf.setGeometry(new Point(llToXY(next[idx].marker)));
            });
            onObjectsChange?.(next);
        });

        // Удаление выбранных фич клавишей Delete
        const keyHandler = (ev: KeyboardEvent) => {
            if (ev.key !== "Delete") return;
            const sel = map
                .getInteractions()
                .getArray()
                .find((i) => i instanceof Select) as Select;
            const selFeatures = sel.getFeatures();
            if (!selFeatures.getLength()) return;

            const idsToDelete = new Set<string>();
            selFeatures.forEach((f) => {
                const id = f.getId?.();
                if (typeof id !== "string") return;
                if (id.startsWith("poly-")) idsToDelete.add(id.replace("poly-", ""));
                if (id.startsWith("mark-")) idsToDelete.add(id.replace("mark-", ""));
            });

            idsToDelete.forEach((objId) => {
                const pf = vectorSource.getFeatureById(polyId(objId));
                const mf = vectorSource.getFeatureById(markId(objId));
                if (pf) vectorSource.removeFeature(pf);
                if (mf) vectorSource.removeFeature(mf);
            });

            if (idsToDelete.size > 0) {
                const next = objectsRef.current.filter((o) => !idsToDelete.has(o.id));
                onObjectsChange?.(next);
            }
        };
        map.getViewport().addEventListener("keydown", keyHandler);
        map.getViewport().tabIndex = 0;

        // refs
        mapRef.current = map;
        vectorSrcRef.current = vectorSource;
        vectorLayerRef.current = vectorLayer;
        osmLayerRef.current = osm;
        esriLayerRef.current = esri;

        return () => {
            map.getViewport().removeEventListener("keydown", keyHandler);
            map.setTarget(undefined);
        };
    }, []);

    // Рендер объектов при изменении props.objects
    useEffect(() => {
        const vs = vectorSrcRef.current;
        if (!vs) return;
        vs.clear();
        for (const o of objects) addObjectFeatures(vs, o);
    }, [objects]);

    // Обновление центра/зума
    useEffect(() => {
        mapRef.current?.getView().setCenter(initialCenterXY);
    }, [initialCenterXY]);
    useEffect(() => {
        if (zoom != null) mapRef.current?.getView().setZoom(zoom);
    }, [zoom]);

    // Переключение базовых слоёв
    useEffect(() => {
        if (!osmLayerRef.current || !esriLayerRef.current) return;
        const osm = base === "osm";
        osmLayerRef.current.setVisible(osm);
        esriLayerRef.current.setVisible(!osm);
    }, [base]);

    return (
        <div style={{ height, width: "100%", position: "relative" }}>
            {/* Простой UI-переключатель */}
            <div
                style={{
                    position: "absolute",
                    zIndex: 1000,
                    top: 10,
                    right: 10,
                    background: "rgba(255,255,255,0.9)",
                    padding: "6px 8px",
                    borderRadius: 8,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                }}
            >
                <label style={{ fontSize: 12, color: "#444", marginRight: 6 }}>База:</label>
                <select
                    value={base}
                    onChange={(e) => setBase(e.target.value as "osm" | "esri")}
                    style={{ fontSize: 12 }}
                >
                    <option value="osm">OSM</option>
                    <option value="esri">Esri World Imagery</option>
                </select>
            </div>

            <div ref={mapDivRef} style={{ height: "100%", width: "100%", outline: "none" }} />
        </div>
    );
}

// Добавляет векторные фичи объекта (полигон + метка) в источник
function addObjectFeatures(vs: VectorSource, o: MapObject) {
    const poly = new Feature<Polygon>({
        geometry: new Polygon(llRingToXY(o.polygon)),
    });
    poly.setId(polyId(o.id));
    poly.setStyle(makePolygonStyle(o.color));

    const mark = new Feature<Point>({
        geometry: new Point(llToXY(o.marker)),
    });
    mark.setId(markId(o.id));
    mark.setStyle(markerStyle);

    vs.addFeatures([poly, mark]);
}
