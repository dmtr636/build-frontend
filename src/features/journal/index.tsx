import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React from "react";
import TestGantt from "src/features/gantt";
import { TestGantt2 } from "src/features/gantt/test.tsx";

export const JournalPage = observer(() => {
    return (
        <div>
            <Helmet>
                <title>Журнал – Build</title>
            </Helmet>
            <Typo variant={"h1"}>Журнал</Typo>
            <TestGantt />
            <TestGantt2 />
        </div>
    );
});
