import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { layoutStore, registryStore } from "src/app/AppStore.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";

export const RegistryPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const [scrollBarWidth] = useState(getScrollBarWidth());

    return (
        <div>
            <Helmet>
                <title>Справочники – Build</title>
            </Helmet>
            <div
                className={styles.subheader}
                style={{
                    width: `calc(100vw - ${layoutStore.overflowed && !layoutStore.overflowHidden ? scrollBarWidth : 0}px)`,
                }}
            >
                <Tabs
                    value={location.pathname.split("/").pop()}
                    onChange={(value) => {
                        navigate(`/admin/dictionaries/${value}`);
                    }}
                    mode={"neutral"}
                    size={"small"}
                    tabs={[
                        {
                            name: "Нормативные документы",
                            value: "normative-documents",
                        },
                        {
                            name: "Нарушения",
                            value: "construction-violations",
                        },
                        {
                            name: "Перечень работ",
                            value: "construction-works",
                        },
                    ]}
                    style={{
                        marginBottom: -1,
                    }}
                    tabPaddingBottom={25}
                />
            </div>
            <div className={styles.container}>
                <Outlet />
            </div>
        </div>
    );
});
