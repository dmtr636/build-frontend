import { observer } from "mobx-react-lite";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "src/features/layout/components/Header/Header.tsx";
import { useEffect, useState } from "react";
import { accountStore, appStore } from "src/app/AppStore.ts";
import { LoadingScreen } from "src/ui/components/segments/LoadingScreen/LoadingScreen.tsx";
import AdminPageWrapper from "src/features/layout/AdminPageWrapper.tsx";

export const AppRoot = observer(() => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const onMount = async () => {
            const isAuthenticated = await appStore.accountStore.authenticate();
            if (!isAuthenticated) {
                navigate("/auth/login", { replace: true });
            } else if (!location.pathname.startsWith("/admin")) {
                navigate("/admin", { replace: true });
            }

            setReady(true);
        };
        onMount();
    }, []);
    if (!ready) return <LoadingScreen />;

    return <AdminPageWrapper />;
});
