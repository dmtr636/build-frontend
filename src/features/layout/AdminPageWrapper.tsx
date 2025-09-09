import React, { useEffect } from "react";
import Header from "src/features/layout/components/Header/Header.tsx";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { appStore } from "src/app/AppStore.ts";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";

const AdminPageWrapper = observer(() => {
    useEffect(() => {
        appStore.userStore.fetchUsers();
        const handleBeforeUnload = () => {
            console.log("sendBeacon отправлен?"); // true/false
            appStore.accountStore.fetchUserIsOffline(true); // используем sendBeacon
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    return (
        <>
            <Header />
            <div className={styles.container}>
                <Outlet />
            </div>
            <SnackbarProvider />
        </>
    );
});

export default AdminPageWrapper;
