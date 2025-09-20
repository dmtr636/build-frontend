import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React, { useState } from "react";

import MapObjectsEditor, { MapObject } from "./Map/MapObjectsEditor";
import OlObjectsEditor from "src/features/journal/Map/OlObjectsEditor.tsx";

const initial: MapObject[] = [
    {
        id: "a1",
        name: "Объект А",
        marker: { lat: 55.751, lng: 37.618 },
        polygon: [
            { lat: 55.752, lng: 37.61 },
            { lat: 55.755, lng: 37.622 },
            { lat: 55.748, lng: 37.628 },
        ],
        color: "#1971c2",
    },
    {
        id: "b2",
        name: "Объект Б",
        marker: { lat: 55.759, lng: 37.58 },
        polygon: [
            { lat: 55.76, lng: 37.575 },
            { lat: 55.764, lng: 37.587 },
            { lat: 55.756, lng: 37.591 },
        ],
        color: "#2f9e44",
    },
];

export const JournalPage = observer(() => {
    const [objects, setObjects] = useState<MapObject[]>(initial);

    return (
        <div>
            <Helmet>
                <title>Журнал объектов – Build</title>
            </Helmet>
            <Typo variant={"h1"}>Журнал объектов</Typo>
            <div style={{ height: "80vh", width: "80vw" }}>
                {/*<MapObjectsEditor objects={objects} onObjectsChange={setObjects} height="100%" />*/}
                <OlObjectsEditor objects={objects} onObjectsChange={setObjects} height="100%" />
            </div>
        </div>
    );
});
