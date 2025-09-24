import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React, { useEffect, useLayoutEffect, useState } from "react";
import styles from "./ObjectPage.module.scss";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { appStore, layoutStore, registryStore } from "src/app/AppStore.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { IconArrowLeft, IconBack } from "src/ui/assets/icons";

export const ObjectPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const [scrollBarWidth] = useState(getScrollBarWidth());
    const { id } = useParams();

    return (
        <div>
            <Helmet>
                <title>Объект – Build</title>
            </Helmet>
            <div
                className={styles.subheader}
                style={{
                    width: `calc(100vw - ${layoutStore.overflowed ? scrollBarWidth : 0}px)`,
                }}
            >
                <div className={styles.buttonBack} onClick={() => navigate(`/admin/journal`)}>
                    <div className={styles.buttonIcon}>
                        <IconBack />
                    </div>
                    Список объектов
                </div>
                <Tabs
                    value={location.pathname.split("/").pop()}
                    onChange={(value) => {
                        navigate(`/admin/journal/${id}/${value}`);
                    }}
                    mode={"neutral"}
                    size={"small"}
                    tabs={[
                        {
                            name: "Обзор",
                            value: "review",
                        },
                        {
                            name: "Об объекте",
                            value: "about",
                        },
                        {
                            name: "Документы",
                            value: "docs",
                        },
                        {
                            name: "Состав работ",
                            value: "status",
                        },
                        {
                            name: "Местоположение",
                            value: "positions",
                        },
                        {
                            name: "Участники",
                            value: "users",
                        },
                        {
                            name: "Материалы",
                            value: "materials",
                        },
                        {
                            name: "Визиты",
                            value: "visits",
                        },
                        {
                            name: "Замечания и нарушения",
                            value: "violations",
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
