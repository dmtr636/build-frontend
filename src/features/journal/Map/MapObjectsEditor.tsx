// MapObjectsEditor.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    FeatureGroup,
    LayersControl,
} from "react-leaflet";
import L, { LatLngLiteral, PathOptions } from "leaflet";
import { EditControl } from "react-leaflet-draw";
const { BaseLayer } = LayersControl;

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// --- Fix стандартной иконки Leaflet в сборках Vite ---
import marker2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2xUrl,
    iconUrl: markerUrl,
    shadowUrl,
});

// ===== Типы данных =====
export type MapObject = {
    id: string;
    name: string;
    marker: LatLngLiteral; // позиция метки
    polygon: LatLngLiteral[]; // контур объекта (координаты в порядке обхода)
    color?: string; // опциональный цвет полигона
};

type Props = {
    objects: MapObject[];
    center?: LatLngLiteral;
    zoom?: number;
    height?: string | number;
    onObjectsChange?: (next: MapObject[]) => void;
};

// ===== Вспомогательные =====
const centroid = (coords: LatLngLiteral[]): LatLngLiteral => {
    // Простой геометрический центроид (для небольших полигонов ок)
    let x = 0,
        y = 0;
    coords.forEach((p) => {
        x += p.lat;
        y += p.lng;
    });
    const n = Math.max(coords.length, 1);
    return { lat: x / n, lng: y / n };
};

const toCoords = (latLngs: L.LatLng[] | L.LatLng[][]): LatLngLiteral[] => {
    // Принимаем внешний контур: L.Polygon может отдавать [ring][pts]
    const arr = Array.isArray(latLngs[0]) ? (latLngs as L.LatLng[][])[0] : (latLngs as L.LatLng[]);
    return arr.map((p) => ({ lat: p.lat, lng: p.lng }));
};

// Генерация id для новых объектов
const uid = () => Math.random().toString(36).slice(2, 10);

// ====== Компонент карты ======
export default function MapObjectsEditor({
    objects,
    center = { lat: 55.75, lng: 37.61 },
    zoom = 12,
    height = "70vh",
    onObjectsChange,
}: Props) {
    // Держим актуальную копию объектов в ref для удобства апдейтов из коллбеков
    const objectsRef = useRef<MapObject[]>(objects);
    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    // Слой, к которому привязан EditControl
    const fgRef = useRef<L.FeatureGroup | null>(null);

    // Карта: сопоставление L.Layer -> objectId, чтобы знать, что именно отредактировали
    const layerToId = useRef(new Map<number, string>());

    // Цвета полигонов по объектам
    const polyStyle = (obj: MapObject): PathOptions => ({
        color: obj.color ?? "#1971c2",
        weight: 2,
        fillOpacity: 0.15,
    });

    // Удобная отправка наверх
    const emit = (next: MapObject[]) => onObjectsChange?.(next);

    // При создании нового полигона через панель инструментов
    const handleCreated = (e: any) => {
        if (e.layerType === "polygon") {
            const layer: L.Polygon = e.layer;
            const latlngs = layer.getLatLngs();
            const coords = toCoords(latlngs as any);

            const newObj: MapObject = {
                id: uid(),
                name: `Новый объект`,
                polygon: coords,
                marker: centroid(coords),
            };

            // Привязываем новый слой к объекту
            const lid = L.Util.stamp(layer);
            layerToId.current.set(lid, newObj.id);

            emit([...objectsRef.current, newObj]);
        }
    };

    // При редактировании (двигали вершины)
    const handleEdited = (e: any) => {
        const edited = new Map<string, LatLngLiteral[]>(); // id -> новые coords

        e.layers.eachLayer((layer: any) => {
            const lid = L.Util.stamp(layer);
            const objectId = layerToId.current.get(lid);
            if (!objectId) return;
            const coords = toCoords(layer.getLatLngs());
            edited.set(objectId, coords);
        });

        if (edited.size === 0) return;

        const next = objectsRef.current.map((o) =>
            edited.has(o.id)
                ? { ...o, polygon: edited.get(o.id)!, marker: centroid(edited.get(o.id)!) }
                : o,
        );
        emit(next);
    };

    // При удалении слоёв
    const handleDeleted = (e: any) => {
        const deletedIds = new Set<string>();
        e.layers.eachLayer((layer: any) => {
            const lid = L.Util.stamp(layer);
            const objectId = layerToId.current.get(lid);
            if (objectId) deletedIds.add(objectId);
            layerToId.current.delete(lid);
        });
        if (deletedIds.size === 0) return;
        const next = objectsRef.current.filter((o) => !deletedIds.has(o.id));
        emit(next);
    };

    // При монтировании каждого Polygon — регистрируем соответствие layer -> objectId
    const bindLayer = (objId: string) => (layer: L.Polygon | null) => {
        if (!layer) return;
        const lid = L.Util.stamp(layer);
        layerToId.current.set(lid, objId);
    };

    // Центр карты по объектам (если есть)
    const mapCenter = useMemo(() => {
        if (objects.length > 0) return objects[0].marker ?? center;
        return center;
    }, [objects, center]);

    return (
        <MapContainer center={mapCenter} zoom={zoom} style={{ height, width: "100%" }}>
            <LayersControl position="topright">
                <BaseLayer checked name="OSM">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                    />
                </BaseLayer>

                <BaseLayer name="Esri World Imagery (спутник)">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                    />
                </BaseLayer>
            </LayersControl>
            {objects.map((o) => (
                <Marker key={`m-${o.id}`} position={o.marker}>
                    <Popup>
                        <b>{o.name}</b>
                        <div>id: {o.id}</div>
                    </Popup>
                </Marker>
            ))}

            <FeatureGroup ref={fgRef as any}>
                {/* Панель рисования/редактирования */}
                <EditControl
                    position="topleft"
                    onCreated={handleCreated}
                    onEdited={handleEdited}
                    onDeleted={handleDeleted}
                    draw={{
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        polyline: false,
                        marker: false,
                        polygon: {
                            allowIntersection: false,
                            showArea: true,
                            drawError: { color: "#e03131", message: "Нельзя самопересечение" },
                        },
                    }}
                    edit={{
                        remove: true,
                    }}
                />

                {/* Существующие полигоны объектов (редактируемые) */}
                {objects.map((o) => (
                    <Polygon
                        key={`p-${o.id}`}
                        positions={o.polygon}
                        pathOptions={polyStyle(o)}
                        ref={bindLayer(o.id)}
                    />
                ))}
            </FeatureGroup>
        </MapContainer>
    );
}
