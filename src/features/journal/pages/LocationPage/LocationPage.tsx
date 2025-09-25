import { observer } from "mobx-react-lite";
import styles from "./LocationPage.module.scss";
import { IconDistance, IconPin } from "src/ui/assets/icons";
import React, { useEffect, useLayoutEffect, useState } from "react";
import MapEditor, { MapEditorValue } from "src/features/map/MapEditor.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { useParams } from "react-router-dom";
import { appStore, objectStore } from "src/app/AppStore.ts";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";

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

    useLayoutEffect(() => {
        if (!appStore.objectStore.objects.length) {
            appStore.objectStore.fetchObjects();
        }
        setTimeout(() => {
            setMapObj({
                ...mapObj,
            });
        });
    }, []);

    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

    useEffect(() => {
        if (!currentObj) {
            return;
        }
        setInitial();
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
        if (!currentObj) {
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
        )
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
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconDistance />
                </div>
                Местоположение
            </div>
            <div className={styles.grid}>
                <div className={styles.mapWrapper}>
                    <MapEditor value={mapObj} onChange={setMapObj} height={459} />
                </div>
                <div className={styles.rightColumn}>
                    {mapObj?.marker?.lng && mapObj.marker?.lat && (
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
                                />
                            </Grid>
                            {(!mapObj?.marker?.lng || !mapObj.marker.lat) && (
                                <Typo
                                    variant={"bodyM"}
                                    type={"tertiary"}
                                    mode={"neutral"}
                                    style={{
                                        marginTop: -2,
                                        marginBottom: -7,
                                    }}
                                >
                                    Введите координаты вручную или воспользуйтесь кнопкой
                                    «Разместить объект на карте», чтобы данные подставились
                                    в&nbsp;зависимости от выбранного места.
                                </Typo>
                            )}
                        </FlexColumn>
                    </div>
                </div>
            </div>
            {showSaveButton && (
                <div className={styles.footer}>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Button
                            mode={"neutral"}
                            type={"outlined"}
                            onClick={() => {
                                setInitial();
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
