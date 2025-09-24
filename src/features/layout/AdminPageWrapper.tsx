import React, { useEffect, useRef, useState } from "react";
import Header from "src/features/layout/components/Header/Header.tsx";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { appStore, layoutStore, objectStore } from "src/app/AppStore.ts";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { throttle } from "src/shared/utils/throttle.ts";

const AdminPageWrapper = observer(() => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        appStore.userStore.fetchUsers();
        appStore.organizationsStore.fetchOrganizations();
        appStore.registryStore.fetchAllDocuments();
        appStore.registryStore.fetchAllViolations();
        appStore.registryStore.fetchAllWorks();
        appStore.websocketStore.connectToSocket();
        appStore.objectStore.fetchObjects();

        const handleBeforeUnload = () => {
            appStore.accountStore.fetchUserIsOffline(true);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        const checkOverflowed = () => {
            layoutStore.overflowed =
                document.documentElement.scrollHeight > document.documentElement.clientHeight;
        };

        const checkScrolling = throttle(() => {
            layoutStore.scrolled = document.documentElement.scrollTop > 0;
            layoutStore.scrollTop = document.documentElement.scrollTop;
        }, 50);

        const ro = new ResizeObserver(() => {
            checkOverflowed();
        });
        if (containerRef.current) {
            ro.observe(containerRef.current);
        }
        document.addEventListener("scroll", checkScrolling);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("scroll", checkScrolling);
            if (containerRef.current) {
                ro.unobserve(containerRef.current);
            }
            appStore.websocketStore.closeSocket();
        };
    }, []);

    return (
        <div ref={containerRef}>
            <Header />
            <div className={styles.container}>
                <Outlet />
            </div>
            <SnackbarProvider centered={true} />
        </div>
    );
});

export default AdminPageWrapper;
