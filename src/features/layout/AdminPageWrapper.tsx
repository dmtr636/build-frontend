import React, { useEffect, useRef, useState } from "react";
import Header from "src/features/layout/components/Header/Header.tsx";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { appStore } from "src/app/AppStore.ts";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";

const AdminPageWrapper = observer(() => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overflowed, setOverflowed] = useState(false);

    useEffect(() => {
        appStore.userStore.fetchUsers();
        appStore.eventsStore.fetchEvents();
        appStore.organizationsStore.fetchOrganizations();
        const handleBeforeUnload = () => {
            appStore.accountStore.fetchUserIsOffline(true);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        const checkOverflowed = () => {
            setOverflowed(
                document.documentElement.scrollHeight > document.documentElement.clientHeight,
            );
        };

        const ro = new ResizeObserver(() => {
            checkOverflowed();
        });
        if (containerRef.current) {
            ro.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (containerRef.current) {
                ro.unobserve(containerRef.current);
            }
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
