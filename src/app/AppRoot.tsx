import { observer } from "mobx-react-lite";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { appStore } from "src/app/AppStore.ts";
import { LoadingScreen } from "src/ui/components/segments/LoadingScreen/LoadingScreen.tsx";
import AdminPageWrapper from "src/features/layout/AdminPageWrapper.tsx";

export const AppRoot = observer(() => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const onMount = async () => {
            const isAuthenticated = await appStore.accountStore.authenticate();
            if (!isAuthenticated) {
                navigate("/auth/login", { replace: true });
            } else if (!location.pathname.startsWith("/admin")) {
                navigate("/admin", { replace: true });
            }

            if (searchParams.has("overlay", "open") || searchParams.has("overlay2", "open")) {
                setSearchParams(
                    (params) => {
                        params.delete("overlay");
                        params.delete("overlay2");
                        return params;
                    },
                    { replace: true },
                );
            }

            setReady(true);
        };
        onMount();
    }, []);
    if (!ready) return <LoadingScreen />;

    return <AdminPageWrapper />;
});
