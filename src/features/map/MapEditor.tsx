import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    FeatureGroup,
    LayersControl,
    Tooltip,
    useMapEvent,
} from "react-leaflet";
import L, { LatLngLiteral, PathOptions } from "leaflet";
const { BaseLayer } = LayersControl;

import "leaflet/dist/leaflet.css";
import "leaflet-draw"; // используем только editing API (без тулбара)
import "leaflet-draw/dist/leaflet.draw.css";

import styles from "./Map.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconMinus, IconPlus } from "src/ui/assets/icons";
import { Switch } from "src/ui/components/controls/Switch/Switch.tsx";
import { IconMapPin } from "src/features/map/assets";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: IconMapPin,
    iconUrl: IconMapPin,
    iconSize: [40, 40],
    iconAnchor: [20, 30],
    popupAnchor: [0, -40],
    shadowUrl: "",
});

export type MapEditorValue = {
    name?: string;
    marker?: LatLngLiteral | null;
    polygon?: LatLngLiteral[] | null;
    color?: string;
};

type Props = {
    value: MapEditorValue;
    onChange: (next: MapEditorValue) => void;
    center?: LatLngLiteral;
    zoom?: number;
    height?: string | number;
    bounds?: [[number, number], [number, number]];
};

const toCoords = (latLngs: L.LatLng[] | L.LatLng[][]): LatLngLiteral[] => {
    const arr = Array.isArray(latLngs[0]) ? (latLngs as L.LatLng[][])[0] : (latLngs as L.LatLng[]);
    return arr.map((p) => ({ lat: p.lat, lng: p.lng }));
};

const metersToDeg = (meters: number, atLat: number) => {
    const dLat = meters / 111_320;
    const dLng = meters / (111_320 * Math.cos((atLat * Math.PI) / 180));
    return { dLat, dLng };
};

const squareFromCenterMeters = (center: LatLngLiteral, sideMeters: number): LatLngLiteral[] => {
    const half = sideMeters / 2;
    const { dLat, dLng } = metersToDeg(half, center.lat);
    return [
        { lat: center.lat + dLat, lng: center.lng - dLng },
        { lat: center.lat + dLat, lng: center.lng + dLng },
        { lat: center.lat - dLat, lng: center.lng + dLng },
        { lat: center.lat - dLat, lng: center.lng - dLng },
    ];
};

function ClickToPlace({
    enabled,
    onPlace,
}: {
    enabled: boolean;
    onPlace: (latlng: LatLngLiteral) => void;
}) {
    useMapEvent("click", (e) => {
        if (!enabled) return;
        onPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    return null;
}

export default function MapEditor({
    value,
    onChange,
    center = { lat: 55.75, lng: 37.62 },
    zoom = 10,
    height = "75vh",
    bounds = [
        [55.05, 36.45],
        [56.35, 38.65],
    ],
}: Props) {
    const mapRef = useRef<L.Map>(null);
    const polygonLayerRef = useRef<L.Polygon | null>(null);
    const isEditingRef = useRef(false);
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const [showSatellite, setShowSatellite] = useState(false);
    const [placing, setPlacing] = useState(false);

    const polyStyle: PathOptions = {
        color: value.color ?? "#1971c2",
        weight: 2,
        fillOpacity: 0.2,
    };

    const mapCenter = useMemo(() => value.marker ?? center, [value.marker, center]);

    const commit = useCallback(
        (patch: Partial<MapEditorValue>) => onChange({ ...valueRef.current, ...patch }),
        [onChange],
    );

    // Метка — onChange на каждом движении
    const markerHandlers = useMemo(
        () => ({
            drag: (e: L.LeafletEvent) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                commit({ marker: { lat, lng } });
            },
            dragend: (e: L.LeafletEvent) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                commit({ marker: { lat, lng } });
            },
        }),
        [commit],
    );

    // Создание/удаление полигона ИМПЕРАТИВНО, без <Polygon/>
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // если нет полигона — очистим слой
        if (!value.polygon || value.polygon.length === 0) {
            if (polygonLayerRef.current) {
                polygonLayerRef.current.off();
                map.removeLayer(polygonLayerRef.current);
                polygonLayerRef.current = null;
            }
            return;
        }

        // создать или обновить слой
        if (!polygonLayerRef.current) {
            const layer = L.polygon(value.polygon, polyStyle).addTo(map);
            polygonLayerRef.current = layer as L.Polygon;

            // включить редактирование вершин (Leaflet.Draw internal API)
            (layer as any).editing?.enable?.();

            // хэндлеры редактирования
            layer.on("editstart", () => {
                isEditingRef.current = true;
            });

            // во время перетаскивания вершины — отдаём наружу «живые» координаты
            layer.on("edit", () => {
                const coords = toCoords((layer as any).getLatLngs());
                commit({ polygon: coords });
            });

            // по завершении — синхронизируем слой с последним состоянием
            layer.on("editend", () => {
                const coords = toCoords((layer as any).getLatLngs());
                isEditingRef.current = false;
                (layer as any).setLatLngs(coords);
                (layer as any).redraw();
                commit({ polygon: coords });
            });
        } else if (!isEditingRef.current) {
            // если пришли новые coords извне и мы НЕ редактируем — обновим слой
            (polygonLayerRef.current as any).setLatLngs(value.polygon);
            (polygonLayerRef.current as any).setStyle(polyStyle);
            (polygonLayerRef.current as any).redraw();
        } else {
            // если сейчас редактируем — внешний апдейт игнорируем, чтобы не было рассинхрона
        }

        return () => {
            // на размонтировании убираем слой
            if (polygonLayerRef.current && !map.hasLayer(polygonLayerRef.current)) {
                polygonLayerRef.current = null;
            }
        };
    }, [value.polygon, value.color]); // style тоже обновляем

    // Размер стартового квадрата ~20% меньшей стороны вьюпорта
    const viewportSquareSideMeters = useCallback((atLat: number) => {
        const map = mapRef.current;
        if (!map) return 200;
        const b = map.getBounds();
        const nw = b.getNorthWest();
        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
        const h = Math.abs(nw.lat - sw.lat) * 111_320;
        const w = Math.abs(ne.lng - nw.lng) * 111_320 * Math.cos((atLat * Math.PI) / 180);
        return Math.max(Math.min(w, h) * 0.2, 20);
    }, []);

    const handlePlaceRequest = () => setPlacing(true);
    const placeAt = (latlng: LatLngLiteral) => {
        const side = viewportSquareSideMeters(latlng.lat);
        const poly = squareFromCenterMeters(latlng, side);
        commit({ marker: latlng, polygon: poly });
        setPlacing(false);
    };

    return (
        <div className={styles.mapWrapper}>
            <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={zoom}
                style={{ height, width: "100%" }}
                minZoom={9}
                zoomControl={false}
                maxBounds={bounds}
            >
                <ClickToPlace enabled={placing} onPlace={placeAt} />

                <LayersControl position="topright">
                    <BaseLayer checked={!showSatellite} name="OSM">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap contributors"
                        />
                    </BaseLayer>
                    <BaseLayer checked={showSatellite} name="Esri World Imagery (спутник)">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                        />
                    </BaseLayer>
                </LayersControl>

                {value.marker && (
                    <Marker position={value.marker} draggable eventHandlers={markerHandlers}>
                        {value.name && (
                            <Tooltip
                                direction="top"
                                offset={[0, -10]}
                                opacity={1}
                                sticky
                                className={styles.tooltip}
                            >
                                <FlexColumn gap={8}>
                                    <Typo variant={"subheadM"} noWrap>
                                        {value.name}
                                    </Typo>
                                </FlexColumn>
                            </Tooltip>
                        )}
                    </Marker>
                )}

                {/* Нужен контейнер для корректного z-index внутренних паней */}
                <FeatureGroup />
            </MapContainer>

            {/* зум-кнопки */}
            <Button
                mode={"contrast"}
                type={"primary"}
                iconBefore={<IconPlus />}
                size={"small"}
                onClick={() => mapRef.current?.zoomIn()}
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 500,
                    boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                }}
            />
            <Button
                mode={"contrast"}
                type={"primary"}
                iconBefore={<IconMinus />}
                size={"small"}
                onClick={() => {
                    mapRef.current?.zoomOut();
                    if ((mapRef.current?.getZoom() ?? 0) < 10) {
                        return;
                    }
                }}
                style={{
                    position: "absolute",
                    top: 54,
                    left: 10,
                    zIndex: 500,
                    boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                }}
            />

            <div className={styles.switchWrapper}>
                <Switch
                    mode={"primary"}
                    title={"Спутник"}
                    checked={showSatellite}
                    onChange={setShowSatellite}
                />
            </div>

            {!value.marker && !placing && (
                <Button
                    type={"primary"}
                    mode={"contrast"}
                    size={"medium"}
                    onClick={handlePlaceRequest}
                    style={{
                        position: "absolute",
                        right: 12,
                        bottom: 12,
                        zIndex: 600,
                        boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                    }}
                >
                    Разместить объект на карте
                </Button>
            )}
            {placing && (
                <div
                    style={{
                        position: "absolute",
                        right: 12,
                        bottom: 12,
                        zIndex: 600,
                        background: "white",
                        borderRadius: 8,
                        padding: "8px 12px",
                        boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                    }}
                >
                    Кликните по карте для выбора точки
                </div>
            )}
        </div>
    );
}
