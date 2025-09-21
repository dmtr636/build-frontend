import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import React, { useEffect } from "react";
import styles from "./styles.module.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { registryStore } from "src/app/AppStore.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";

export const RegistryPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!registryStore.documents.length) {
            registryStore.fetchAllDocuments();
        }
    }, []);

    return (
        <div>
            <Helmet>
                <title>Справочники – Build</title>
            </Helmet>
            <div className={styles.subheader}>
                <Tabs
                    value={location.pathname.split("/").pop()}
                    onChange={(value) => {
                        navigate(`/admin/registry/${value}`);
                    }}
                    mode={"neutral"}
                    size={"small"}
                    tabs={[
                        {
                            name: "Нормативные документы",
                            value: "regulatory-documents",
                        },
                        {
                            name: "Нарушения",
                            value: "violations",
                        },
                        {
                            name: "Перечень работ",
                            value: "works",
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
