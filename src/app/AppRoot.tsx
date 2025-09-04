import { observer } from "mobx-react-lite";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { Outlet } from "react-router-dom";

export const AppRoot = observer(() => {
    return (
        <>
            <Outlet />
            <SnackbarProvider />
        </>
    );
});
