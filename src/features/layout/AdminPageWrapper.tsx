import React, { useEffect, useRef, useState } from "react";
import Header from "src/features/layout/components/Header/Header.tsx";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import {
    accountStore,
    appStore,
    layoutStore,
    notificationStore,
    objectStore,
} from "src/app/AppStore.ts";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { ProgressBar } from "src/ui/components/solutions/ProgressBar/ProgressBar.tsx";
import { throttle } from "src/shared/utils/throttle.ts";
import { fileStore } from "src/features/users/stores/FileStore.ts";
import HeaderMobile from "src/features/layout/components/HeaderMobile/HeaderMobile.tsx";
import Footer from "src/features/layout/components/Footer/Footer.tsx";
import { IconApartment, IconUser } from "src/ui/assets/icons";

const AdminPageWrapper = observer(() => {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentUser = appStore.accountStore.currentUser;
    const isMobile = layoutStore.isMobile;
    const mobileData = layoutStore.headerProps;
    useEffect(() => {
        appStore.userStore.fetchUsers();
        appStore.organizationsStore.fetchOrganizations();
        appStore.violationStore.fetchAllViolations();
        appStore.registryStore.fetchAllDocuments();
        appStore.registryStore.fetchAllViolations();
        appStore.registryStore.fetchAllWorks();
        appStore.websocketStore.connectToSocket();
        appStore.objectStore.fetchObjects();
        appStore.notificationStore.fetchUnreadNotifications();

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
    useEffect(() => {
        const dispose = accountStore.bindRoleHotkeys();
        return dispose; // снимем хэндлер при размонтировании
    }, []);
    return (
        <div ref={containerRef}>
            {!isMobile && <Header />}
            {isMobile && <HeaderMobile {...mobileData} />}
            <div className={styles.container}>
                <Outlet />
            </div>
            <Footer
                actions={[
                    { name: "Объекты", icon: <IconApartment />, to: "/admin/journal" },
                    { name: "Профиль", icon: <IconUser />, to: `/admin/users/${currentUser?.id}` },
                ]}
            />
            <SnackbarProvider centered={true} />
            <ProgressBar
                show={fileStore.uploading}
                title={"Загрузка файла..."}
                text={fileStore.uploadingFileName}
                progress={Math.min(fileStore.uploadProgressPercent, 99)}
                onCancel={() => {
                    fileStore.uploadAbortController.abort();
                    fileStore.uploading = false;
                }}
            />
        </div>
    );
});

export default AdminPageWrapper;
