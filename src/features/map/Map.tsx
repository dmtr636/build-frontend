import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    FeatureGroup,
    LayersControl,
    Tooltip,
} from "react-leaflet";
import L, { LatLngLiteral, PathOptions } from "leaflet";
import { EditControl } from "react-leaflet-draw";
const { BaseLayer } = LayersControl;
import "leaflet-draw";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import marker2xUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import markerUrl from "leaflet/dist/images/marker-icon.png?url";
import shadowUrl from "leaflet/dist/images/marker-shadow.png?url";

import styles from "./Map.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconMinus, IconPlus } from "src/ui/assets/icons";
import { Switch } from "src/ui/components/controls/Switch/Switch.tsx";
import { IconMapPin } from "src/features/map/assets";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { objectStore } from "src/app/AppStore.ts";

delete (L.Icon.Default as any).prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: IconMapPin,
    iconUrl: IconMapPin,
    iconSize: [40, 40],
    iconAnchor: [20, 30],
    popupAnchor: [0, -40],
    shadowSize: [50, 50],
    shadowUrl: "",
});

export type MapObject = {
    id: string;
    name: string;
    marker: LatLngLiteral;
    polygon: LatLngLiteral[];
    color?: string;
};

type Props = {
    objects: MapObject[];
    center?: LatLngLiteral;
    zoom?: number;
    height?: string | number;
    onObjectsChange?: (next: MapObject[]) => void;
    navigateOnClick?: boolean;
};

const centroid = (coords: LatLngLiteral[]): LatLngLiteral => {
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
    const arr = Array.isArray(latLngs[0]) ? (latLngs as L.LatLng[][])[0] : (latLngs as L.LatLng[]);
    return arr.map((p) => ({ lat: p.lat, lng: p.lng }));
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MapObjectsEditor({
    objects,
    center = { lat: 55.75, lng: 37.62 },
    zoom = 10,
    height = "calc(min(100vh - 250px, 850px))",
    onObjectsChange,
    navigateOnClick,
}: Props) {
    const objectsRef = useRef<MapObject[]>(objects);
    const mapRef = useRef<L.Map>(null);
    const [showSatellite, setShowSatellite] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    const [{ zoomNow, minZoomNow, maxZoomNow }, setZoomState] = useState({
        zoomNow: zoom,
        minZoomNow: -Infinity,
        maxZoomNow: Infinity,
    });

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

    const canZoomIn = Number.isFinite(maxZoomNow) && zoomNow < maxZoomNow;
    const canZoomOut = Number.isFinite(minZoomNow) && zoomNow > minZoomNow;

    const fgRef = useRef<L.FeatureGroup | null>(null);

    const layerToId = useRef(new Map<number, string>());

    const polyStyle = (obj: MapObject): PathOptions => ({
        color: obj.color ?? "#1971c2",
        weight: 2,
        fillOpacity: 0.2,
    });

    const emit = (next: MapObject[]) => onObjectsChange?.(next);

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

            const lid = L.Util.stamp(layer);
            layerToId.current.set(lid, newObj.id);

            fgRef.current?.removeLayer(layer);

            emit([...objectsRef.current, newObj]);
        }
    };

    const handleEdited = (e: any) => {
        const edited = new Map<string, LatLngLiteral[]>();

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

    const bindLayer = (objId: string) => (layer: L.Polygon | null) => {
        if (!layer) return;
        const lid = L.Util.stamp(layer);
        layerToId.current.set(lid, objId);
    };

    const onMarkerDragEnd = (objId: string) => (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const { lat, lng } = marker.getLatLng();
        const next = objectsRef.current.map((o) =>
            o.id === objId ? { ...o, marker: { lat, lng } } : o,
        );
        emit(next);
    };

    const mapCenter = useMemo(() => {
        if (objects.length > 0) return objects[0].marker ?? center;
        return center;
    }, [objects, center]);

    return (
        <div className={styles.mapWrapper}>
            <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={zoom}
                style={{ height, width: "100%" }}
                minZoom={9}
                zoomControl={false}
                maxBounds={[
                    [55.05, 36.45],
                    [56.35, 38.65],
                ]}
            >
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

                {objects.map((o) => (
                    <Marker
                        key={`m-${o.id}`}
                        position={o.marker}
                        // draggable
                        eventHandlers={{
                            dragend: onMarkerDragEnd(o.id),
                            click: () => {
                                if (!navigateOnClick) {
                                    return;
                                }
                                const object = objectStore.objects.find(
                                    (_o) => _o.objectNumber === o.id,
                                );
                                window.open(`/admin/journal/${object?.id}`, "_blank");
                            },
                        }}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -10]}
                            opacity={1}
                            sticky
                            className={styles.tooltip}
                        >
                            <FlexColumn gap={8}>
                                <Typo variant={"subheadM"} noWrap={true}>
                                    {o.name}
                                </Typo>
                                <Typo variant={"bodyM"} mode={"neutral"} type={"secondary"}>
                                    {o.id}
                                </Typo>
                            </FlexColumn>
                        </Tooltip>
                    </Marker>
                ))}

                <FeatureGroup ref={fgRef as any}>
                    {objects.map((o) => (
                        <Polygon
                            key={`p-${o.id}`}
                            positions={o.polygon}
                            pathOptions={polyStyle(o)}
                            ref={bindLayer(o.id)}
                            eventHandlers={{
                                click: () => {
                                    if (!navigateOnClick) {
                                        return;
                                    }
                                    const object = objectStore.objects.find(
                                        (_o) => _o.objectNumber === o.id,
                                    );
                                    window.open(`/admin/journal/${object?.id}`, "_blank");
                                },
                            }}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -10]}
                                opacity={1}
                                sticky
                                className={styles.tooltip}
                            >
                                <FlexColumn gap={8}>
                                    <Typo variant={"subheadM"} noWrap={true}>
                                        {o.name}
                                    </Typo>
                                    <Typo variant={"bodyM"} mode={"neutral"} type={"secondary"}>
                                        {o.id}
                                    </Typo>
                                </FlexColumn>
                            </Tooltip>
                        </Polygon>
                    ))}
                </FeatureGroup>
            </MapContainer>
            <Button
                mode={"contrast"}
                type={"primary"}
                iconBefore={<IconPlus />}
                size={"small"}
                onClick={() => {
                    mapRef.current?.zoomIn();
                }}
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
            <div className={styles.switchWrapper}>
                <Switch
                    mode={"primary"}
                    title={"Спутник"}
                    checked={showSatellite}
                    onChange={(value) => {
                        setShowSatellite(value);
                    }}
                />
            </div>
        </div>
    );
}
