import React, { useEffect } from "react";
import Header from "src/features/layout/components/Header/Header.tsx";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { appStore } from "src/app/AppStore.ts";
import styles from "./styles.module.scss";

const AdminPageWrapper = () => {
    useEffect(() => {
        appStore.userStore.fetchUsers();
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
};

export default AdminPageWrapper;
