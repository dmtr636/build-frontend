import { observer } from "mobx-react-lite";
import styles from "./LocationPage.module.scss";
import { IconClose, IconDistance, IconPin, IconUp } from "src/ui/assets/icons";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { MapEditor, MapEditorValue } from "src/features/map/MapEditor.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { useParams } from "react-router-dom";
import { appStore, objectStore } from "src/app/AppStore.ts";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { CoordinateDTO } from "src/features/journal/types/Object.ts";
import { Helmet } from "react-helmet";

export const LocationPage = observer(() => {
    const [mapObj, setMapObj] = useState<MapEditorValue>({
        name: "",
        marker: null, // или { lat: ..., lng: ... }
        polygon: null, // или массив координат
        color: "#1971c2",
        address: {
            city: "",
            street: "",
            house: "",
        },
    });
    const [ready, setReady] = useState(false);
    const [showPolygon, setShowPolygon] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    useLayoutEffect(() => {
        setTimeout(() => {
            setMapObj({
                ...mapObj,
            });
        });
    }, []);

    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

    useEffect(() => {
        if (!currentObj || ready) {
            return;
        }
        setInitial();
        setTimeout(() => {
            mapObj.marker = null;
            mapObj.polygon = null;
            setMapObj({
                ...mapObj,
            });
        }, 15);
        setTimeout(() => {
            setInitial();
            setReady(true);
        }, 30);
    }, [currentObj]);

    const setInitial = () => {
        if (!currentObj) {
            return;
        }
        setMapObj({
            ...mapObj,
            name: currentObj.name,
            number: currentObj.objectNumber,
            marker: currentObj.centroid
                ? {
                      lat: currentObj.centroid.latitude,
                      lng: currentObj.centroid.longitude,
                  }
                : null,
            polygon: currentObj.polygon?.length
                ? currentObj.polygon.map((point) => ({
                      lat: point.latitude,
                      lng: point.longitude,
                  }))
                : null,
            address: currentObj.address
                ? deepCopy(currentObj.address)
                : {
                      city: "",
                      street: "",
                      house: "",
                  },
        });
    };

    const checkShowSaveButton = () => {
        if (!currentObj || !ready) {
            return false;
        }
        if (
            (currentObj.centroid?.longitude !== mapObj.marker?.lng &&
                !(!currentObj.centroid && mapObj.marker?.lng === 0)) ||
            (currentObj.centroid?.latitude !== mapObj.marker?.lat &&
                !(!currentObj.centroid && mapObj.marker?.lat === 0))
        ) {
            return true;
        }
        if (currentObj.polygon?.length && !mapObj.polygon?.length) {
            return true;
        }
        if (!currentObj.polygon?.length && mapObj.polygon?.length) {
            return true;
        }
        if (
            currentObj.polygon?.length &&
            mapObj.polygon?.length &&
            currentObj.polygon.some(
                (point, index) =>
                    point.latitude !== mapObj.polygon?.[index]?.lat ||
                    point.longitude !== mapObj.polygon?.[index]?.lng,
            )
        ) {
            return true;
        }
        if (
            currentObj.address?.city !== mapObj.address?.city ||
            currentObj.address?.street !== mapObj.address?.street ||
            currentObj.address?.house !== mapObj.address?.house
        ) {
            if (
                currentObj.address === null &&
                mapObj.address?.city === "" &&
                mapObj.address?.street === mapObj.address?.house
            ) {
                return false;
            }
            return true;
        }
        return false;
    };

    const checkDisabledSaveButton = () => {
        if (!currentObj) {
            return false;
        }
        if (mapObj.address?.street || mapObj.address?.house) {
            if (!mapObj.address?.city) {
                return true;
            }
        }
    };

    const showSaveButton = checkShowSaveButton();
    const disabledSaveButton = checkDisabledSaveButton();

    return (
        <div className={styles.container}>
            <Helmet>
                <title>{currentObj?.name}</title>
            </Helmet>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconDistance />
                </div>
                Местоположение
            </div>
            <div className={styles.grid}>
                <div className={styles.mapWrapper}>
                    <MapEditor
                        key={mapKey}
                        value={mapObj}
                        onChange={setMapObj}
                        height={459}
                        readyProp={ready}
                    />
                </div>
                <div className={styles.rightColumn}>
                    {((mapObj?.marker?.lng && mapObj.marker?.lat) ||
                        (!ready &&
                            currentObj?.centroid?.longitude &&
                            currentObj.centroid.latitude)) && (
                        <Button
                            type={"outlined"}
                            mode={"neutral"}
                            fullWidth={true}
                            iconBefore={<IconPin />}
                            onClick={() => {
                                mapObj.marker = null;
                                mapObj.polygon = null;
                                setMapObj({
                                    ...mapObj,
                                });
                                setTimeout(() => {
                                    setMapKey((mapKey) => ++mapKey);
                                }, 50);
                            }}
                        >
                            Убрать объект с карты
                        </Button>
                    )}
                    <div className={styles.card}>
                        <Typo variant={"subheadXL"} type={"quaternary"} mode={"neutral"}>
                            Адрес объекта
                        </Typo>
                        <FlexColumn gap={16}>
                            <Input
                                onChange={(event) => {
                                    if (mapObj?.address) {
                                        mapObj.address.city = event.target.value;
                                        setMapObj({
                                            ...mapObj,
                                        });
                                    }
                                }}
                                value={mapObj?.address?.city}
                                formName={"Город"}
                                placeholder={"Введите город"}
                            />
                            <Grid columns={"280px 1fr"} gap={12}>
                                <Input
                                    onChange={(event) => {
                                        if (mapObj?.address) {
                                            mapObj.address.street = event.target.value;
                                            setMapObj({
                                                ...mapObj,
                                            });
                                        }
                                    }}
                                    value={mapObj?.address?.street}
                                    formName={"Улица"}
                                    placeholder={"Введите улицу"}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (mapObj?.address) {
                                            mapObj.address.house = event.target.value;
                                            setMapObj({
                                                ...mapObj,
                                            });
                                        }
                                    }}
                                    value={mapObj?.address?.house}
                                    formName={"Номер дома"}
                                    placeholder={"..."}
                                />
                            </Grid>
                        </FlexColumn>
                    </div>
                    <div className={styles.card}>
                        <Typo variant={"subheadXL"} type={"quaternary"} mode={"neutral"}>
                            Координаты объекта
                        </Typo>
                        <FlexColumn gap={16}>
                            <Grid columns={"1fr 1fr"} gap={12}>
                                <Input
                                    onChange={(event) => {
                                        if (mapObj) {
                                            if (!mapObj.marker) {
                                                mapObj.marker = {
                                                    lat: 0,
                                                    lng: 0,
                                                };
                                            }
                                            mapObj.marker.lat = event.target.value
                                                ? Number(event.target.value)
                                                : 0;
                                            setMapObj({
                                                ...mapObj,
                                            });
                                        }
                                    }}
                                    value={mapObj?.marker?.lat || ""}
                                    formName={"Широта"}
                                    placeholder={"..."}
                                    number={true}
                                    readonly={true}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (mapObj) {
                                            if (!mapObj.marker) {
                                                mapObj.marker = {
                                                    lat: 0,
                                                    lng: 0,
                                                };
                                            }
                                            mapObj.marker.lng = event.target.value
                                                ? Number(event.target.value)
                                                : 0;
                                            setMapObj({
                                                ...mapObj,
                                            });
                                        }
                                    }}
                                    value={mapObj?.marker?.lng || ""}
                                    formName={"Долгота"}
                                    placeholder={"..."}
                                    number={true}
                                    readonly={true}
                                />
                            </Grid>
                            {(!mapObj?.marker?.lng || !mapObj.marker.lat) &&
                                (ready ||
                                    !currentObj?.centroid?.longitude ||
                                    !currentObj?.centroid.latitude) && (
                                    <Typo
                                        variant={"bodyM"}
                                        type={"tertiary"}
                                        mode={"neutral"}
                                        style={{
                                            marginTop: 16,
                                            marginBottom: -8,
                                        }}
                                    >
                                        Воспользуйтесь кнопкой «Разместить объект на карте», чтобы
                                        данные подставились в&nbsp;зависимости от выбранного места.
                                    </Typo>
                                )}
                        </FlexColumn>
                    </div>
                </div>
                {mapObj.marker?.lng && mapObj.marker.lat && (
                    <div className={styles.polygonContainer}>
                        <div>
                            {showPolygon && (
                                <Button
                                    type={"text"}
                                    size={"large"}
                                    iconBefore={<IconClose />}
                                    onClick={() => {
                                        setShowPolygon(false);
                                    }}
                                >
                                    Скрыть координаты полигона
                                </Button>
                            )}
                            {!showPolygon && (
                                <Button
                                    type={"text"}
                                    size={"large"}
                                    iconBefore={<IconUp style={{ transform: "rotate(-180deg)" }} />}
                                    onClick={() => {
                                        setShowPolygon(true);
                                    }}
                                >
                                    Показать координаты полигона
                                </Button>
                            )}
                        </div>
                        {showPolygon && (
                            <div className={styles.polygonCard}>
                                <FlexColumn gap={12}>
                                    <Flex>
                                        <Typo
                                            variant={"actionXL"}
                                            type={"tertiary"}
                                            mode={"neutral"}
                                        >
                                            Широта
                                        </Typo>
                                        <Typo
                                            variant={"actionXL"}
                                            type={"tertiary"}
                                            mode={"neutral"}
                                            className={styles.latitudeLabel}
                                            style={{
                                                marginLeft: 328,
                                            }}
                                        >
                                            Долгота
                                        </Typo>
                                    </Flex>
                                    {mapObj.polygon?.map((point, index, points) => (
                                        <PolygonPointRow
                                            key={index}
                                            point={{
                                                longitude: point.lng,
                                                latitude: point.lat,
                                            }}
                                            index={index}
                                            onDelete={
                                                points.length > 2
                                                    ? () => {
                                                          mapObj.polygon?.splice(index, 1);
                                                          setMapObj({
                                                              ...deepCopy(mapObj),
                                                          });
                                                      }
                                                    : undefined
                                            }
                                        />
                                    ))}
                                </FlexColumn>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {showSaveButton && (
                <div className={styles.footer}>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Button
                            mode={"neutral"}
                            type={"outlined"}
                            onClick={() => {
                                setInitial();
                                setTimeout(() => {
                                    setMapKey((mapKey) => ++mapKey);
                                    setTimeout(() => {
                                        setInitial();
                                    });
                                }, 50);
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            mode={"neutral"}
                            type={"primary"}
                            onClick={() => {
                                if (currentObj) {
                                    if (!mapObj.address?.city) {
                                        currentObj.address = null;
                                    } else {
                                        currentObj.address = mapObj.address ?? null;
                                    }
                                    if (!mapObj.marker?.lat || !mapObj.marker?.lng) {
                                        currentObj.centroid = null;
                                    } else {
                                        currentObj.centroid = {
                                            latitude: mapObj.marker.lat,
                                            longitude: mapObj.marker.lng,
                                        };
                                    }
                                    if (mapObj.polygon && mapObj.polygon.length) {
                                        currentObj.polygon = mapObj.polygon.map((point) => ({
                                            latitude: point.lat,
                                            longitude: point.lng,
                                        }));
                                    } else {
                                        currentObj.polygon = null;
                                    }
                                    objectStore.updateObject(currentObj);
                                    snackbarStore.showNeutralPositiveSnackbar(
                                        "Изменения сохранены",
                                    );
                                }
                            }}
                            disabled={disabledSaveButton}
                        >
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
});

export const PolygonPointRow = observer(
    (props: { point: CoordinateDTO; index: number; onDelete?: () => void }) => {
        return (
            <Grid columns={"12px 1fr 1fr"} gap={12} align={"center"}>
                <Typo
                    variant={"actionL"}
                    style={{
                        textAlign: "center",
                    }}
                >
                    {props.index + 1}
                </Typo>
                <Input
                    onChange={(event) => {
                        props.point.latitude = event.target.value ? Number(event.target.value) : 0;
                    }}
                    value={props.point.latitude || ""}
                    placeholder={"..."}
                    number={true}
                    readonly={true}
                />
                <Input
                    onChange={(event) => {
                        props.point.longitude = event.target.value ? Number(event.target.value) : 0;
                    }}
                    value={props.point.longitude || ""}
                    placeholder={"..."}
                    number={true}
                    readonly={true}
                />
            </Grid>
        );
    },
);
