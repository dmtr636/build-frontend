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
import { IconBasket, IconClose, IconMinus, IconPin, IconPlus } from "src/ui/assets/icons";
import { Switch } from "src/ui/components/controls/Switch/Switch.tsx";
import { IconMapPin } from "src/features/map/assets";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { AddressDTO } from "src/features/journal/types/Object.ts";
import { observer } from "mobx-react-lite";

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
    number?: string;
    marker?: LatLngLiteral | null;
    polygon?: LatLngLiteral[] | null;
    color?: string;
    address?: AddressDTO | null;
};

type Props = {
    value: MapEditorValue;
    onChange: (next: MapEditorValue) => void;
    center?: LatLngLiteral;
    zoom?: number;
    height?: string | number;
    bounds?: [[number, number], [number, number]];
    readyProp?: boolean;
    editable?: boolean;
    selectingPoint?: boolean;
    disableSatellite?: boolean;
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

const EDIT_COLOR = "#FA0032";

const polyStyle: PathOptions = {
    color: EDIT_COLOR,
    weight: 2,
    dashArray: "6 4", // пунктир
    fillOpacity: 0.1,
    fillColor: EDIT_COLOR,
};

export const MapEditor = observer(
    ({
        value,
        onChange,
        center = { lat: 55.75, lng: 37.62 },
        zoom = 10,
        height = "75vh",
        bounds = [
            [55.05, 36.45],
            [56.35, 38.65],
        ],
        readyProp,
        editable,
        selectingPoint,
        disableSatellite,
    }: Props) => {
        const mapRef = useRef<L.Map>(null);
        const polygonLayerRef = useRef<L.Polygon | null>(null);
        const isEditingRef = useRef(false);
        const valueRef = useRef(value);
        const [ready, setReady] = useState(false);

        useEffect(() => {
            valueRef.current = value;
        }, [value]);

        const [{ zoomNow, minZoomNow, maxZoomNow }, setZoomState] = useState({
            zoomNow: zoom,
            minZoomNow: -Infinity,
            maxZoomNow: Infinity,
        });
        const workGroupRef = useRef<L.FeatureGroup | null>(null);

        useEffect(() => {
            const map = mapRef.current;
            if (!map || !ready) return;

            const updateZoomState = () => {
                setZoomState({
                    zoomNow: map.getZoom() ?? 0,
                    minZoomNow: map.getMinZoom() ?? -Infinity,
                    maxZoomNow: map.getMaxZoom() ?? Infinity,
                });
            };

            updateZoomState();

            map.on("zoomend", updateZoomState);
            map.on("zoomlevelschange", updateZoomState);
            map.on("baselayerchange", updateZoomState);

            return () => {
                map.off("zoomend", updateZoomState);
                map.off("zoomlevelschange", updateZoomState);
                map.off("baselayerchange", updateZoomState);
            };
        }, [ready]);

        useEffect(() => {
            const map = mapRef.current;
            if (!map || !ready) return;

            const el = map.getContainer();

            const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
            const updateScale = () => {
                const z = map.getZoom();
                const zMin = map.getMinZoom() ?? 3;
                const zMax = map.getMaxZoom() ?? 20;

                // исходная линейка 0.65..1.15
                const s0 = 0.65 + ((z - zMin) / Math.max(1, zMax - zMin)) * (1.15 - 0.65);

                // УСИЛЕНИЕ ×2 относительно 1.0
                const INTENSITY = 3;
                const sAmp = 2 + INTENSITY * (s0 - 1);

                // мягкие ограничения, чтобы точки не становились слишком мелкими/огромными
                const s = clamp(sAmp, 0.4, 1.4);

                el.style.setProperty("--vertex-scale", s.toFixed(3));
            };

            updateScale();
            map.on("zoomend", updateScale);
            map.on("zoomlevelschange", updateScale); // на случай смены слоя с другим maxZoom
            map.on("baselayerchange", updateScale);

            return () => {
                map.off("zoomend", updateScale);
                map.off("zoomlevelschange", updateScale);
                map.off("baselayerchange", updateScale);
            };
        }, [ready]);

        const canZoomIn = Number.isFinite(maxZoomNow) && zoomNow < maxZoomNow;
        const canZoomOut = Number.isFinite(minZoomNow) && zoomNow > minZoomNow;

        const [showSatellite, setShowSatellite] = useState(false);
        const [placing, setPlacing] = useState(false);

        useEffect(() => {
            if (!polygonLayerRef.current) return;
            if (isEditingRef.current) return; // не трогаем во время живого редактирования
            (polygonLayerRef.current as any).setLatLngs(value.polygon ?? []);
            (polygonLayerRef.current as any).setStyle(polyStyle);
            (polygonLayerRef.current as any).redraw?.();
        }, [value.polygon, polyStyle]);

        const mapCenter = useMemo(() => value.marker ?? center, [value.marker, center]);

        const commit = useCallback(
            (patch: Partial<MapEditorValue>) => {
                const value = { ...valueRef.current, ...patch };
                if (value.marker?.lat) {
                    value.marker.lat = Math.round(value.marker.lat * 100000) / 100000;
                }
                if (value.marker?.lng) {
                    value.marker.lng = Math.round(value.marker.lng * 100000) / 100000;
                }
                if (value.polygon) {
                    value.polygon = value.polygon.map((p) => ({
                        lat: Math.round(p.lat * 100000) / 100000,
                        lng: Math.round(p.lng * 100000) / 100000,
                    }));
                }
                onChange({ ...value });
            },
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

        // Храним предыдущее «пусто/не пусто»
        // было выше в коде
        const prevIsEmptyRef = useRef<boolean>(!value.polygon || value.polygon.length === 0);

        useEffect(() => {
            const map = mapRef.current;
            if (!map) return;

            const isEmpty = !value.polygon || value.polygon.length === 0;
            const wasEmpty = prevIsEmptyRef.current;
            const justInitialized = wasEmpty && !isEmpty; // null/[] -> массив
            const justCleared = !wasEmpty && isEmpty; // массив -> null/[]

            // 🚫 Во время редактирования не делаем НИЧЕГО с самим слоем
            if (isEditingRef.current) {
                prevIsEmptyRef.current = isEmpty;
                return;
            }

            // --- CLEAR ---
            if (isEmpty) {
                if (polygonLayerRef.current) {
                    const layer: any = polygonLayerRef.current;
                    try {
                        layer.editing?.disable?.();
                    } catch (e) {
                        console.error(e);
                    }
                    try {
                        layer.off?.();
                    } catch (e) {
                        console.error(e);
                    }
                    try {
                        map.removeLayer(layer);
                    } catch (e) {
                        console.error(e);
                    }
                    polygonLayerRef.current = null;
                }
                if (justCleared) purgeLeafletEditingArtifacts(map); // только в момент очистки
                prevIsEmptyRef.current = true;
                return;
            }

            // --- INIT ---
            if (!polygonLayerRef.current) {
                if (justInitialized) purgeLeafletEditingArtifacts(map); // только в момент инициализации

                const layer = L.polygon(value.polygon!, polyStyle).addTo(map);
                polygonLayerRef.current = layer as L.Polygon;

                if (editable ?? true) {
                    if (!selectingPoint) {
                        (layer as any).editing?.enable?.();
                    }
                }

                layer.on("editstart", () => {
                    isEditingRef.current = true;
                });

                // при каждом движении вершин — отдаем наружу; сам слой не трогаем
                layer.on("edit", () => {
                    const coords = toCoords((layer as any).getLatLngs());
                    commit({ polygon: coords });
                });

                layer.on("editend", () => {
                    const coords = toCoords((layer as any).getLatLngs());
                    isEditingRef.current = false; // теперь можно снова реагировать в эффекте
                    // зафиксируем на слое финальные точки (без внешних value)
                    (layer as any).setLatLngs(coords);
                    (layer as any).redraw?.();
                    commit({ polygon: coords });
                });
            } else {
                // слой существует, и редактирование сейчас не идет — можно обновить ТОЛЬКО стиль
                (polygonLayerRef.current as any).setStyle?.(polyStyle);
                (polygonLayerRef.current as any).redraw?.();
            }

            // страхуемся: если кто-то извне снял слой
            if (polygonLayerRef.current && !map.hasLayer(polygonLayerRef.current)) {
                polygonLayerRef.current = null;
            }

            prevIsEmptyRef.current = false;
        }, [value.polygon, value.color]); // важно: координаты не проталкиваем пока слой живет

        // Удаляем ВСЕ временные маркеры-вершины редактирования на карте
        const purgeLeafletEditingArtifacts = (map: L.Map) => {
            const toRemove: L.Layer[] = [];
            map.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    const cls =
                        layer.options?.icon?.options?.className ??
                        (layer as any)?._icon?.className ??
                        "";

                    // Иконки вершин у разных версий:
                    // - leaflet core: "leaflet-editing-icon"
                    // - leaflet.draw: "leaflet-draw-edit-move", "leaflet-draw-edit-remove" и т.п.
                    if (
                        cls.includes("leaflet-editing-icon") ||
                        cls.includes("leaflet-draw-edit-move") ||
                        cls.includes("leaflet-draw-edit-remove") ||
                        cls.includes("leaflet-draw-edit-vertex")
                    ) {
                        toRemove.push(layer);
                    }
                }
            });
            toRemove.forEach((l) => {
                try {
                    map.removeLayer(l);
                } catch (e) {
                    console.error(e);
                }
            });
        };

        return (
            <div className={styles.mapWrapper}>
                <MapContainer
                    ref={mapRef}
                    whenReady={() => setReady(true)}
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
                        <Marker
                            position={value.marker}
                            draggable={editable ?? true}
                            eventHandlers={markerHandlers}
                        >
                            {value.name && (
                                <Tooltip
                                    direction="top"
                                    offset={[-16, -10]}
                                    opacity={1}
                                    className={styles.tooltip}
                                >
                                    <FlexColumn gap={8}>
                                        <Typo variant={"subheadM"} noWrap={true}>
                                            {value.name}
                                        </Typo>
                                        {value.number && (
                                            <Typo
                                                variant={"bodyM"}
                                                mode={"neutral"}
                                                type={"secondary"}
                                            >
                                                {value.number}
                                            </Typo>
                                        )}
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
                        opacity: canZoomIn ? 1 : 0.7,
                        pointerEvents: canZoomIn ? undefined : "none",
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
                        opacity: canZoomOut ? 1 : 0.7,
                        pointerEvents: canZoomOut ? undefined : "none",
                    }}
                />

                {!disableSatellite && (
                    <div className={styles.switchWrapper}>
                        <Switch
                            mode={"primary"}
                            title={"Спутник"}
                            checked={showSatellite}
                            onChange={setShowSatellite}
                        />
                    </div>
                )}

                {!value.marker && !placing && readyProp && (
                    <Button
                        type={"primary"}
                        mode={"contrast"}
                        size={"large"}
                        onClick={handlePlaceRequest}
                        iconBefore={<IconPin />}
                        style={{
                            position: "absolute",
                            left: disableSatellite ? 12 : undefined,
                            right: 12,
                            bottom: 12,
                            zIndex: 600,
                            boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                        }}
                    >
                        {selectingPoint ? "Отметить место" : "Разместить объект на карте"}
                    </Button>
                )}
                {placing && (
                    <Button
                        type={"primary"}
                        mode={"neutral"}
                        size={"large"}
                        onClick={() => {
                            setPlacing(false);
                        }}
                        iconBefore={<IconClose />}
                        className={styles.cancelButton}
                        style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            zIndex: 600,
                            boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                        }}
                    >
                        Отменить
                    </Button>
                )}
                {selectingPoint && value.marker?.lat && (
                    <Button
                        type={"primary"}
                        mode={"neutral"}
                        size={"large"}
                        onClick={() => {
                            onChange({
                                ...value,
                                marker: null,
                            });
                        }}
                        iconBefore={<IconBasket />}
                        className={styles.cancelButton}
                        style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            zIndex: 600,
                            boxShadow: "0 8px 20px 1px rgba(17, 19, 23, 0.12)",
                        }}
                    >
                        Очистить точку
                    </Button>
                )}
                {placing && (
                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            left: disableSatellite ? undefined : 0,
                            right: disableSatellite ? 12 : 0,
                            zIndex: 600,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                background: "white",
                                borderRadius: 8,
                                padding: "8px 12px",
                                boxShadow: "0 1px 3px 0 rgba(17, 19, 23, 0.12)",
                            }}
                        >
                            <Typo variant={"subheadM"}>Кликните по карте для выбора точки</Typo>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);
