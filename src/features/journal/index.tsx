import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React from "react";

export const JournalPage = observer(() => {
    return (
        <div>
            <Helmet>
                <title>Журнал объектов – Build</title>
            </Helmet>
            <Typo variant={"h1"}>Журнал объектов</Typo>
        </div>
    );
});
