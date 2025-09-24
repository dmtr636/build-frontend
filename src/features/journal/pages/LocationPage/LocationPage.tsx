import { observer } from "mobx-react-lite";
import styles from "./LocationPage.module.scss";
import { IconApartment, IconDistance } from "src/ui/assets/icons";
import React, { useState } from "react";
import MapEditor, { MapEditorValue } from "src/features/map/MapEditor.tsx";

export const LocationPage = observer(() => {
    const [obj, setObj] = useState<MapEditorValue>({
        name: "Объект 1",
        marker: null, // или { lat: ..., lng: ... }
        polygon: null, // или массив координат
        color: "#1971c2",
    });

    console.log(obj);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconDistance />
                </div>
                Местоположение
            </div>
            <div className={styles.mapWrapper}>
                <MapEditor value={obj} onChange={setObj} />
            </div>
        </div>
    );
});
