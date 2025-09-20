import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React from "react";

export const RegistryPage = observer(() => {
    return (
        <div>
            <Helmet>
                <title>Реестр – Build</title>
            </Helmet>
            <Typo variant={"h1"}>Реестр</Typo>
        </div>
    );
});
