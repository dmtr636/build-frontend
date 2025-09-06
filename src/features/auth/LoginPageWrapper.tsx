import { LoginPage } from "src/ui/components/pages/login/LoginPage/LoginPage.tsx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { appStore } from "src/app/AppStore.ts";

export const LoginPageWrapper = observer(() => {
    useEffect(() => {
        const onMount = async () => {
            if (appStore.accountStore.initialized) {
                return;
            }
            const isAuthenticated = await appStore.accountStore.authenticate();
            if (isAuthenticated) {
                location.pathname = "/admin/home";
            }
        };
        onMount();
    }, []);

    return <LoginPage onLogin={() => (location.pathname = "/admin/home")} recover={false} />;
});
