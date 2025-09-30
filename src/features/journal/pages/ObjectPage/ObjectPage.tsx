import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React, { useEffect, useLayoutEffect, useState } from "react";
import styles from "./ObjectPage.module.scss";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    accountStore,
    appStore,
    layoutStore,
    registryStore,
    worksStore,
} from "src/app/AppStore.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { IconArrowLeft, IconBack } from "src/ui/assets/icons";

export const ObjectPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const [scrollBarWidth] = useState(getScrollBarWidth());
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");
    const isMobile = layoutStore.isMobile;
    useLayoutEffect(() => {
        layoutStore.setHeaderProps({ title: currentObj?.name ?? "Объект", buttonBack: true });
    }, [currentObj]);
    return (
        <div>
            <Helmet>
                <title>{currentObj?.name}</title>
            </Helmet>
            {!isMobile && (
                <div
                    className={styles.subheader}
                    style={{
                        width: `calc(100vw - ${layoutStore.overflowed && !layoutStore.overflowHidden ? scrollBarWidth : 0}px)`,
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
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Документы",
                                value: "docs",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Состав работ",
                                value: "status",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Местоположение",
                                value: "location",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Участники",
                                value: "users",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Материалы",
                                value: "materials",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Визиты",
                                value: "visits",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                            {
                                name: "Замечания и нарушения",
                                value: "violations",
                                disabled:
                                    worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS" &&
                                    !accountStore.isAdmin,
                            },
                        ]}
                        style={{
                            marginBottom: -1,
                        }}
                        tabPaddingBottom={25}
                    />
                </div>
            )}
            <div className={styles.container}>
                <Outlet />
            </div>
        </div>
    );
});
